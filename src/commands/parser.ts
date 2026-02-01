// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Command Parser & Handler
// ═══════════════════════════════════════════════════════════════════════════

import type { Command, CommandResult, AppState } from '../core/types.js';
import { COMMANDS_HELP } from '../core/constants.js';

type CommandHandler = {
  name: string;
  aliases: string[];
  description: string;
  usage: string;
  handler: (args: string[], context: CommandContext) => CommandResult | Promise<CommandResult>;
};

export interface CommandContext {
  sendMessage: (content: string) => void;
  sendTodo: (action: 'add' | 'update' | 'delete', data: any) => void;
  shareFile: (path: string) => Promise<any>;
  startVideoCall: () => void;
  endVideoCall: () => void;
  changeView: (view: string) => void;
  setInputMode: (mode: string) => void;
  getUsers: () => any[];
  getTodos: () => any[];
  getFiles: () => any[];
  updateUserName: (name: string) => void;
  clearMessages: () => void;
  quit: () => void;
  getCurrentUser: () => any;
  addNotification: (type: string, message: string) => void;
  // Phone camera functions
  connectPhoneCamera: (url: string) => Promise<boolean>;
  disconnectPhoneCamera: () => void;
  getCameraStatus: () => { connected: boolean; url: string };
  showQRCode: () => void;
  getLocalIP: () => string;
  // Fun animations
  toggleFunMode: () => boolean;
  triggerAnimation: (name?: string) => void;
  isFunModeEnabled: () => boolean;
}

