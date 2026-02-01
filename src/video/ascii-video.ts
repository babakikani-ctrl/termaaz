// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - ASCII Video System
// ═══════════════════════════════════════════════════════════════════════════

import { EventEmitter } from 'events';
import { ASCII_CHARS, VIDEO_WIDTH, VIDEO_HEIGHT, VIDEO_FPS } from '../core/constants.js';

// ASCII character map for grayscale conversion (dark to light)
const ASCII_MAP = ASCII_CHARS.split('');

export class AsciiVideo extends EventEmitter {
  private width: number;
  private height: number;
  private frameInterval: NodeJS.Timeout | null = null;
  private isCapturing = false;
  private currentFrame: string[][] = [];
  private remoteFrames: Map<string, string[][]> = new Map();

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

  // Convert grayscale value (0-255) to ASCII character
  private grayscaleToAscii(value: number): string {
    const index = Math.floor((value / 255) * (ASCII_MAP.length - 1));
    return ASCII_MAP[index];
  }

  // Convert image buffer to ASCII art
  imageToAscii(
    pixels: Uint8Array | Buffer,
    imgWidth: number,
    imgHeight: number,
    channels = 4
  ): string[][] {
    const result: string[][] = [];
    const scaleX = imgWidth / this.width;
    const scaleY = imgHeight / this.height;

    for (let y = 0; y < this.height; y++) {
      const row: string[] = [];
      for (let x = 0; x < this.width; x++) {
        // Sample pixel at scaled position
        const srcX = Math.floor(x * scaleX);
        const srcY = Math.floor(y * scaleY);
        const idx = (srcY * imgWidth + srcX) * channels;

        // Convert RGB to grayscale
        const r = pixels[idx] || 0;
        const g = pixels[idx + 1] || 0;
        const b = pixels[idx + 2] || 0;
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

        row.push(this.grayscaleToAscii(gray));
      }
      result.push(row);
    }

    return result;
  }

  // Generate a test pattern for demo purposes
  generateTestPattern(): string[][] {
    const result: string[][] = [];
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const time = Date.now() / 1000;

    for (let y = 0; y < this.height; y++) {
      const row: string[] = [];
      for (let x = 0; x < this.width; x++) {
        // Create animated circular pattern
        const dx = x - centerX;
        const dy = (y - centerY) * 2; // Adjust for terminal aspect ratio
        const dist = Math.sqrt(dx * dx + dy * dy);
        const wave = Math.sin(dist / 3 - time * 2) * 0.5 + 0.5;
        const value = Math.floor(wave * 255);
        row.push(this.grayscaleToAscii(value));
      }
      result.push(row);
    }

    return result;
  }

  // Generate animated "face" pattern for demo
  generateAnimatedFace(): string[][] {
    const result: string[][] = [];
    const time = Date.now() / 1000;

    for (let y = 0; y < this.height; y++) {
      const row: string[] = [];
      for (let x = 0; x < this.width; x++) {
        const nx = x / this.width;
        const ny = y / this.height;

        // Face outline (oval)
        const faceCenterX = 0.5;
        const faceCenterY = 0.45;
        const faceRadiusX = 0.3;
        const faceRadiusY = 0.4;
        const faceDist = Math.sqrt(
          Math.pow((nx - faceCenterX) / faceRadiusX, 2) +
          Math.pow((ny - faceCenterY) / faceRadiusY, 2)
        );

        // Eyes
        const leftEyeX = 0.35;
        const rightEyeX = 0.65;
        const eyeY = 0.35;
        const eyeRadius = 0.05;
        const blinkOffset = Math.abs(Math.sin(time * 2)) > 0.9 ? 0.1 : 0;

        const leftEyeDist = Math.sqrt(
          Math.pow(nx - leftEyeX, 2) + Math.pow(ny - eyeY - blinkOffset, 2)
        );
        const rightEyeDist = Math.sqrt(
          Math.pow(nx - rightEyeX, 2) + Math.pow(ny - eyeY - blinkOffset, 2)
        );

        // Mouth (animated)
        const mouthY = 0.65;
        const mouthOpen = Math.abs(Math.sin(time * 3)) * 0.05;
        const mouthDist = Math.abs(ny - mouthY - mouthOpen);
        const mouthWidth = 0.15;
        const isMouth = Math.abs(nx - 0.5) < mouthWidth && mouthDist < 0.03;

        // Render
        let char = ' ';
        if (faceDist < 1) {
          char = '.';
          if (faceDist > 0.9) char = '@';
        }
        if (leftEyeDist < eyeRadius || rightEyeDist < eyeRadius) {
          char = 'O';
        }
        if (isMouth) {
          char = '_';
        }

        row.push(char);
      }
      result.push(row);
    }

    return result;
  }

