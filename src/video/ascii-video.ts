// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - ASCII Video System (Ultra HD Braille Rendering)
// Each Braille character = 2x4 pixels = 8x more detail!
// ═══════════════════════════════════════════════════════════════════════════

import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { VIDEO_FPS } from '../core/constants.js';

// Braille Unicode block starts at 0x2800
// Each character represents a 2x4 dot matrix
// Dot positions:
// 1 4
// 2 5
// 3 6
// 7 8
const BRAILLE_BASE = 0x2800;

export class AsciiVideo extends EventEmitter {
  private ffmpegProcess: ChildProcess | null = null;
  private isCapturing = false;
  private currentFrame: string[][] = [];
  private remoteFrames: Map<string, string[][]> = new Map();
  private frameBuffer: Buffer = Buffer.alloc(0);

  // Ultra high resolution capture
  private captureWidth = 640;
  private captureHeight = 480;

  // Output dimensions in characters
  // Each char = 2x4 pixels, so multiply by 2 and 4
  private charWidth = 160;   // 320 pixels wide
  private charHeight = 60;   // 240 pixels tall

  constructor() {
    super();
    this.initEmptyFrame();
  }

  private initEmptyFrame(): void {
    this.currentFrame = Array(this.charHeight)
      .fill(null)
      .map(() => Array(this.charWidth).fill(' '));
  }

  // Convert 2x4 pixel block to braille character
  private pixelsToBraille(pixels: boolean[][]): string {
    // pixels is a 4x2 array (4 rows, 2 cols)
    let code = 0;

    // Braille dot positions mapping to bit positions:
    // (0,0)=bit0, (1,0)=bit1, (2,0)=bit2, (0,1)=bit3
    // (1,1)=bit4, (2,1)=bit5, (3,0)=bit6, (3,1)=bit7
    if (pixels[0]?.[0]) code |= 0x01;  // dot 1
    if (pixels[1]?.[0]) code |= 0x02;  // dot 2
    if (pixels[2]?.[0]) code |= 0x04;  // dot 3
    if (pixels[0]?.[1]) code |= 0x08;  // dot 4
    if (pixels[1]?.[1]) code |= 0x10;  // dot 5
    if (pixels[2]?.[1]) code |= 0x20;  // dot 6
    if (pixels[3]?.[0]) code |= 0x40;  // dot 7
    if (pixels[3]?.[1]) code |= 0x80;  // dot 8

    return String.fromCharCode(BRAILLE_BASE + code);
  }

  // Convert RGB buffer to ultra-HD braille
  private rgbToBraille(buffer: Buffer, imgWidth: number, imgHeight: number): string[][] {
    const result: string[][] = [];

    // Calculate thresholds dynamically based on image brightness
    let totalBrightness = 0;
    let pixelCount = 0;

    for (let i = 0; i < buffer.length; i += 3) {
      const r = buffer[i] || 0;
      const g = buffer[i + 1] || 0;
      const b = buffer[i + 2] || 0;
      totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b;
      pixelCount++;
    }

    const avgBrightness = totalBrightness / pixelCount;
    // Dynamic threshold based on average brightness
    const threshold = avgBrightness * 0.85;

    // Process in 2x4 blocks
    const pixelWidth = this.charWidth * 2;
    const pixelHeight = this.charHeight * 4;

    const scaleX = imgWidth / pixelWidth;
    const scaleY = imgHeight / pixelHeight;

    for (let charY = 0; charY < this.charHeight; charY++) {
      const row: string[] = [];

      for (let charX = 0; charX < this.charWidth; charX++) {
        // Get 2x4 pixel block
        const pixels: boolean[][] = [];

        for (let dy = 0; dy < 4; dy++) {
          const pixelRow: boolean[] = [];
          for (let dx = 0; dx < 2; dx++) {
            const px = charX * 2 + dx;
            const py = charY * 4 + dy;

            const srcX = Math.floor(px * scaleX);
            const srcY = Math.floor(py * scaleY);
            const idx = (srcY * imgWidth + srcX) * 3;

            const r = buffer[idx] || 0;
            const g = buffer[idx + 1] || 0;
            const b = buffer[idx + 2] || 0;

            // Grayscale with edge enhancement
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;

            // Pixel is "on" if darker than threshold (inverted for dark = dot)
            pixelRow.push(gray < threshold);
          }
          pixels.push(pixelRow);
        }

        row.push(this.pixelsToBraille(pixels));
      }

      result.push(row);
    }

    return result;
  }