const commands: CommandHandler[] = [
  // Chat commands
  {
    name: 'chat',
    aliases: ['c', 'say', 'msg'],
    description: 'Send a chat message',
    usage: '/chat <message>',
    handler: (args, ctx) => {
      const message = args.join(' ');
      if (!message) {
        return { success: false, message: 'Usage: /chat <message>' };
      }
      ctx.sendMessage(message);
      return { success: true, action: 'none' };
    },
  },

  {
    name: 'reply',
    aliases: ['r'],
    description: 'Reply to a message',
    usage: '/reply <message_id> <message>',
    handler: (args, ctx) => {
      if (args.length < 2) {
        return { success: false, message: 'Usage: /reply <message_id> <message>' };
      }
      const [replyTo, ...messageParts] = args;
      const message = messageParts.join(' ');
      ctx.sendMessage(`↳ [${replyTo}] ${message}`);
      return { success: true, action: 'none' };
    },
  },

  // Todo commands
  {
    name: 'todo',
    aliases: ['t', 'task'],
    description: 'Manage todos',
    usage: '/todo <add|done|list|delete> [args]',
    handler: (args, ctx) => {
      if (args.length === 0) {
        ctx.changeView('todos');
        return { success: true, action: 'change_view', data: { view: 'todos' } };
      }

      const [action, ...rest] = args;

      switch (action.toLowerCase()) {
        case 'add':
        case 'a':
          const content = rest.join(' ');
          if (!content) {
            return { success: false, message: 'Usage: /todo add <task description>' };
          }
          ctx.sendTodo('add', { content, priority: 'medium' });
          return { success: true, message: `Added: "${content}"` };

        case 'done':
        case 'd':
        case 'complete':
          const todoId = rest[0];
          if (!todoId) {
            return { success: false, message: 'Usage: /todo done <todo_id>' };
          }
          ctx.sendTodo('update', { id: todoId, completed: true });
          return { success: true, message: `Marked #${todoId} as done` };

        case 'list':
        case 'l':
          ctx.changeView('todos');
          return { success: true, action: 'change_view', data: { view: 'todos' } };

        case 'delete':
        case 'del':
        case 'remove':
          const delId = rest[0];
          if (!delId) {
            return { success: false, message: 'Usage: /todo delete <todo_id>' };
          }
          ctx.sendTodo('delete', { id: delId });
          return { success: true, message: `Deleted #${delId}` };

        case 'priority':
        case 'p':
          const [prioId, priority] = rest;
          if (!prioId || !priority) {
            return { success: false, message: 'Usage: /todo priority <todo_id> <low|medium|high>' };
          }
          ctx.sendTodo('update', { id: prioId, priority });
          return { success: true, message: `Updated priority of #${prioId}` };

        default:
          return { success: false, message: 'Unknown action. Use: add, done, list, delete, priority' };
      }
    },
  },

  // File commands
  {
    name: 'file',
    aliases: ['f', 'share'],
    description: 'File sharing',
    usage: '/file <share|list|get|browse> [args]',
    handler: async (args, ctx) => {
      if (args.length === 0) {
        ctx.changeView('files');
        return { success: true, action: 'change_view', data: { view: 'files' } };
      }

      const [action, ...rest] = args;

      switch (action.toLowerCase()) {
        case 'share':
        case 's':
          const filePath = rest.join(' ');
          if (!filePath) {
            return { success: false, message: 'Usage: /file share <path>' };
          }
          try {
            const result = await ctx.shareFile(filePath);
            if (result) {
              return { success: true, message: `Shared: ${result.name}` };
            }
            return { success: false, message: 'Failed to share file' };
          } catch (e) {
            return { success: false, message: `Error: ${e}` };
          }

        case 'list':
        case 'l':
          ctx.changeView('files');
          return { success: true, action: 'change_view', data: { view: 'files' } };

        case 'browse':
        case 'b':
          ctx.setInputMode('file-browser');
          ctx.changeView('files');
          return { success: true, action: 'change_view', data: { view: 'files' } };

        case 'get':
        case 'download':
          const fileId = rest[0];
          if (!fileId) {
            return { success: false, message: 'Usage: /file get <file_id>' };
          }
          return { success: true, message: `Requesting file #${fileId}...`, data: { fileId } };

        default:
          return { success: false, message: 'Unknown action. Use: share, list, browse, get' };
      }
    },
  },

  // Video call commands
  {
    name: 'call',
    aliases: ['video', 'v', 'videocall', 'vc'],
    description: 'Video call',
    usage: '/call <start|end|mute>',
    handler: (args, ctx) => {
      const action = args[0]?.toLowerCase() || 'start';

      switch (action) {
        case 'start':
          ctx.startVideoCall();
          ctx.changeView('video');
          return { success: true, message: 'Starting video call...', action: 'change_view' };

        case 'end':
        case 'stop':
          ctx.endVideoCall();
          ctx.changeView('chat');
          return { success: true, message: 'Video call ended', action: 'change_view' };

        case 'mute':
          return { success: true, message: 'Mute toggled' };

        default:
          return { success: false, message: 'Usage: /call <start|end|mute>' };
      }
    },
  },

  // Phone Camera commands
  {
    name: 'camera',
    aliases: ['cam', 'phone', 'webcam'],
    description: 'Connect to phone camera over WiFi',
    usage: '/camera <ip:port> or /camera off',
    handler: async (args, ctx) => {
      const action = args[0]?.toLowerCase();

      // No args - show status and help
      if (!action) {
        const status = ctx.getCameraStatus();
        if (status.connected) {
          return {
            success: true,
            message: `📱 Camera connected: ${status.url}\nUse /camera off to disconnect`
          };
        }
        return {
          success: true,
          message: `📱 Phone Camera - No camera connected

Usage:
  /camera 192.168.1.50:8080   Connect to phone camera
  /camera off                  Disconnect camera
  /camera help                 Show setup guide

Popular App Ports:
  • IP Webcam (Android): 8080
  • DroidCam: 4747
  • Camo/EpocCam: 5000`
        };
      }

      // Disconnect
      if (action === 'off' || action === 'disconnect' || action === 'stop') {
        ctx.disconnectPhoneCamera();
        return { success: true, message: '📱 Camera disconnected' };
      }

      // Show help
      if (action === 'help' || action === 'setup' || action === '?') {
        return {
          success: true,
          message: `📱 PHONE CAMERA SETUP

Step 1: Install a camera app on your phone
  iPhone: Camo, EpocCam, iVCam (free)
  Android: DroidCam, IP Webcam (free)

Step 2: Connect phone & PC to same WiFi

Step 3: Open camera app, find the IP address
  Usually looks like: 192.168.1.50:8080

Step 4: Connect in Termaaz
  /camera 192.168.1.50:8080

Common URLs:
  IP Webcam:  http://IP:8080/video
  DroidCam:   http://IP:4747/video
  Camo:       http://IP:5000`
        };
      }

      // Connect to camera URL
      const url = args.join(':'); // Handle IP:port format
      if (!url.match(/^[\d.:]+$/) && !url.startsWith('http')) {
        return {
          success: false,
          message: 'Invalid format. Use: /camera 192.168.1.50:8080'
        };
      }

      try {
        const connected = await ctx.connectPhoneCamera(url);
        if (connected) {
          ctx.changeView('video');
          return {
            success: true,
            message: `📱 Connected to camera at ${url}`,
            action: 'change_view'
          };
        }
        return {
          success: false,
          message: `Failed to connect to ${url}. Check IP and port.`
        };
      } catch (error) {
        return {
          success: false,
          message: `Connection error: ${error}`
        };
      }
    },
  },

  // QR Code for camera setup
  {
    name: 'qr',
    aliases: ['qrcode', 'scan'],
    description: 'Show QR code for phone camera setup',
    usage: '/qr',
    handler: (args, ctx) => {
      ctx.showQRCode();
      return {
        success: true,
        message: `📱 QR Code displayed!\n\n📍 Your IP: ${ctx.getLocalIP()}\n\nScan with your phone camera app, then use:\n  /camera <phone-ip>:<port>`,
        action: 'show_qr'
      };
    },
  },

  // User commands
  {
    name: 'users',
    aliases: ['u', 'who', 'members'],
    description: 'List online users',
    usage: '/users',
    handler: (args, ctx) => {
      const users = ctx.getUsers();
      const currentUser = ctx.getCurrentUser();
      const list = users.map(u => `  ${u.id === currentUser?.id ? '(you)' : ''} ${u.name}`).join('\n');
      return { success: true, message: `Online users (${users.length}):\n${list}` };
    },
  },

  {
    name: 'name',
    aliases: ['nick', 'nickname'],
    description: 'Change display name',
    usage: '/name <new_name>',
    handler: (args, ctx) => {
      const newName = args.join(' ');
      if (!newName) {
        return { success: false, message: 'Usage: /name <new_name>' };
      }
      ctx.updateUserName(newName);
      return { success: true, message: `Name changed to: ${newName}` };
    },
  },

  // Navigation commands
  {
    name: 'view',
    aliases: ['goto', 'switch'],
    description: 'Switch view',
    usage: '/view <chat|todos|files|video|help>',
    handler: (args, ctx) => {
      const view = args[0]?.toLowerCase();
      const validViews = ['chat', 'todos', 'files', 'video', 'help', 'settings'];
      if (!view || !validViews.includes(view)) {
        return { success: false, message: `Usage: /view <${validViews.join('|')}>` };
      }
      ctx.changeView(view);
      return { success: true, action: 'change_view' };
    },
  },

  // Utility commands
  {
    name: 'clear',
    aliases: ['cls'],
    description: 'Clear chat history',
    usage: '/clear',
    handler: (args, ctx) => {
      ctx.clearMessages();
      return { success: true, message: 'Chat cleared' };
    },
  },

  // Fun mode - Maskharebazi!
  {
    name: 'maskharebazi',
    aliases: ['fun', 'msk', 'party', 'animations'],
    description: 'Toggle fun ASCII animations',
    usage: '/maskharebazi [on|off|now|list]',
    handler: (args, ctx) => {
      const action = args[0]?.toLowerCase();

      if (!action) {
        // Toggle mode
        const isEnabled = ctx.toggleFunMode();
        return {
          success: true,
          message: isEnabled
            ? '🎉 Maskharebazi mode ON! Random animations will appear!'
            : '😴 Maskharebazi mode OFF. No more fun...',
        };
      }

      switch (action) {
        case 'on':
        case 'enable':
          if (!ctx.isFunModeEnabled()) ctx.toggleFunMode();
          return { success: true, message: '🎉 Maskharebazi mode ON!' };

        case 'off':
        case 'disable':
          if (ctx.isFunModeEnabled()) ctx.toggleFunMode();
          return { success: true, message: '😴 Maskharebazi mode OFF' };

        case 'now':
        case 'trigger':
          const animName = args[1];
          ctx.triggerAnimation(animName);
          return { success: true, message: '🎬 Animation triggered!' };

        case 'list':
          return {
            success: true,
            message: `🎨 Available animations:
  duck, cat, tree, rocket, fish, ufo, butterfly,
  ghost, heart, runner, snail, stars, rainbow,
  dancer, pacman, coffee

Usage: /maskharebazi now <name>`,
          };

        default:
          // Try to trigger specific animation
          ctx.triggerAnimation(action);
          return { success: true, message: `🎬 Playing: ${action}` };
      }
    },
  },

  {
    name: 'help',
    aliases: ['h', '?'],
    description: 'Show help',
    usage: '/help',
    handler: (args, ctx) => {
      ctx.changeView('help');
      return { success: true, action: 'change_view', data: { view: 'help' } };
    },
  },

  {
    name: 'quit',
    aliases: ['exit', 'q'],
    description: 'Exit Termaaz',
    usage: '/quit',
    handler: (args, ctx) => {
      ctx.quit();
      return { success: true, message: 'Goodbye!' };
    },
  },
];

