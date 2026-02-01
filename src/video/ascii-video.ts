// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - ASCII Video System with Real Webcam Capture (Ultra HD with Braille)
// ═══════════════════════════════════════════════════════════════════════════

import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import { VIDEO_WIDTH, VIDEO_HEIGHT, VIDEO_FPS } from '../core/constants.js';

// Braille base character (empty: ⠀)
const BRAILLE_BASE = 0x2800;

export class AsciiVideo extends EventEmitter {
  private width: number;
  private height: number;
  private ffmpegProcess: ChildProcess | null = null;
  private isCapturing = false;
  private currentFrame: string[][] = [];
  private remoteFrames: Map<string, string[][]> = new Map();
  private frameBuffer: Buffer = Buffer.alloc(0);
  // High resolution capture for detail
  private outputWidth = 320;
  private outputHeight = 180;

  constructor(width = VIDEO_WIDTH, height = VIDEO_HEIGHT) {
    super();
    // Display dimensions (each braille = 2x4 pixels, so we get more detail)
    this.width = width * 2;
    this.height = height;
    this.initEmptyFrame();
  }

  private initEmptyFrame(): void {
    this.currentFrame = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(' '));
  }

  // Convert 2x4 pixel block to Braille character
  // Braille dot positions:
  // 1 4     (bits: 0x01, 0x08)
  // 2 5     (bits: 0x02, 0x10)
  // 3 6     (bits: 0x04, 0x20)
  // 7 8     (bits: 0x40, 0x80)
  private pixelsToBraille(pixels: number[]): string {
    let code = BRAILLE_BASE;
    if (pixels[0]) code += 0x01;  // top-left
    if (pixels[1]) code += 0x02;  // mid-left-1
    if (pixels[2]) code += 0x04;  // mid-left-2
    if (pixels[3]) code += 0x08;  // top-right
    if (pixels[4]) code += 0x10;  // mid-right-1
    if (pixels[5]) code += 0x20;  // mid-right-2
    if (pixels[6]) code += 0x40;  // bottom-left
    if (pixels[7]) code += 0x80;  // bottom-right
    return String.fromCharCode(code);
  }

  // Convert raw RGB buffer to Braille ASCII art (ultra high quality)
  private rgbToAscii(buffer: Buffer, imgWidth: number, imgHeight: number): string[][] {
    const result: string[][] = [];

    // Calculate dynamic threshold based on image brightness
    let totalBrightness = 0;
    const pixelCount = imgWidth * imgHeight;
    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 3;
      const r = buffer[idx] || 0;
      const g = buffer[idx + 1] || 0;
      const b = buffer[idx + 2] || 0;
      totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b;
    }
    const avgBrightness = totalBrightness / pixelCount;
    const threshold = avgBrightness * 0.85;

    // Each Braille character represents 2x4 pixels
    const charsX = Math.floor(imgWidth / 2);
    const charsY = Math.floor(imgHeight / 4);

    for (let cy = 0; cy < charsY && cy < this.height; cy++) {
      const row: string[] = [];
      for (let cx = 0; cx < charsX && cx < this.width; cx++) {
        // Sample 2x4 pixel block
        const pixels: number[] = [];

        // Row 0: positions 0, 3
        // Row 1: positions 1, 4
        // Row 2: positions 2, 5
        // Row 3: positions 6, 7
        for (let py = 0; py < 4; py++) {
          for (let px = 0; px < 2; px++) {
            const imgX = cx * 2 + px;
            const imgY = cy * 4 + py;
            const idx = (imgY * imgWidth + imgX) * 3;

            const r = buffer[idx] || 0;
            const g = buffer[idx + 1] || 0;
            const b = buffer[idx + 2] || 0;
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;

            // Map pixel positions to braille positions
            const braillePos = py < 3 ? (py + px * 3) : (6 + px);
            pixels[braillePos] = gray > threshold ? 1 : 0;
          }
        }

        row.push(this.pixelsToBraille(pixels));
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
        if (faceDist < 1) char = '⠄';
        if (faceDist > 0.9 && faceDist < 1) char = '⣿';
        if (!blink && (leftEyeDist < 0.06 || rightEyeDist < 0.06)) char = '⣿';
        if (blink && (leftEyeDist < 0.06 || rightEyeDist < 0.06)) char = '⠤';
        if (isMouth) char = '⣀';

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
