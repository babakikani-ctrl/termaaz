// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - P2P Network Layer (Hyperswarm)
// ═══════════════════════════════════════════════════════════════════════════

import Hyperswarm from 'hyperswarm';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import type { NetworkMessage, NetworkMessageType, User, Peer } from '../core/types.js';
import { PROTOCOL_VERSION, PING_INTERVAL, PEER_TIMEOUT } from '../core/constants.js';

export class P2PNetwork extends EventEmitter {
  private swarm: Hyperswarm | null = null;
  private peers: Map<string, Peer> = new Map();
  private topic: Buffer | null = null;
  private userId: string;
  private userName: string;
  private userColor: string;
  private pingInterval: NodeJS.Timeout | null = null;
  private isDestroyed = false;

  constructor(userId: string, userName: string, userColor: string) {
    super();
    this.userId = userId;
    this.userName = userName;
    this.userColor = userColor;
  }

  async createRoom(roomName: string): Promise<string> {
    // Generate a simple 4-digit room code (1000-9999)
    const roomId = String(1000 + Math.floor(Math.random() * 9000));

    // Hash it to create secure topic
    this.topic = crypto.createHash('sha256')
      .update(`termaaz:${roomId}:termaazation`)
      .digest();

    await this.initSwarm();
    return roomId;
  }

  async joinRoom(roomId: string): Promise<void> {
    // Clean the room ID (remove spaces, etc.)
    const cleanRoomId = roomId.trim();

    // Hash it to create same topic
    this.topic = crypto.createHash('sha256')
      .update(`termaaz:${cleanRoomId}:termaazation`)
      .digest();

    await this.initSwarm();
  }

  private async initSwarm(): Promise<void> {
    if (this.isDestroyed) return;

    this.swarm = new Hyperswarm();

    this.swarm.on('connection', (socket: any, info: any) => {
      this.handleConnection(socket, info);
    });

    if (this.topic) {
      const discovery = this.swarm.join(this.topic, { client: true, server: true });
      await discovery.flushed();
    }

    this.startPingLoop();
    this.emit('ready');
  }

  private handleConnection(socket: any, info: any): void {
    const peerId = info.publicKey?.toString('hex') || crypto.randomBytes(8).toString('hex');

    let buffer = '';

    socket.on('data', (data: Buffer) => {
      buffer += data.toString();

      // Handle multiple messages in buffer
      const messages = buffer.split('\n');
      buffer = messages.pop() || '';

      for (const msgStr of messages) {
        if (msgStr.trim()) {
          try {
            const message = JSON.parse(msgStr) as NetworkMessage;
            this.handleMessage(message, socket, peerId);
          } catch (err) {
            // Invalid JSON, ignore
          }
        }
      }
    });

    socket.on('error', (err: Error) => {
      this.emit('peer-error', { peerId, error: err });
    });

    socket.on('close', () => {
      const peer = this.peers.get(peerId);
      if (peer) {
        this.peers.delete(peerId);
        this.emit('peer-left', peer.user);
      }
    });

    // Send join message
    this.sendToPeer(socket, {
      type: 'join',
      senderId: this.userId,
      senderName: this.userName,
      timestamp: Date.now(),
      payload: {
        userId: this.userId,
        userName: this.userName,
        userColor: this.userColor,
        protocolVersion: PROTOCOL_VERSION,
      },
    });
  }

  private handleMessage(message: NetworkMessage, socket: any, peerId: string): void {
    switch (message.type) {
      case 'join':
        this.handleJoin(message, socket, peerId);
        break;
      case 'leave':
        this.handleLeave(message);
        break;
      case 'chat':
        this.emit('message', message);
        break;
      case 'typing':
        this.emit('typing', { userId: message.senderId, userName: message.senderName });
        break;
      case 'stop_typing':
        this.emit('stop-typing', { userId: message.senderId });
        break;
      case 'todo_add':
      case 'todo_update':
      case 'todo_delete':
        this.emit('todo', message);
        break;
      case 'file_share':
        this.emit('file-shared', message);
        break;
      case 'file_request':
        this.emit('file-request', message);
        break;
      case 'file_chunk':
        this.emit('file-chunk', message);
        break;
      case 'video_offer':
      case 'video_answer':
      case 'video_ice':
        this.emit('video-signal', message);
        break;
      case 'video_frame':
        this.emit('video-frame', message);
        break;
      case 'ping':
        this.sendToPeer(socket, {
          type: 'pong',
          senderId: this.userId,
          senderName: this.userName,
          timestamp: Date.now(),
          payload: {},
        });
        break;
      case 'pong':
        const peer = this.peers.get(peerId);
        if (peer) {
          peer.lastPing = Date.now();
        }
        break;
      case 'sync_request':
        this.emit('sync-request', { peerId, socket });
        break;
      case 'sync_response':
        this.emit('sync-response', message);
        break;
    }
  }

