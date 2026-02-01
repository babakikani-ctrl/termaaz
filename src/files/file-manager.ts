// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - File Sharing & Management System
// ═══════════════════════════════════════════════════════════════════════════

import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createReadStream, createWriteStream } from 'fs';
import type { SharedFile, FileInfo } from '../core/types.js';
import { generateId, formatFileSize, getFileIcon, getFileType } from '../utils/helpers.js';
import { FILE_CHUNK_SIZE } from '../core/constants.js';

interface FileTransfer {
  id: string;
  fileInfo: FileInfo;
  chunks: Map<number, Buffer>;
  totalChunks: number;
  receivedChunks: number;
  progress: number;
  status: 'pending' | 'transferring' | 'complete' | 'error';
  savePath: string;
}

export class FileManager extends EventEmitter {
  private sharedFiles: Map<string, SharedFile> = new Map();
  private activeTransfers: Map<string, FileTransfer> = new Map();
  private downloadPath: string;
  private userId: string;
  private userName: string;

  constructor(userId: string, userName: string) {
    super();
    this.userId = userId;
    this.userName = userName;
    this.downloadPath = path.join(os.homedir(), 'Desktop', 'Termaaz_Downloads');
    this.ensureDownloadDir();
  }

  private ensureDownloadDir(): void {
    if (!fs.existsSync(this.downloadPath)) {
      fs.mkdirSync(this.downloadPath, { recursive: true });
    }
  }

  // Share a file or directory
  async shareFile(filePath: string): Promise<SharedFile | null> {
    try {
      const absolutePath = path.resolve(filePath);
      const stats = fs.statSync(absolutePath);
      const fileName = path.basename(absolutePath);

      const fileInfo: SharedFile = {
        id: generateId(),
        name: fileName,
        size: stats.isDirectory() ? this.getDirSize(absolutePath) : stats.size,
        path: absolutePath,
        localPath: absolutePath,
        sharedBy: this.userId,
        sharedByName: this.userName,
        sharedAt: Date.now(),
        mimeType: this.getMimeType(fileName),
        isDirectory: stats.isDirectory(),
        isAvailable: true,
      };

      this.sharedFiles.set(fileInfo.id, fileInfo);
      this.emit('file-shared', fileInfo);
      return fileInfo;
    } catch (error) {
      this.emit('error', { type: 'share', error });
      return null;
    }
  }

