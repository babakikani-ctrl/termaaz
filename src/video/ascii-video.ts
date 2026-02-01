// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - ASCII Video System (High Detail Dot Rendering)
// ═══════════════════════════════════════════════════════════════════════════

import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { VIDEO_WIDTH, VIDEO_HEIGHT, VIDEO_FPS } from '../core/constants.js';

// Dot-based gradient for ultra-fine detail rendering
// Uses density of dots to create grayscale effect
const DOT_GRADIENT = ' .·:∙•●';

export class AsciiVideo extends EventEmitter {
  private width: number;
  private height: number;
  private ffmpegProcess: ChildProcess | null = null;
  private isCapturing = false;
  private currentFrame: string[][] = [];
  private remoteFrames: Map<string, string[][]> = new Map();
  private frameBuffer: Buffer = Buffer.alloc(0);
  // Higher resolution for more detail
  private outputWidth = 320;
  private outputHeight = 180;

  constructor(width = VIDEO_WIDTH, height = VIDEO_HEIGHT) {
    super();
    // Increase default size for better detail
    this.width = width * 2;
    this.height = height * 1.5;
    this.initEmptyFrame();
  }

  private initEmptyFrame(): void {
    this.currentFrame = Array(Math.floor(this.height))
      .fill(null)
      .map(() => Array(Math.floor(this.width)).fill(' '));
  }

  // Convert grayscale to dot density
  private grayscaleToDot(value: number, edge: number): string {
    // Invert: darker areas = more dots
    const inverted = 255 - value;
    // Enhance edges for clarity
    const enhanced = Math.min(255, inverted + edge * 0.3);
    const index = Math.floor((enhanced / 255) * (DOT_GRADIENT.length - 1));
    return DOT_GRADIENT[Math.min(index, DOT_GRADIENT.length - 1)];
  }

  // Sobel edge detection for sharp outlines
  private detectEdge(buffer: Buffer, imgWidth: number, x: number, y: number): number {
    if (x <= 0 || x >= imgWidth - 1 || y <= 0 || y >= this.outputHeight - 1) {
      return 0;
    }

    const getGray = (px: number, py: number): number => {
      const idx = (py * imgWidth + px) * 3;
      const r = buffer[idx] || 0;
      const g = buffer[idx + 1] || 0;
      const b = buffer[idx + 2] || 0;
      return 0.299 * r + 0.587 * g + 0.114 * b;
    };

    // Sobel kernels for edge detection
    const gx =
      -getGray(x - 1, y - 1) + getGray(x + 1, y - 1) +
      -2 * getGray(x - 1, y) + 2 * getGray(x + 1, y) +
      -getGray(x - 1, y + 1) + getGray(x + 1, y + 1);

    const gy =
      -getGray(x - 1, y - 1) - 2 * getGray(x, y - 1) - getGray(x + 1, y - 1) +
      getGray(x - 1, y + 1) + 2 * getGray(x, y + 1) + getGray(x + 1, y + 1);

    return Math.sqrt(gx * gx + gy * gy);
  }

  // Convert RGB buffer to dot-based ASCII with high detail
  private rgbToAscii(buffer: Buffer, imgWidth: number, imgHeight: number): string[][] {
    const result: string[][] = [];
    const scaleX = imgWidth / this.width;
    const scaleY = imgHeight / this.height;

    for (let y = 0; y < this.height; y++) {
      const row: string[] = [];
      for (let x = 0; x < this.width; x++) {
        const srcX = Math.floor(x * scaleX);
        const srcY = Math.floor(y * scaleY);
        const idx = (srcY * imgWidth + srcX) * 3;

        const r = buffer[idx] || 0;
        const g = buffer[idx + 1] || 0;
        const b = buffer[idx + 2] || 0;

        // Grayscale with human perception weights
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Edge detection for crisp outlines
        const edge = this.detectEdge(buffer, imgWidth, srcX, srcY);

        row.push(this.grayscaleToDot(gray, edge));
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
      '-vf', `scale=${this.outputWidth}:${this.outputHeight},fps=${VIDEO_FPS}`,
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

      const frameSize = this.outputWidth * this.outputHeight * 3;

      this.ffmpegProcess.stdout?.on('data', (chunk: Buffer) => {
        this.frameBuffer = Buffer.concat([this.frameBuffer, chunk]);

        while (this.frameBuffer.length >= frameSize) {
          const frameData = this.frameBuffer.subarray(0, frameSize);
          this.frameBuffer = this.frameBuffer.subarray(frameSize);

          this.currentFrame = this.rgbToAscii(frameData, this.outputWidth, this.outputHeight);
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

    for (let y = 0; y < this.height; y++) {
      const row: string[] = [];
      for (let x = 0; x < this.width; x++) {
        const nx = x / this.width;
        const ny = y / this.height;

        // Animated face with dot-based rendering
        const faceDist = Math.sqrt(
          Math.pow((nx - 0.5) / 0.35, 2) +
          Math.pow((ny - 0.45) / 0.45, 2)
        );

        const leftEyeDist = Math.sqrt(Math.pow(nx - 0.35, 2) + Math.pow(ny - 0.35, 2));
        const rightEyeDist = Math.sqrt(Math.pow(nx - 0.65, 2) + Math.pow(ny - 0.35, 2));
        const blink = Math.abs(Math.sin(time * 2)) > 0.9;

        const mouthOpen = Math.abs(Math.sin(time * 3)) * 0.05;
        const isMouth = Math.abs(nx - 0.5) < 0.15 && Math.abs(ny - 0.65 - mouthOpen) < 0.03;

        let char = ' ';
        if (faceDist < 1) char = '.';
        if (faceDist < 0.8) char = '·';
        if (faceDist > 0.85 && faceDist < 1) char = '●';
        if (!blink && (leftEyeDist < 0.06 || rightEyeDist < 0.06)) char = '●';
        if (blink && (leftEyeDist < 0.06 || rightEyeDist < 0.06)) char = '·';
        if (isMouth) char = '∙';

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
