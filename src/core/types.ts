// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Type Definitions
// ═══════════════════════════════════════════════════════════════════════════

export interface User {
  id: string;
  name: string;
  color: string;
  joinedAt: number;
  isTyping: boolean;
  lastSeen: number;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  content: string;
  timestamp: number;
  type: 'text' | 'system' | 'file' | 'url' | 'reply';
  replyTo?: string;
  fileInfo?: FileInfo;
}

export interface Todo {
  id: string;
  content: string;
  completed: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: number;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  completedBy?: string;
  completedAt?: number;
}

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  path: string;
  sharedBy: string;
  sharedByName: string;
  sharedAt: number;
  mimeType: string;
  isDirectory: boolean;
}

export interface SharedFile extends FileInfo {
  localPath: string;
  isAvailable: boolean;
}

export interface Peer {
  id: string;
  user: User;
  connection: any;
  isConnected: boolean;
  lastPing: number;
}

export interface Room {
  id: string;
  name: string;
  topic: Buffer;
  createdAt: number;
  members: User[];
  messages: Message[];
  todos: Todo[];
  sharedFiles: SharedFile[];
}

export interface VideoCallState {
  isActive: boolean;
  participants: string[];
  localStream?: any;
  remoteStreams: Map<string, any>;
  asciiFrame?: string[][];
}

export interface AppState {
  currentUser: User | null;
  currentRoom: Room | null;
  peers: Map<string, Peer>;
  isConnected: boolean;
  isConnecting: boolean;
  currentView: ViewType;
  inputMode: InputMode;
  notifications: Notification[];
  videoCall: VideoCallState;
}

export type ViewType = 'chat' | 'todos' | 'files' | 'video' | 'settings' | 'help';
export type InputMode = 'chat' | 'command' | 'todo' | 'file-browser' | 'video-call';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

export interface Command {
  name: string;
  aliases: string[];
  description: string;
  usage: string;
  handler: (args: string[], state: AppState) => Promise<CommandResult>;
}

export interface CommandResult {
  success: boolean;
  message?: string;
  data?: any;
  action?: 'send_message' | 'change_view' | 'update_state' | 'none';
}

// Network Protocol Messages
export type NetworkMessageType =
  | 'join'
  | 'leave'
  | 'chat'
  | 'typing'
  | 'stop_typing'
  | 'todo_add'
  | 'todo_update'
  | 'todo_delete'
  | 'file_share'
  | 'file_request'
  | 'file_chunk'
  | 'video_offer'
  | 'video_answer'
  | 'video_ice'
  | 'video_frame'
  | 'ping'
  | 'pong'
  | 'sync_request'
  | 'sync_response';

export interface NetworkMessage {
  type: NetworkMessageType;
  senderId: string;
  senderName: string;
  timestamp: number;
  payload: any;
}

// Theme & Styling
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  symbols: {
    bullet: string;
    check: string;
    cross: string;
    arrow: string;
    arrowRight: string;
    circle: string;
    circleFilled: string;
    square: string;
    squareFilled: string;
    star: string;
    heart: string;
    lightning: string;
    fire: string;
  };
}

// Event types for internal communication
export type AppEvent =
  | { type: 'MESSAGE_RECEIVED'; message: Message }
  | { type: 'USER_JOINED'; user: User }
  | { type: 'USER_LEFT'; userId: string }
  | { type: 'USER_TYPING'; userId: string }
  | { type: 'USER_STOP_TYPING'; userId: string }
  | { type: 'TODO_ADDED'; todo: Todo }
  | { type: 'TODO_UPDATED'; todo: Todo }
  | { type: 'TODO_DELETED'; todoId: string }
  | { type: 'FILE_SHARED'; file: SharedFile }
  | { type: 'CONNECTION_STATUS'; isConnected: boolean }
  | { type: 'VIDEO_CALL_STARTED'; participants: string[] }
  | { type: 'VIDEO_CALL_ENDED' }
  | { type: 'VIDEO_FRAME'; userId: string; frame: string[][] };
