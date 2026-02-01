// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Application State Manager
// ═══════════════════════════════════════════════════════════════════════════

import { EventEmitter } from 'events';
import type {
  AppState,
  User,
  Message,
  Todo,
  SharedFile,
  ViewType,
  InputMode,
  Notification,
  AppEvent,
} from './types.js';
import { generateId, generateShortId, getRandomColor } from '../utils/helpers.js';
import { MAX_VISIBLE_MESSAGES, NOTIFICATION_DURATION } from './constants.js';

export class StateManager extends EventEmitter {
  private state: AppState;

  constructor() {
    super();
    this.state = this.createInitialState();
  }

  private createInitialState(): AppState {
    return {
      currentUser: null,
      currentRoom: null,
      peers: new Map(),
      isConnected: false,
      isConnecting: false,
      currentView: 'chat',
      inputMode: 'chat',
      notifications: [],
      videoCall: {
        isActive: false,
        participants: [],
        remoteStreams: new Map(),
      },
    };
  }

  // Initialize user
  initUser(name: string): User {
    const user: User = {
      id: generateId(),
      name,
      color: getRandomColor(),
      joinedAt: Date.now(),
      isTyping: false,
      lastSeen: Date.now(),
    };
    this.state.currentUser = user;
    this.emit('state-change', { type: 'user-init', user });
    return user;
  }

  // Create room
  createRoom(roomId: string, roomName: string, topic: Buffer): void {
    this.state.currentRoom = {
      id: roomId,
      name: roomName,
      topic,
      createdAt: Date.now(),
      members: this.state.currentUser ? [this.state.currentUser] : [],
      messages: [],
      todos: [],
      sharedFiles: [],
    };
    this.emit('state-change', { type: 'room-created' });
  }

  // Get current state
  getState(): AppState {
    return this.state;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.state.currentUser;
  }

  // Get current room
  getCurrentRoom() {
    return this.state.currentRoom;
  }

  // Update connection status
  setConnected(isConnected: boolean): void {
    this.state.isConnected = isConnected;
    this.state.isConnecting = false;
    this.emit('state-change', { type: 'connection', isConnected });
  }

  setConnecting(isConnecting: boolean): void {
    this.state.isConnecting = isConnecting;
    this.emit('state-change', { type: 'connecting', isConnecting });
  }

  // Messages
  addMessage(message: Omit<Message, 'id'>): Message {
    const fullMessage: Message = {
      id: generateShortId(),
      ...message,
    };

    if (this.state.currentRoom) {
      this.state.currentRoom.messages.push(fullMessage);

      // Trim messages if too many
      if (this.state.currentRoom.messages.length > MAX_VISIBLE_MESSAGES) {
        this.state.currentRoom.messages = this.state.currentRoom.messages.slice(-MAX_VISIBLE_MESSAGES);
      }
    }

    this.emit('state-change', { type: 'message-added', message: fullMessage });
    return fullMessage;
  }

  addSystemMessage(content: string): void {
    this.addMessage({
      userId: 'system',
      userName: 'System',
      userColor: '#6B7280',
      content,
      timestamp: Date.now(),
      type: 'system',
    });
  }

  getMessages(): Message[] {
    return this.state.currentRoom?.messages || [];
  }

  // Todos
  addTodo(content: string, priority: 'low' | 'medium' | 'high' = 'medium'): Todo {
    const todo: Todo = {
      id: generateShortId(),
      content,
      completed: false,
      createdBy: this.state.currentUser?.id || '',
      createdByName: this.state.currentUser?.name || 'Unknown',
      createdAt: Date.now(),
      priority,
    };

    if (this.state.currentRoom) {
      this.state.currentRoom.todos.push(todo);
    }

    this.emit('state-change', { type: 'todo-added', todo });
    return todo;
  }

  updateTodo(todoId: string, updates: Partial<Todo>): Todo | null {
    if (!this.state.currentRoom) return null;

    const todoIndex = this.state.currentRoom.todos.findIndex(t => t.id === todoId);
    if (todoIndex === -1) return null;

    const todo = this.state.currentRoom.todos[todoIndex];
    Object.assign(todo, updates);

    if (updates.completed && this.state.currentUser) {
      todo.completedBy = this.state.currentUser.id;
      todo.completedAt = Date.now();
    }

    this.emit('state-change', { type: 'todo-updated', todo });
    return todo;
  }

  deleteTodo(todoId: string): boolean {
    if (!this.state.currentRoom) return false;

    const index = this.state.currentRoom.todos.findIndex(t => t.id === todoId);
    if (index === -1) return false;

    this.state.currentRoom.todos.splice(index, 1);
    this.emit('state-change', { type: 'todo-deleted', todoId });
    return true;
  }

  getTodos(): Todo[] {
    return this.state.currentRoom?.todos || [];
  }

  // Shared Files
  addSharedFile(file: SharedFile): void {
    if (this.state.currentRoom) {
      this.state.currentRoom.sharedFiles.push(file);
    }
    this.emit('state-change', { type: 'file-shared', file });
  }

  getSharedFiles(): SharedFile[] {
    return this.state.currentRoom?.sharedFiles || [];
  }