  // Get directory size recursively
  private getDirSize(dirPath: string): number {
    let size = 0;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += this.getDirSize(filePath);
      } else {
        size += stats.size;
      }
    }
    return size;
  }

  // Get MIME type from filename
  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  // Register a remote shared file
  registerRemoteFile(fileInfo: SharedFile): void {
    fileInfo.isAvailable = false; // Not downloaded yet
    this.sharedFiles.set(fileInfo.id, fileInfo);
    this.emit('remote-file-available', fileInfo);
  }

  // List all shared files
  getSharedFiles(): SharedFile[] {
    return Array.from(this.sharedFiles.values());
  }

  // Get file by ID
  getFile(fileId: string): SharedFile | null {
    return this.sharedFiles.get(fileId) || null;
  }

  // List directory contents (for file browser)
  async listDirectory(dirPath: string = os.homedir()): Promise<FileInfo[]> {
    try {
      const absolutePath = path.resolve(dirPath);
      const entries = fs.readdirSync(absolutePath, { withFileTypes: true });

      const files: FileInfo[] = [];

      // Add parent directory
      if (absolutePath !== '/') {
        files.push({
          id: '..',
          name: '..',
          size: 0,
          path: path.dirname(absolutePath),
          sharedBy: '',
          sharedByName: '',
          sharedAt: 0,
          mimeType: 'directory',
          isDirectory: true,
        });
      }

      for (const entry of entries) {
        // Skip hidden files
        if (entry.name.startsWith('.')) continue;

        const filePath = path.join(absolutePath, entry.name);
        try {
          const stats = fs.statSync(filePath);
          files.push({
            id: generateId(),
            name: entry.name,
            size: entry.isDirectory() ? 0 : stats.size,
            path: filePath,
            sharedBy: '',
            sharedByName: '',
            sharedAt: stats.mtimeMs,
            mimeType: entry.isDirectory() ? 'directory' : this.getMimeType(entry.name),
            isDirectory: entry.isDirectory(),
          });
        } catch {
          // Skip files we can't access
        }
      }

      // Sort: directories first, then files alphabetically
      files.sort((a, b) => {
        if (a.name === '..') return -1;
        if (b.name === '..') return 1;
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      return files;
    } catch (error) {
      this.emit('error', { type: 'list', error });
      return [];
    }
  }

  // Start file transfer (sender side)
  async *sendFile(fileId: string): AsyncGenerator<{ chunk: Buffer; index: number; total: number }> {
    const file = this.sharedFiles.get(fileId);
    if (!file || !file.isAvailable) return;

    const stream = createReadStream(file.localPath, { highWaterMark: FILE_CHUNK_SIZE });
    const totalChunks = Math.ceil(file.size / FILE_CHUNK_SIZE);
    let chunkIndex = 0;

    for await (const chunk of stream) {
      yield {
        chunk: Buffer.from(chunk),
        index: chunkIndex++,
        total: totalChunks,
      };
    }
  }

  // Receive file transfer (receiver side)
  initReceiveFile(fileInfo: SharedFile): string {
    const transfer: FileTransfer = {
      id: fileInfo.id,
      fileInfo,
      chunks: new Map(),
      totalChunks: Math.ceil(fileInfo.size / FILE_CHUNK_SIZE),
      receivedChunks: 0,
      progress: 0,
      status: 'pending',
      savePath: path.join(this.downloadPath, fileInfo.name),
    };

    this.activeTransfers.set(transfer.id, transfer);
    return transfer.id;
  }

  // Receive a file chunk
  receiveChunk(fileId: string, chunkIndex: number, chunkData: Buffer): void {
    const transfer = this.activeTransfers.get(fileId);
    if (!transfer) return;

    transfer.status = 'transferring';
    transfer.chunks.set(chunkIndex, chunkData);
    transfer.receivedChunks++;
    transfer.progress = transfer.receivedChunks / transfer.totalChunks;

    this.emit('transfer-progress', {
      fileId,
      progress: transfer.progress,
      receivedChunks: transfer.receivedChunks,
      totalChunks: transfer.totalChunks,
    });

    // Check if complete
    if (transfer.receivedChunks >= transfer.totalChunks) {
      this.finalizeTransfer(fileId);
    }
  }

  // Finalize file transfer
  private async finalizeTransfer(fileId: string): Promise<void> {
    const transfer = this.activeTransfers.get(fileId);
    if (!transfer) return;

    try {
      // Combine chunks and write to file
      const writeStream = createWriteStream(transfer.savePath);

      for (let i = 0; i < transfer.totalChunks; i++) {
        const chunk = transfer.chunks.get(i);
        if (chunk) {
          writeStream.write(chunk);
        }
      }

      writeStream.end();

      transfer.status = 'complete';

      // Update shared files map
      const sharedFile = this.sharedFiles.get(fileId);
      if (sharedFile) {
        sharedFile.localPath = transfer.savePath;
        sharedFile.isAvailable = true;
      }

      this.emit('transfer-complete', {
        fileId,
        savePath: transfer.savePath,
        fileName: transfer.fileInfo.name,
      });

      this.activeTransfers.delete(fileId);
    } catch (error) {
      transfer.status = 'error';
      this.emit('transfer-error', { fileId, error });
    }
  }

  // Get transfer progress
  getTransferProgress(fileId: string): number {
    const transfer = this.activeTransfers.get(fileId);
    return transfer?.progress || 0;
  }

  // Read file content (for preview)
  async readFileContent(filePath: string, maxSize = 10000): Promise<string | null> {
    try {
      const stats = fs.statSync(filePath);
      if (stats.size > maxSize) {
        // Read only first part
        const buffer = Buffer.alloc(maxSize);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, maxSize, 0);
        fs.closeSync(fd);
        return buffer.toString('utf-8') + '\n... (truncated)';
      }
      return fs.readFileSync(filePath, 'utf-8');
    } catch {
      return null;
    }
  }

  // Format file info for display
  formatFileInfo(file: SharedFile | FileInfo): string[] {
    const icon = getFileIcon(file.name, file.isDirectory);
    const size = file.isDirectory ? '<DIR>' : formatFileSize(file.size);
    const type = file.isDirectory ? 'Directory' : getFileType(file.name);

    return [
      `${icon} ${file.name}`,
      `   Size: ${size}`,
      `   Type: ${type}`,
      file.sharedByName ? `   Shared by: ${file.sharedByName}` : '',
    ].filter(Boolean);
  }

  // Set download path
  setDownloadPath(newPath: string): void {
    this.downloadPath = newPath;
    this.ensureDownloadDir();
  }

  // Get download path
  getDownloadPath(): string {
    return this.downloadPath;
  }

  // Cleanup
  destroy(): void {
    this.sharedFiles.clear();
    this.activeTransfers.clear();
    this.removeAllListeners();
  }
}