  // Start capturing from webcam
  startCapture(mode: 'webcam' | 'demo' = 'webcam'): void {
    if (this.isCapturing) return;
    this.isCapturing = true;

    if (mode === 'demo') {
      this.startDemoMode();
      return;
    }

    const platform = process.platform;
    let inputArgs: string[];

    if (platform === 'darwin') {
      inputArgs = [
        '-f', 'avfoundation',
        '-framerate', '30',
        '-video_size', '640x480',
        '-i', '0:none',
      ];
    } else if (platform === 'linux') {
      inputArgs = [
        '-f', 'v4l2',
        '-framerate', '30',
        '-video_size', '640x480',
        '-i', '/dev/video0',
      ];
    } else {
      this.startDemoMode();
      return;
    }

    const outputArgs = [
      '-vf', `scale=${this.captureWidth}:${this.captureHeight},fps=${VIDEO_FPS}`,
      '-f', 'rawvideo',
      '-pix_fmt', 'rgb24',
      '-an',
      '-',
    ];

    try {
      this.ffmpegProcess = spawn('ffmpeg', [
        ...inputArgs,
        ...outputArgs,
      ], {
        stdio: ['ignore', 'pipe', 'ignore'],
      });

      const frameSize = this.captureWidth * this.captureHeight * 3;

      this.ffmpegProcess.stdout?.on('data', (chunk: Buffer) => {
        this.frameBuffer = Buffer.concat([this.frameBuffer, chunk]);

        while (this.frameBuffer.length >= frameSize) {
          const frameData = this.frameBuffer.subarray(0, frameSize);
          this.frameBuffer = this.frameBuffer.subarray(frameSize);

          this.currentFrame = this.rgbToBraille(frameData, this.captureWidth, this.captureHeight);
          this.emit('frame', this.currentFrame);
        }
      });

      this.ffmpegProcess.on('error', () => {
        this.startDemoMode();
      });

      this.ffmpegProcess.on('close', () => {
        if (this.isCapturing) {
          this.isCapturing = false;
          this.emit('stopped');
        }
      });

    } catch {
      this.startDemoMode();
    }
  }

  private demoInterval: NodeJS.Timeout | null = null;

  private startDemoMode(): void {
    this.demoInterval = setInterval(() => {
      this.currentFrame = this.generateDemoPattern();
      this.emit('frame', this.currentFrame);
    }, 1000 / VIDEO_FPS);
  }

  private generateDemoPattern(): string[][] {
    const result: string[][] = [];
    const time = Date.now() / 1000;

    for (let charY = 0; charY < this.charHeight; charY++) {
      const row: string[] = [];

      for (let charX = 0; charX < this.charWidth; charX++) {
        const pixels: boolean[][] = [];

        for (let dy = 0; dy < 4; dy++) {
          const pixelRow: boolean[] = [];
          for (let dx = 0; dx < 2; dx++) {
            const nx = (charX * 2 + dx) / (this.charWidth * 2);
            const ny = (charY * 4 + dy) / (this.charHeight * 4);

            // Animated face
            const faceDist = Math.sqrt(
              Math.pow((nx - 0.5) / 0.3, 2) +
              Math.pow((ny - 0.45) / 0.4, 2)
            );

            const leftEyeDist = Math.sqrt(Math.pow(nx - 0.35, 2) + Math.pow(ny - 0.35, 2));
            const rightEyeDist = Math.sqrt(Math.pow(nx - 0.65, 2) + Math.pow(ny - 0.35, 2));
            const blink = Math.abs(Math.sin(time * 2)) > 0.9;

            const smileAngle = Math.atan2(ny - 0.55, nx - 0.5);
            const smileDist = Math.sqrt(Math.pow(nx - 0.5, 2) + Math.pow(ny - 0.55, 2));
            const isSmile = smileDist > 0.1 && smileDist < 0.18 && smileAngle > 0.3 && smileAngle < Math.PI - 0.3;

            let on = false;
            // Face outline
            if (faceDist > 0.9 && faceDist < 1.05) on = true;
            // Eyes
            if (!blink && (leftEyeDist < 0.05 || rightEyeDist < 0.05)) on = true;
            if (blink && (leftEyeDist < 0.05 || rightEyeDist < 0.05) && Math.abs(ny - 0.35) < 0.01) on = true;
            // Smile
            if (isSmile) on = true;

            pixelRow.push(on);
          }
          pixels.push(pixelRow);
        }

        row.push(this.pixelsToBraille(pixels));
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
    return { width: this.charWidth, height: this.charHeight };
  }

  destroy(): void {
    this.stopCapture();
    this.remoteFrames.clear();
    this.removeAllListeners();
  }
}