  // Peers / Users
  addPeer(user: User): void {
    if (this.state.currentRoom) {
      // Check if already exists
      const exists = this.state.currentRoom.members.some(m => m.id === user.id);
      if (!exists) {
        this.state.currentRoom.members.push(user);
      }
    }
    this.emit('state-change', { type: 'peer-joined', user });
  }

  removePeer(userId: string): void {
    if (this.state.currentRoom) {
      this.state.currentRoom.members = this.state.currentRoom.members.filter(m => m.id !== userId);
    }
    this.emit('state-change', { type: 'peer-left', userId });
  }

  setPeerTyping(userId: string, isTyping: boolean): void {
    if (this.state.currentRoom) {
      const member = this.state.currentRoom.members.find(m => m.id === userId);
      if (member) {
        member.isTyping = isTyping;
      }
    }
    this.emit('state-change', { type: 'peer-typing', userId, isTyping });
  }

  getMembers(): User[] {
    return this.state.currentRoom?.members || [];
  }

  getOnlineMembers(): User[] {
    return this.getMembers().filter(m => m.id !== this.state.currentUser?.id);
  }

  getTypingUsers(): User[] {
    return this.getMembers().filter(m => m.isTyping && m.id !== this.state.currentUser?.id);
  }

  // View & Input Mode
  setView(view: ViewType): void {
    this.state.currentView = view;
    this.emit('state-change', { type: 'view-changed', view });
  }

  getView(): ViewType {
    return this.state.currentView;
  }

  setInputMode(mode: InputMode): void {
    this.state.inputMode = mode;
    this.emit('state-change', { type: 'input-mode-changed', mode });
  }

  getInputMode(): InputMode {
    return this.state.inputMode;
  }

  // Video Call
  startVideoCall(): void {
    this.state.videoCall.isActive = true;
    this.state.videoCall.participants = this.getMembers().map(m => m.id);
    this.emit('state-change', { type: 'video-call-started' });
  }

  endVideoCall(): void {
    this.state.videoCall.isActive = false;
    this.state.videoCall.participants = [];
    this.state.videoCall.remoteStreams.clear();
    this.emit('state-change', { type: 'video-call-ended' });
  }

  isVideoCallActive(): boolean {
    return this.state.videoCall.isActive;
  }

  // Notifications
  addNotification(type: Notification['type'], message: string): void {
    const notification: Notification = {
      id: generateId(),
      type,
      message,
      timestamp: Date.now(),
    };

    this.state.notifications.push(notification);
    this.emit('notification', notification);

    // Auto-remove after duration
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, NOTIFICATION_DURATION);
  }

  removeNotification(id: string): void {
    this.state.notifications = this.state.notifications.filter(n => n.id !== id);
    this.emit('state-change', { type: 'notification-removed', id });
  }

  getNotifications(): Notification[] {
    return this.state.notifications;
  }

  // User name update
  updateUserName(name: string): void {
    if (this.state.currentUser) {
      this.state.currentUser.name = name;
      this.emit('state-change', { type: 'user-name-changed', name });
    }
  }

  // Sync state from another peer
  syncFromPeer(data: {
    messages: Message[];
    todos: Todo[];
    sharedFiles: SharedFile[];
    members: User[];
  }): void {
    if (!this.state.currentRoom) return;

    // Merge messages (avoid duplicates)
    const existingIds = new Set(this.state.currentRoom.messages.map(m => m.id));
    for (const msg of data.messages) {
      if (!existingIds.has(msg.id)) {
        this.state.currentRoom.messages.push(msg);
      }
    }
    this.state.currentRoom.messages.sort((a, b) => a.timestamp - b.timestamp);

    // Merge todos
    const existingTodoIds = new Set(this.state.currentRoom.todos.map(t => t.id));
    for (const todo of data.todos) {
      if (!existingTodoIds.has(todo.id)) {
        this.state.currentRoom.todos.push(todo);
      }
    }

    // Merge files
    const existingFileIds = new Set(this.state.currentRoom.sharedFiles.map(f => f.id));
    for (const file of data.sharedFiles) {
      if (!existingFileIds.has(file.id)) {
        this.state.currentRoom.sharedFiles.push(file);
      }
    }

    // Merge members
    const existingMemberIds = new Set(this.state.currentRoom.members.map(m => m.id));
    for (const member of data.members) {
      if (!existingMemberIds.has(member.id)) {
        this.state.currentRoom.members.push(member);
      }
    }

    this.emit('state-change', { type: 'synced' });
  }

  // Get sync data for new peers
  getSyncData() {
    return {
      messages: this.state.currentRoom?.messages || [],
      todos: this.state.currentRoom?.todos || [],
      sharedFiles: this.state.currentRoom?.sharedFiles || [],
      members: this.state.currentRoom?.members || [],
    };
  }

  // Clear chat
  clearMessages(): void {
    if (this.state.currentRoom) {
      this.state.currentRoom.messages = [];
    }
    this.emit('state-change', { type: 'messages-cleared' });
  }

  // Reset state
  reset(): void {
    this.state = this.createInitialState();
    this.emit('state-change', { type: 'reset' });
  }
}