export function parseCommand(input: string): { command: string; args: string[] } | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) return null;

  const parts = trimmed.slice(1).split(/\s+/);
  const command = parts[0]?.toLowerCase() || '';
  const args = parts.slice(1);

  return { command, args };
}

export function findCommand(name: string): CommandHandler | null {
  return commands.find(
    cmd => cmd.name === name || cmd.aliases.includes(name)
  ) || null;
}

export async function executeCommand(
  input: string,
  context: CommandContext
): Promise<CommandResult> {
  const parsed = parseCommand(input);

  if (!parsed) {
    return { success: false, message: 'Invalid command format' };
  }

  const cmd = findCommand(parsed.command);

  if (!cmd) {
    return {
      success: false,
      message: `Unknown command: /${parsed.command}. Type /help for available commands.`,
    };
  }

  try {
    const result = await cmd.handler(parsed.args, context);
    return result;
  } catch (error) {
    return {
      success: false,
      message: `Error executing command: ${error}`,
    };
  }
}

export function getCommandHelp(): string {
  return COMMANDS_HELP;
}

export function getCommandList(): string[] {
  return commands.map(cmd => cmd.name);
}

export function getCommandSuggestions(partial: string): string[] {
  const lower = partial.toLowerCase();
  const matches: string[] = [];

  for (const cmd of commands) {
    if (cmd.name.startsWith(lower)) {
      matches.push(cmd.name);
    }
    for (const alias of cmd.aliases) {
      if (alias.startsWith(lower)) {
        matches.push(alias);
      }
    }
  }

  return [...new Set(matches)].slice(0, 5);
}
