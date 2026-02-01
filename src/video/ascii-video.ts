// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - ASCII Video System with Real Webcam Capture
// ═══════════════════════════════════════════════════════════════════════════

import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { VIDEO_WIDTH, VIDEO_HEIGHT, VIDEO_FPS } from '../core/constants.js';

// Extended ASCII for better quality (more characters = more detail)
const ASCII_CHARS_HD = ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

export class AsciiVideo extends EventEmitter {
  private width: number;
  private height: number;
  private ffmpegProcess: ChildProcess | null = null;
  private isCapturing = false;
  private currentFrame: string[][] = [];
  private remoteFrames: Map<string, string[][]> = new Map();
  private frameBuffer: Buffer = Buffer.alloc(0);
  private captureWidth = 160;  // Capture resolution
  private captureHeight = 90;

  constructor(width = VIDEO_WIDTH, height = VIDEO_HEIGHT) {
    super();
    this.width = width;
    this.height = height;
    this.initEmptyFrame();
  }

  private initEmptyFrame(): void {
    this.currentFrame = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(' '));
  }

  // Convert grayscale value to ASCII (HD quality)
  private grayscaleToAscii(value: number): string {
    const index = Math.floor((value / 255) * (ASCII_CHARS_HD.length - 1));
    return ASCII_CHARS_HD[Math.min(index, ASCII_CHARS_HD.length - 1)];
  }

  // Convert raw RGB buffer to ASCII art
  private rgbToAscii(buffer: Buffer, imgWidth: number, imgHeight: number): string[][] {
    const result: string[][] = [];
    const scaleX = imgWidth / this.width;
    const scaleY = imgHeight / this.height;

    for (let y = 0; y < this.height; y++) {
      const row: string[] = [];
      for (let x = 0; x < this.width; x++) {
        const srcX = Math.floor(x * scaleX);
        const srcY = Math.floor(y * scaleY);
        const idx = (srcY * imgWidth + srcX) * 3; // RGB = 3 bytes

        const r = buffer[idx] || 0;
        const g = buffer[idx + 1] || 0;
        const b = buffer[idx + 2] || 0;

        // Convert to grayscale
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        row.push(this.grayscaleToAscii(gray));
      }
      result.push(row);
    }

    return result;
  }

  // Start capturing from real webcam
  startCapture(mode: 'webcam' | 'demo' = 'webcam'): void {
    if (this.isCapturing) return;
    this.isCapturing = true;

    if (mode === 'demo') {
      this.startDemoMode();
      return;
    }

    // Use ffmpeg to capture from webcam
    // macOS: avfoundation, Linux: v4l2, Windows: dshow
    const platform = process.platform;
    let inputArgs: string[];

    if (platform === 'darwin') {
      // macOS - use AVFoundation
      inputArgs = [
        '-f', 'avfoundation',
        '-framerate', String(VIDEO_FPS),
        '-video_size', `${this.captureWidth}x${this.captureHeight}`,
        '-i', '0:none', // Video device 0, no audio
      ];
    } else if (platform === 'linux') {
      // Linux - use video4linux2
      inputArgs = [
        '-f', 'v4l2',
        '-framerate', String(VIDEO_FPS),
        '-video_size', `${this.captureWidth}x${this.captureHeight}`,
        '-i', '/dev/video0',
      ];
    } else {
      // Windows or unsupported - fallback to demo
      this.startDemoMode();
      return;
    }

    const outputArgs = [
      '-f', 'rawvideo',
      '-pix_fmt', 'rgb24',
      '-an', // No audio
      '-',   // Output to stdout
    ];

    try {
      this.ffmpegProcess = spawn('ffmpeg', [
        ...inputArgs,
        ...outputArgs,
      ], {
        stdio: ['ignore', 'pipe', 'ignore'],
      });

      const frameSize = this.captureWidth * this.captureHeight * 3; // RGB

      this.ffmpegProcess.stdout?.on('data', (chunk: Buffer) => {
        this.frameBuffer = Buffer.concat([this.frameBuffer, chunk]);

        // Process complete frames
        while (this.frameBuffer.length >= frameSize) {
          const frameData = this.frameBuffer.subarray(0, frameSize);
          this.frameBuffer = this.frameBuffer.subarray(frameSize);

          // Convert to ASCII
          this.currentFrame = this.rgbToAscii(frameData, this.captureWidth, this.captureHeight);
          this.emit('frame', this.currentFrame);
        }
      });

      this.ffmpegProcess.on('error', (err) => {
        console.error('Webcam error, falling back to demo mode');
        this.startDemoMode();
      });

      this.ffmpegProcess.on('close', () => {
        if (this.isCapturing) {
          this.isCapturing = false;
          this.emit('stopped');
        }
      });

    } catch (err) {
      // Fallback to demo mode if ffmpeg fails
      this.startDemoMode();
    }
  }

  // Demo mode with animated pattern
  private demoInterval: NodeJS.Timeout | null = null;

  private startDemoMode(): void {
    this.demoInterval = setInterval(() => {
      this.currentFrame = this.generateAnimatedFace();
      this.emit('frame', this.currentFrame);
    }, 1000 / VIDEO_FPS);
  }

  // Generate animated face for demo
  private generateAnimatedFace(): string[][] {
    const result: string[][] = [];
    const time = Date.now() / 1000;

    for (let y = 0; y < this.height; y++) {
      const row: string[] = [];
      for (let x = 0; x < this.width; x++) {
        const nx = x / this.width;
        const ny = y / this.height;

        // Face outline
        const faceDist = Math.sqrt(
          Math.pow((nx - 0.5) / 0.3, 2) +
          Math.pow((ny - 0.45) / 0.4, 2)
        );

        // Eyes
        const leftEyeDist = Math.sqrt(Math.pow(nx - 0.35, 2) + Math.pow(ny - 0.35, 2));
        const rightEyeDist = Math.sqrt(Math.pow(nx - 0.65, 2) + Math.pow(ny - 0.35, 2));
        const blink = Math.abs(Math.sin(time * 2)) > 0.9;

        // Mouth
        const mouthOpen = Math.abs(Math.sin(time * 3)) * 0.05;
        const isMouth = Math.abs(nx - 0.5) < 0.15 && Math.abs(ny - 0.65 - mouthOpen) < 0.03;

        let char = ' ';
        if (faceDist < 1) char = '.';
        if (faceDist > 0.9 && faceDist < 1) char = '@';
        if (!blink && (leftEyeDist < 0.05 || rightEyeDist < 0.05)) char = 'O';
        if (blink && (leftEyeDist < 0.05 || rightEyeDist < 0.05)) char = '-';
        if (isMouth) char = '_';

        row.push(char);
      }
      result.push(row);
    }

    return result;
  }

  stopCapture(): void {
    this.isCapturing = false;

    if (this.ffmpegProcess) {
      this.ffmpegProcess.kill('SIGTERM');
      this.ffmpegProcess = null;
    }

    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }

    this.frameBuffer = Buffer.alloc(0);
    this.initEmptyFrame();
  }

  setRemoteFrame(peerId: string, frame: string[][]): void {
    this.remoteFrames.set(peerId, frame);
    this.emit('remote-frame', { peerId, frame });
  }

  removeRemoteFrame(peerId: string): void {
    this.remoteFrames.delete(peerId);
  }

  getCurrentFrame(): string[][] {
    return this.currentFrame;
  }

  getAllFrames(): Map<string, string[][]> {
    const all = new Map<string, string[][]>();
    all.set('local', this.currentFrame);
    for (const [peerId, frame] of this.remoteFrames) {
      all.set(peerId, frame);
    }
    return all;
  }

  frameToString(frame: string[][]): string {
    return frame.map(row => row.join('')).join('\n');
  }

  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  destroy(): void {
    this.stopCapture();
    this.remoteFrames.clear();
    this.removeAllListeners();
  }
}
