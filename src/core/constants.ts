// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Constants & Theme
// ═══════════════════════════════════════════════════════════════════════════

import type { Theme } from './types.js';

export const APP_NAME = 'TERMAAZ';
export const APP_VERSION = '1.0.0';
export const APP_TAGLINE = 'P2P Terminal Collaboration';

// Network Constants
export const PROTOCOL_VERSION = 1;
export const PING_INTERVAL = 5000;
export const PEER_TIMEOUT = 15000;
export const FILE_CHUNK_SIZE = 64 * 1024; // 64KB chunks
export const MAX_MESSAGE_LENGTH = 5000;

// UI Constants
export const MAX_VISIBLE_MESSAGES = 100;
export const TYPING_TIMEOUT = 3000;
export const NOTIFICATION_DURATION = 5000;

// ASCII Video Constants
export const ASCII_CHARS = ' .:-=+*#%@';
export const VIDEO_WIDTH = 80;
export const VIDEO_HEIGHT = 24;
export const VIDEO_FPS = 10;

// User Colors (Pastel/Aesthetic)
export const USER_COLORS = [
  '#FF6B9D', // Rose
  '#C79BFF', // Lavender
  '#7EB8FF', // Sky Blue
  '#7DFFB3', // Mint
  '#FFE066', // Sunshine
  '#FF9F7A', // Peach
  '#B8E0FF', // Ice Blue
  '#FFB8D9', // Pink
  '#A8FFE0', // Seafoam
  '#FFD9A8', // Cream
];

// Default Theme - Minimal & Artistic
export const DEFAULT_THEME: Theme = {
  name: 'midnight',
  colors: {
    primary: '#7C3AED',      // Purple
    secondary: '#EC4899',     // Pink
    accent: '#06B6D4',        // Cyan
    background: '#0F0F0F',    // Near black
    surface: '#1A1A1A',       // Dark gray
    text: '#FFFFFF',          // White
    textMuted: '#6B7280',     // Gray
    border: '#2D2D2D',        // Border gray
    success: '#10B981',       // Green
    warning: '#F59E0B',       // Amber
    error: '#EF4444',         // Red
    info: '#3B82F6',          // Blue
  },
  symbols: {
    bullet: '*',
    check: 'x',
    cross: '-',
    arrow: '>',
    arrowRight: '>',
    circle: 'o',
    circleFilled: '*',
    square: '[ ]',
    squareFilled: '[x]',
    star: '*',
    heart: '<3',
    lightning: '!',
    fire: '~',
  },
};

// Box Drawing Characters
export const BOX = {
  topLeft: '╭',
  topRight: '╮',
  bottomLeft: '╰',
  bottomRight: '╯',
  horizontal: '─',
  vertical: '│',
  teeRight: '├',
  teeLeft: '┤',
  teeDown: '┬',
  teeUp: '┴',
  cross: '┼',
  // Double line variants
  doubleHorizontal: '═',
  doubleVertical: '║',
  doubleTopLeft: '╔',
  doubleTopRight: '╗',
  doubleBottomLeft: '╚',
  doubleBottomRight: '╝',
};

// Status Indicators
export const STATUS = {
  online: '●',
  offline: '○',
  typing: '...',
  sending: '↑',
  receiving: '↓',
  error: '!',
  success: '✓',
  pending: '◌',
};

// Keyboard Shortcuts Display
export const SHORTCUTS = {
  'Ctrl+C': 'Exit',
  'Tab': 'Switch View',
  'Esc': 'Cancel/Back',
  '/': 'Command Mode',
  'Enter': 'Send/Confirm',
  '↑/↓': 'Navigate',
};

// Help Text
export const COMMANDS_HELP = `
TERMAAZ COMMANDS - Type /help for details

CHAT: /chat, /reply, /clear
TODO: /todo, /todo add, /todo done, /todo delete
FILE: /file, /file share, /file list, /file get
VIDEO: /videocall, /call start, /call end, /call mute
PHONE: /qr, /camera <ip:port>, /camera off
USERS: /users, /name <name>
OTHER: /help, /quit

SHORTCUTS: Tab=Switch View | Esc=Back | Up/Down=Navigate
`;

// Welcome ASCII Art
export const LOGO = `
 ████████╗███████╗██████╗ ███╗   ███╗ █████╗  █████╗ ███████╗
 ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██╔══██╗██╔══██╗╚══███╔╝
    ██║   █████╗  ██████╔╝██╔████╔██║███████║███████║  ███╔╝
    ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══██║██╔══██║ ███╔╝
    ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║  ██║██║  ██║███████╗
    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
`;

export const WELCOME_MESSAGE = `
${LOGO}
                    P2P Terminal Collaboration
        ─────────────────────────────────────────────
            Chat • Todos • Files • Video Calls
                    All in your terminal
        ─────────────────────────────────────────────
`;
