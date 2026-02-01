// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Phone Camera Connector
// Connect to iPhone/Android camera apps over WiFi (Camo, EpocCam, iVCam, etc.)
// ═══════════════════════════════════════════════════════════════════════════

import { EventEmitter } from 'events';
import http from 'http';
import https from 'https';
import { Jimp } from 'jimp';
import { ASCII_CHARS, VIDEO_WIDTH, VIDEO_HEIGHT, VIDEO_FPS } from '../core/constants.js';

const ASCII_MAP = ASCII_CHARS.split('');

interface PhoneCameraOptions {
  width?: number;
  height?: number;
  fps?: number;
}

export class PhoneCamera extends EventEmitter {
  private url: string = '';
  private width: number;
  private height: number;
  private fps: number;
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private frameInterval: NodeJS.Timeout | null = null;
  private currentFrame: string[][] = [];
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private abortController: AbortController | null = null;

  constructor(options: PhoneCameraOptions = {}) {
    super();
    this.width = options.width || VIDEO_WIDTH;
    this.height = options.height || VIDEO_HEIGHT;
    this.fps = options.fps || VIDEO_FPS;
    this.initEmptyFrame();
  }

  private initEmptyFrame(): void {
    this.currentFrame = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(' '));
  }

  // Connect to phone camera stream
  async connect(url: string): Promise<boolean> {
    if (this.isConnecting) {
      return false;
    }

    this.isConnecting = true;
    this.url = this.normalizeUrl(url);
    this.retryCount = 0;

    try {
      // Test connection first
      const testResult = await this.testConnection();
      if (!testResult.success) {
        this.emit('error', { message: testResult.error });
        this.isConnecting = false;
        return false;
      }

      this.isConnected = true;
      this.isConnecting = false;
      this.emit('connected', { url: this.url, type: testResult.type });

      // Start frame capture loop
      this.startCapture(testResult.type);
      return true;

    } catch (error) {
      this.emit('error', { message: `Connection failed: ${error}` });
      this.isConnecting = false;
      return false;
    }
  }

  // Normalize URL format
  private normalizeUrl(url: string): string {
    // Add http:// if no protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url;
    }
    return url;
  }

  // Test connection and detect stream type
  private async testConnection(): Promise<{ success: boolean; type?: string; error?: string }> {
    return new Promise((resolve) => {
      const isHttps = this.url.startsWith('https://');
      const client = isHttps ? https : http;

      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'Connection timeout' });
      }, 5000);

      try {
        const req = client.get(this.url, { timeout: 5000 }, (res) => {
          clearTimeout(timeout);

          const contentType = res.headers['content-type'] || '';

          // Detect stream type
          if (contentType.includes('multipart/x-mixed-replace')) {
            resolve({ success: true, type: 'mjpeg' });
          } else if (contentType.includes('image/jpeg') || contentType.includes('image/png')) {
            resolve({ success: true, type: 'snapshot' });
          } else if (contentType.includes('video/')) {
            resolve({ success: true, type: 'video' });
          } else {
            // Try to detect by reading some data
            resolve({ success: true, type: 'mjpeg' }); // Default to MJPEG
          }

          res.destroy();
        });

        req.on('error', (err) => {
          clearTimeout(timeout);
          resolve({ success: false, error: err.message });
        });

        req.on('timeout', () => {
          clearTimeout(timeout);
          req.destroy();
          resolve({ success: false, error: 'Connection timeout' });
        });

      } catch (error) {
        clearTimeout(timeout);
        resolve({ success: false, error: String(error) });
      }
    });
  }

  // Start capturing frames
  private startCapture(streamType: string): void {
    if (streamType === 'mjpeg') {
      this.startMjpegCapture();
    } else {
      this.startSnapshotCapture();
    }
  }

  // Capture MJPEG stream (continuous)
  private startMjpegCapture(): void {
    const isHttps = this.url.startsWith('https://');
    const client = isHttps ? https : http;

    const connect = () => {
      if (!this.isConnected) return;

      const req = client.get(this.url, { timeout: 10000 }, (res) => {
        let buffer = Buffer.alloc(0);
        const boundary = this.extractBoundary(res.headers['content-type'] || '');

        res.on('data', (chunk: Buffer) => {
          buffer = Buffer.concat([buffer, chunk]);

          // Find JPEG frames in buffer
          const frames = this.extractJpegFrames(buffer, boundary);
          if (frames.length > 0) {
            const lastFrame = frames[frames.length - 1];
            this.processJpegFrame(lastFrame).catch(() => { /* frame skipped */ });

            // Keep remaining buffer
            const lastIndex = buffer.lastIndexOf(Buffer.from('\r\n--'));
            if (lastIndex > 0) {
              buffer = buffer.slice(lastIndex);
            }
          }

          // Prevent buffer from growing too large
          if (buffer.length > 1024 * 1024) {
            buffer = buffer.slice(-512 * 1024);
          }
        });

        res.on('end', () => {
          if (this.isConnected && this.retryCount < this.maxRetries) {
            this.retryCount++;
            setTimeout(connect, 1000);
          }
        });

        res.on('error', (err) => {
          this.emit('error', { message: `Stream error: ${err.message}` });
          if (this.isConnected && this.retryCount < this.maxRetries) {
            this.retryCount++;
            setTimeout(connect, 1000);
          }
        });
      });

      req.on('error', (err) => {
        this.emit('error', { message: `Request error: ${err.message}` });
        if (this.isConnected && this.retryCount < this.maxRetries) {
          this.retryCount++;
          setTimeout(connect, 1000);
        }
      });
    };

    connect();
  }

  // Capture snapshots at interval
  private startSnapshotCapture(): void {
    const captureFrame = () => {
      if (!this.isConnected) return;

      const isHttps = this.url.startsWith('https://');
      const client = isHttps ? https : http;

      const req = client.get(this.url, { timeout: 5000 }, (res) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          this.processJpegFrame(buffer).catch(() => { /* frame skipped */ });
        });

        res.on('error', () => {
          // Silent fail, will retry next interval
        });
      });

      req.on('error', () => {
        // Silent fail, will retry next interval
      });
    };

    // Capture at specified FPS
    this.frameInterval = setInterval(captureFrame, 1000 / this.fps);
    captureFrame(); // Capture first frame immediately
  }

  // Extract boundary from content-type header
  private extractBoundary(contentType: string): string {
    const match = contentType.match(/boundary=([^;]+)/);
    return match ? match[1] : '--myboundary';
  }

  // Extract JPEG frames from MJPEG buffer
  private extractJpegFrames(buffer: Buffer, boundary: string): Buffer[] {
    const frames: Buffer[] = [];
    const jpegStart = Buffer.from([0xFF, 0xD8]); // JPEG SOI marker
    const jpegEnd = Buffer.from([0xFF, 0xD9]);   // JPEG EOI marker

    let startIndex = 0;
    while (startIndex < buffer.length) {
      const soiIndex = buffer.indexOf(jpegStart, startIndex);
      if (soiIndex === -1) break;

      const eoiIndex = buffer.indexOf(jpegEnd, soiIndex);
      if (eoiIndex === -1) break;

      const frame = buffer.slice(soiIndex, eoiIndex + 2);
      frames.push(frame);
      startIndex = eoiIndex + 2;
    }

    return frames;
  }

  // Process JPEG frame and convert to ASCII using Jimp
  private async processJpegFrame(jpegBuffer: Buffer): Promise<void> {
    try {
      const asciiFrame = await this.jpegToAscii(jpegBuffer);
      this.currentFrame = asciiFrame;
      this.emit('frame', asciiFrame);
    } catch (error) {
      // Skip malformed frames silently
    }
  }

  // Convert JPEG buffer to ASCII art using Jimp for proper decoding
  private async jpegToAscii(jpegBuffer: Buffer): Promise<string[][]> {
    const result: string[][] = [];

    try {
      // Read JPEG using Jimp
      const image = await Jimp.read(jpegBuffer);

      // Resize to target dimensions
      image.resize({ w: this.width, h: this.height });

      // Convert to greyscale (note: British spelling in Jimp)
      image.greyscale();

      // Convert each pixel to ASCII character
      for (let y = 0; y < this.height; y++) {
        const row: string[] = [];
        for (let x = 0; x < this.width; x++) {
          // Get pixel color (grayscale, so R=G=B)
          const pixelColor = image.getPixelColor(x, y);
          // Extract red channel (since greyscale, R=G=B)
          const brightness = (pixelColor >> 24) & 0xFF;

          // Map brightness to ASCII character
          const charIndex = Math.floor((brightness / 255) * (ASCII_MAP.length - 1));
          row.push(ASCII_MAP[charIndex]);
        }
        result.push(row);
      }
    } catch (error) {
      // If Jimp fails, return empty frame
      for (let y = 0; y < this.height; y++) {
        result.push(new Array(this.width).fill(' '));
      }
    }

    return result;
  }

  // Get current frame
  getCurrentFrame(): string[][] {
    return this.currentFrame;
  }

  // Check if connected
  getIsConnected(): boolean {
    return this.isConnected;
  }

  // Get connection URL
  getUrl(): string {
    return this.url;
  }

  // Disconnect from camera
  disconnect(): void {
    this.isConnected = false;
    this.isConnecting = false;

    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    this.initEmptyFrame();
    this.emit('disconnected');
  }

  // Destroy instance
  destroy(): void {
    this.disconnect();
    this.removeAllListeners();
  }
}