  private handleJoin(message: NetworkMessage, socket: any, peerId: string): void {
    const { userId, userName, userColor } = message.payload;

    const user: User = {
      id: userId,
      name: userName,
      color: userColor,
      joinedAt: Date.now(),
      isTyping: false,
      lastSeen: Date.now(),
    };

    const peer: Peer = {
      id: peerId,
      user,
      connection: socket,
      isConnected: true,
      lastPing: Date.now(),
    };

    this.peers.set(peerId, peer);
    this.emit('peer-joined', user);

    // Request sync from existing peers
    if (this.peers.size === 1) {
      this.sendToPeer(socket, {
        type: 'sync_request',
        senderId: this.userId,
        senderName: this.userName,
        timestamp: Date.now(),
        payload: {},
      });
    }
  }

  private handleLeave(message: NetworkMessage): void {
    const peerId = Array.from(this.peers.entries())
      .find(([_, p]) => p.user.id === message.senderId)?.[0];

    if (peerId) {
      const peer = this.peers.get(peerId);
      if (peer) {
        this.emit('peer-left', peer.user);
        this.peers.delete(peerId);
      }
    }
  }

  private sendToPeer(socket: any, message: NetworkMessage): boolean {
    try {
      if (socket && socket.writable) {
        socket.write(JSON.stringify(message) + '\n');
        return true;
      }
      return false;
    } catch (err) {
      // Connection might be closed - mark peer as disconnected
      for (const [peerId, peer] of this.peers.entries()) {
        if (peer.connection === socket) {
          peer.isConnected = false;
          this.emit('peer-left', peer.user);
          this.peers.delete(peerId);
          break;
        }
      }
      return false;
    }
  }

  broadcast(type: NetworkMessageType, payload: any): void {
    const message: NetworkMessage = {
      type,
      senderId: this.userId,
      senderName: this.userName,
      timestamp: Date.now(),
      payload,
    };

    for (const peer of this.peers.values()) {
      if (peer.isConnected) {
        this.sendToPeer(peer.connection, message);
      }
    }
  }

  sendTo(peerId: string, type: NetworkMessageType, payload: any): void {
    const peer = this.peers.get(peerId);
    if (peer?.isConnected) {
      this.sendToPeer(peer.connection, {
        type,
        senderId: this.userId,
        senderName: this.userName,
        timestamp: Date.now(),
        payload,
      });
    }
  }

  sendChat(content: string, replyTo?: string): void {
    this.broadcast('chat', { content, replyTo, userColor: this.userColor });
  }

  sendTyping(): void {
    this.broadcast('typing', { userColor: this.userColor });
  }

  sendStopTyping(): void {
    this.broadcast('stop_typing', { userColor: this.userColor });
  }

  sendTodo(action: 'add' | 'update' | 'delete', todo: any): void {
    this.broadcast(`todo_${action}` as NetworkMessageType, todo);
  }

  sendFileShare(fileInfo: any): void {
    this.broadcast('file_share', fileInfo);
  }

  sendVideoSignal(type: 'offer' | 'answer' | 'ice', targetId: string, data: any): void {
    const messageType = `video_${type}` as NetworkMessageType;
    this.sendTo(targetId, messageType, data);
  }

  sendVideoFrame(frame: string[][]): void {
    this.broadcast('video_frame', { frame });
  }

  // Send sync response to a specific peer
  sendSyncResponse(peerId: string, syncData: any): void {
    const peer = this.peers.get(peerId);
    if (peer && peer.connection) {
      this.sendToPeer(peer.connection, {
        type: 'sync_response',
        senderId: this.userId,
        senderName: this.userName,
        timestamp: Date.now(),
        payload: syncData,
      });
    }
  }

  // Request sync from all connected peers
  requestSync(): void {
    for (const [peerId, peer] of this.peers.entries()) {
      if (peer.connection) {
        this.sendToPeer(peer.connection, {
          type: 'sync_request',
          senderId: this.userId,
          senderName: this.userName,
          timestamp: Date.now(),
          payload: {},
        });
      }
    }
  }

  private startPingLoop(): void {
    this.pingInterval = setInterval(() => {
      const now = Date.now();

      for (const [peerId, peer] of this.peers.entries()) {
        // Check for timeout
        if (now - peer.lastPing > PEER_TIMEOUT) {
          this.peers.delete(peerId);
          this.emit('peer-left', peer.user);
          continue;
        }

        // Send ping
        this.sendToPeer(peer.connection, {
          type: 'ping',
          senderId: this.userId,
          senderName: this.userName,
          timestamp: now,
          payload: {},
        });
      }
    }, PING_INTERVAL);
  }

  getPeers(): User[] {
    return Array.from(this.peers.values()).map(p => p.user);
  }

  getPeerCount(): number {
    return this.peers.size;
  }

  updateUserName(name: string): void {
    this.userName = name;
  }

  async destroy(): Promise<void> {
    this.isDestroyed = true;

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    // Send leave message to all peers
    this.broadcast('leave', { userId: this.userId });

    // Close all connections
    for (const peer of this.peers.values()) {
      try {
        peer.connection.destroy();
      } catch (err) {
        // Ignore
      }
    }
    this.peers.clear();

    // Destroy swarm
    if (this.swarm) {
      await this.swarm.destroy();
    }

    this.emit('destroyed');
  }
}
