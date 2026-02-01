// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Design System & Constants
// Theme: "Ember" - Warm, Artistic, Memorable
// ═══════════════════════════════════════════════════════════════════════════

import type { Theme } from './types.js';

export const APP_NAME = 'termaaz';
export const APP_VERSION = '1.0.0';
export const APP_TAGLINE = 'where terminals meet';

// Network Constants
export const PROTOCOL_VERSION = 1;
export const PING_INTERVAL = 5000;
export const PEER_TIMEOUT = 15000;
export const FILE_CHUNK_SIZE = 64 * 1024;
export const MAX_MESSAGE_LENGTH = 5000;

// UI Constants
export const MAX_VISIBLE_MESSAGES = 100;
export const TYPING_TIMEOUT = 3000;
export const NOTIFICATION_DURATION = 5000;

// ASCII Video Constants
export const ASCII_CHARS = ' .,:;+*?%S#@';
export const VIDEO_WIDTH = 80;
export const VIDEO_HEIGHT = 24;
export const VIDEO_FPS = 12;

// ═══════════════════════════════════════════════════════════════════════════
// COLOR PALETTE: "Ember" - Warm sunset tones
// Inspired by: golden hour, campfire, autumn
// ═══════════════════════════════════════════════════════════════════════════

export const USER_COLORS = [
  '#F97316', // Ember Orange
  '#FB923C', // Soft Orange
  '#FBBF24', // Golden
  '#FCD34D', // Warm Yellow
  '#F87171', // Coral
  '#FB7185', // Rose
  '#E879F9', // Orchid
  '#C084FC', // Lavender
  '#A78BFA', // Violet
  '#818CF8', // Periwinkle
];