  // Start capturing frames (simulated for demo)
  startCapture(mode: 'test' | 'face' = 'face'): void {
    if (this.isCapturing) return;
    this.isCapturing = true;

    this.frameInterval = setInterval(() => {
      if (mode === 'test') {
        this.currentFrame = this.generateTestPattern();
      } else {
        this.currentFrame = this.generateAnimatedFace();
      }
      this.emit('frame', this.currentFrame);
    }, 1000 / VIDEO_FPS);
  }

  stopCapture(): void {
    this.isCapturing = false;
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }
    this.initEmptyFrame();
  }

  // Update remote peer's frame
  setRemoteFrame(peerId: string, frame: string[][]): void {
    this.remoteFrames.set(peerId, frame);
    this.emit('remote-frame', { peerId, frame });
  }

  removeRemoteFrame(peerId: string): void {
    this.remoteFrames.delete(peerId);
  }

  // Get current local frame
  getCurrentFrame(): string[][] {
    return this.currentFrame;
  }

  // Get all frames (local + remote) for display
  getAllFrames(): Map<string, string[][]> {
    const all = new Map<string, string[][]>();
    all.set('local', this.currentFrame);
    for (const [peerId, frame] of this.remoteFrames) {
      all.set(peerId, frame);
    }
    return all;
  }

  // Render frame to string
  frameToString(frame: string[][]): string {
    return frame.map(row => row.join('')).join('\n');
  }

  // Render all frames side by side
  renderAllFrames(): string {
    const frames = this.getAllFrames();
    const frameArray = Array.from(frames.values());

    if (frameArray.length === 0) return '';
    if (frameArray.length === 1) return this.frameToString(frameArray[0]);

    // Render frames side by side with separator
    const separator = ' │ ';
    const result: string[] = [];

    for (let y = 0; y < this.height; y++) {
      const rowParts: string[] = [];
      for (const frame of frameArray) {
        rowParts.push(frame[y]?.join('') || ' '.repeat(this.width));
      }
      result.push(rowParts.join(separator));
    }

    return result.join('\n');
  }

  // Get dimensions
  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  // Cleanup
  destroy(): void {
    this.stopCapture();
    this.remoteFrames.clear();
    this.removeAllListeners();
  }
}

// Utility function to create ASCII art from text
export function textToAsciiArt(text: string): string[] {
  const fonts: Record<string, string[]> = {
    A: ['  █  ', ' █ █ ', '█████', '█   █', '█   █'],
    B: ['████ ', '█   █', '████ ', '█   █', '████ '],
    C: [' ████', '█    ', '█    ', '█    ', ' ████'],
    D: ['████ ', '█   █', '█   █', '█   █', '████ '],
    E: ['█████', '█    ', '████ ', '█    ', '█████'],
    F: ['█████', '█    ', '████ ', '█    ', '█    '],
    G: [' ████', '█    ', '█  ██', '█   █', ' ████'],
    H: ['█   █', '█   █', '█████', '█   █', '█   █'],
    I: ['█████', '  █  ', '  █  ', '  █  ', '█████'],
    J: ['█████', '   █ ', '   █ ', '█  █ ', ' ██  '],
    K: ['█   █', '█  █ ', '███  ', '█  █ ', '█   █'],
    L: ['█    ', '█    ', '█    ', '█    ', '█████'],
    M: ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
    N: ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
    O: [' ███ ', '█   █', '█   █', '█   █', ' ███ '],
    P: ['████ ', '█   █', '████ ', '█    ', '█    '],
    Q: [' ███ ', '█   █', '█ █ █', '█  █ ', ' ██ █'],
    R: ['████ ', '█   █', '████ ', '█  █ ', '█   █'],
    S: [' ████', '█    ', ' ███ ', '    █', '████ '],
    T: ['█████', '  █  ', '  █  ', '  █  ', '  █  '],
    U: ['█   █', '█   █', '█   █', '█   █', ' ███ '],
    V: ['█   █', '█   █', '█   █', ' █ █ ', '  █  '],
    W: ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
    X: ['█   █', ' █ █ ', '  █  ', ' █ █ ', '█   █'],
    Y: ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
    Z: ['█████', '   █ ', '  █  ', ' █   ', '█████'],
    ' ': ['     ', '     ', '     ', '     ', '     '],
  };

  const lines = ['', '', '', '', ''];
  for (const char of text.toUpperCase()) {
    const pattern = fonts[char] || fonts[' '];
    for (let i = 0; i < 5; i++) {
      lines[i] += pattern[i] + ' ';
    }
  }

  return lines;
}