// Helper function to discover cameras on local network
export async function discoverCameras(subnet: string = '192.168.1'): Promise<string[]> {
  const commonPorts = [8080, 8081, 4747, 4748, 5000, 5001];
  const discovered: string[] = [];

  // This is a simplified version - full implementation would scan the network
  // For now, return common camera app endpoints
  const commonEndpoints = [
    '/video',
    '/videofeed',
    '/mjpeg',
    '/stream',
    '/cam',
    '/shot.jpg',
  ];

  return discovered;
}

// Get instructions for popular camera apps
export function getCameraAppInstructions(): string {
  return `
╭──────────────────────────────────────────────────────────────╮
│              📱 PHONE CAMERA SETUP                            │
╠══════════════════════════════════════════════════════════════╣
│                                                               │
│  iPhone Apps (Free):                                          │
│  ─────────────────                                            │
│  • Camo         → Best quality, shows IP in app               │
│  • EpocCam      → Easy setup, works great                     │
│  • iVCam        → Good for older iPhones                      │
│                                                               │
│  Android Apps (Free):                                         │
│  ───────────────────                                          │
│  • DroidCam     → Most popular, reliable                      │
│  • IP Webcam    → Many features, shows URL                    │
│  • Iriun        → Easy to use                                 │
│                                                               │
│  Setup Steps:                                                 │
│  ────────────                                                 │
│  1. Install app on your phone                                 │
│  2. Connect phone & PC to same WiFi                           │
│  3. Open app → Find IP address (e.g., 192.168.1.50:8080)     │
│  4. In Termaaz: /camera 192.168.1.50:8080                    │
│                                                               │
│  Common URLs:                                                 │
│  ────────────                                                 │
│  • IP Webcam:  http://IP:8080/video                          │
│  • DroidCam:   http://IP:4747/video                          │
│  • Camo:       http://IP:5000/video                          │
│                                                               │
╰──────────────────────────────────────────────────────────────╯
`;
}