// Theme: Ember - Warm & Inviting
export const DEFAULT_THEME: Theme = {
  name: 'ember',
  colors: {
    primary: '#F97316',       // Ember Orange - main brand color
    secondary: '#FBBF24',     // Golden - highlights
    accent: '#FCD34D',        // Warm Yellow - accents
    background: '#0C0A09',    // Warm Black
    surface: '#1C1917',       // Warm Dark
    text: '#FEF3C7',          // Cream White
    textMuted: '#A8A29E',     // Warm Gray
    border: '#44403C',        // Warm Border
    success: '#84CC16',       // Lime - fresh
    warning: '#FBBF24',       // Golden
    error: '#F87171',         // Coral Red
    info: '#38BDF8',          // Sky Blue
  },
  symbols: {
    bullet: '◦',
    check: '✓',
    cross: '×',
    arrow: '→',
    arrowRight: '▸',
    circle: '○',
    circleFilled: '●',
    square: '□',
    squareFilled: '■',
    star: '✦',
    heart: '♡',
    lightning: '⚡',
    fire: '◆',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// VISUAL ELEMENTS - Artistic Box Drawing
// ═══════════════════════════════════════════════════════════════════════════

export const BOX = {
  // Rounded (soft, friendly)
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
  // Double (emphasis)
  doubleHorizontal: '═',
  doubleVertical: '║',
  doubleTopLeft: '╔',
  doubleTopRight: '╗',
  doubleBottomLeft: '╚',
  doubleBottomRight: '╝',
  // Decorative
  dot: '·',
  bullet: '•',
  diamond: '◇',
  diamondFilled: '◆',
  star: '✦',
  spark: '✧',
};

// Status with visual hierarchy
export const STATUS = {
  online: '●',
  offline: '○',
  typing: '···',
  sending: '↑',
  receiving: '↓',
  error: '✗',
  success: '✓',
  pending: '◌',
  active: '◆',
  inactive: '◇',
};

// Keyboard Shortcuts
export const SHORTCUTS = {
  'Ctrl+C': 'Exit',
  'Tab': 'Switch View',
  'Esc': 'Cancel/Back',
  '/': 'Commands',
  'Enter': 'Send',
  '↑/↓': 'Navigate',
};

// ═══════════════════════════════════════════════════════════════════════════
// BRAND IDENTITY - Logo & Mascot
// ═══════════════════════════════════════════════════════════════════════════

// Minimal artistic logo
export const LOGO = `
  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
  █                                     █
  █   ▀▀█▀▀ ▀▀█▀▀ █▀▀▄ █▀▄▀█ ▄▀▄ ▄▀▄ ▀▀▀█   █
  █     █   █▀▀  █▀▀▄ █ ▀ █ █▀█ █▀█  ▄▀    █
  █     ▀   ▀▀▀▀ ▀  ▀ ▀   ▀ ▀ ▀ ▀ ▀ ▀▀▀▀   █
  █                                     █
  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
`;

// Compact logo for header
export const LOGO_SMALL = '◆ termaaz';

// Mascot: A friendly flame/ember character
export const MASCOT = `
    ,
   /|\\
  / | \\
 /  |  \\
    |
   ~~~
`;

export const MASCOT_HAPPY = `
   \\^/
  \\ | /
   \\|/
    |
   ~~~
`;

export const MASCOT_THINKING = `
    ?
   /|\\
  / | \\
    |
   ~~~
`;

// ═══════════════════════════════════════════════════════════════════════════
// DECORATIVE ELEMENTS
// ═══════════════════════════════════════════════════════════════════════════

// Section dividers
export const DIVIDER = {
  simple: '────────────────────────────────',
  dots: '· · · · · · · · · · · · · · · ·',
  fancy: '─ ◆ ─────────────────────── ◆ ─',
  wave: '∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿',
  stars: '✧ · ✦ · ✧ · ✦ · ✧ · ✦ · ✧ · ✦ ·',
};

// Corner decorations
export const CORNER = {
  topLeft: '╭─◆',
  topRight: '◆─╮',
  bottomLeft: '╰─◇',
  bottomRight: '◇─╯',
};

// Loading animation frames
export const LOADER = ['◐', '◓', '◑', '◒'];
export const LOADER_DOTS = ['·  ', '·· ', '···', ' ··', '  ·', '   '];
export const LOADER_EMBER = ['◇', '◈', '◆', '◈'];

// ═══════════════════════════════════════════════════════════════════════════
// WELCOME & HELP
// ═══════════════════════════════════════════════════════════════════════════

export const COMMANDS_HELP = `
╭─◆ COMMANDS ◆────────────────────────────╮
│                                          │
│  chat     /c <msg>      send message     │
│  todo     /t add|done   manage tasks     │
│  file     /f share|get  share files      │
│  video    /v start|end  video call       │
│  users    /u            who's online     │
│  help     /h            this menu        │
│                                          │
╰──────────────────────────── ◇ termaaz ◇─╯
`;

export const WELCOME_MESSAGE = `
${LOGO}
           ◇ where terminals meet ◇
    ─────────────────────────────────
         chat · todos · files · video
              all peer-to-peer
    ─────────────────────────────────
`;

// ═══════════════════════════════════════════════════════════════════════════
// ASCII ART LIBRARY
// ═══════════════════════════════════════════════════════════════════════════

export const ART = {
  camera: `
   ╭─────────╮
   │ ◉     ◉ │
   │    ▽    │
   ╰─────────╯
  `,
  file: `
   ╭──────╮
   │ ≡≡≡≡ │
   │ ≡≡≡  │
   │ ≡≡≡≡ │
   ╰──────╯
  `,
  check: `
      ╱
     ╱
   ╲╱
  `,
  chat: `
   ╭───────╮
   │ ····· │
   │ ···   │
   ╰─╮ ────╯
     ╰
  `,
  user: `
     ◠
    (  )
     /\\
  `,
  users: `
    ◠  ◠
   (  )(  )
    /\\ /\\
  `,
  video: `
   ╭─────╮  ╲
   │  ◉  │   ╲
   │     │   ╱
   ╰─────╯  ╱
  `,
  waiting: `
     ◠
    (  )  ?
     /\\
  `,
  connected: `
   ◠──────◠
  (  )    (  )
   /\\      /\\
  `,
};
