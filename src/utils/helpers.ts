// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Utility Functions
// ═══════════════════════════════════════════════════════════════════════════

import crypto from 'crypto';
import { format, formatDistanceToNow } from 'date-fns';
import { USER_COLORS } from '../core/constants.js';

// Generate unique IDs
export function generateId(): string {
  return crypto.randomBytes(8).toString('hex');
}

export function generateShortId(): string {
  return crypto.randomBytes(4).toString('hex');
}

// Get random user color
export function getRandomColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

// Format timestamp
export function formatTime(timestamp: number): string {
  return format(new Date(timestamp), 'HH:mm');
}

export function formatDate(timestamp: number): string {
  return format(new Date(timestamp), 'MMM d, yyyy');
}

export function formatRelative(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

export function formatDateTime(timestamp: number): string {
  return format(new Date(timestamp), 'MMM d, HH:mm');
}

// Format file size
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Truncate string with ellipsis
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

// Pad string
export function padLeft(str: string, length: number, char = ' '): string {
  return str.padStart(length, char);
}

export function padRight(str: string, length: number, char = ' '): string {
  return str.padEnd(length, char);
}

export function center(str: string, length: number, char = ' '): string {
  const totalPadding = length - str.length;
  if (totalPadding <= 0) return str;
  const leftPad = Math.floor(totalPadding / 2);
  const rightPad = totalPadding - leftPad;
  return char.repeat(leftPad) + str + char.repeat(rightPad);
}

// Wrap text to width
export function wrapText(text: string, width: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= width) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

// Parse command from input
export function parseCommand(input: string): { command: string; args: string[] } | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) return null;

  const parts = trimmed.slice(1).split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  return { command, args };
}

// Detect URLs in text
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

// Simple hash for deterministic color assignment
export function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Get color for user based on ID
export function getUserColor(userId: string): string {
  const index = hashStringToNumber(userId) % USER_COLORS.length;
  return USER_COLORS[index];
}

// Sanitize input
export function sanitizeInput(input: string): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars
    .trim();
}

// Check if path is file or directory
export function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const types: Record<string, string> = {
    // Documents
    txt: 'text', md: 'text', pdf: 'document', doc: 'document', docx: 'document',
    // Code
    js: 'code', ts: 'code', jsx: 'code', tsx: 'code', py: 'code', rb: 'code',
    go: 'code', rs: 'code', java: 'code', c: 'code', cpp: 'code', h: 'code',
    css: 'code', html: 'code', json: 'code', xml: 'code', yaml: 'code', yml: 'code',
    // Images
    png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', svg: 'image', webp: 'image',
    // Video
    mp4: 'video', mov: 'video', avi: 'video', mkv: 'video', webm: 'video',
    // Audio
    mp3: 'audio', wav: 'audio', flac: 'audio', ogg: 'audio', m4a: 'audio',
    // Archives
    zip: 'archive', tar: 'archive', gz: 'archive', rar: 'archive', '7z': 'archive',
  };
  return types[ext] || 'file';
}

// Get file icon
export function getFileIcon(filename: string, isDirectory: boolean): string {
  if (isDirectory) return '📁';

  const type = getFileType(filename);
  const icons: Record<string, string> = {
    text: '📄',
    document: '📝',
    code: '💻',
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    archive: '📦',
    file: '📄',
  };
  return icons[type] || '📄';
}

// Create progress bar
export function createProgressBar(progress: number, width: number = 20): string {
  const filled = Math.round(progress * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

// Create box border
export function createBox(content: string[], width: number): string[] {
  const result: string[] = [];
  result.push('╭' + '─'.repeat(width - 2) + '╮');

  for (const line of content) {
    const paddedLine = line.padEnd(width - 4);
    result.push('│ ' + paddedLine + ' │');
  }

  result.push('╰' + '─'.repeat(width - 2) + '╯');
  return result;
}

// Debounce function
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Safe JSON parse
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}
