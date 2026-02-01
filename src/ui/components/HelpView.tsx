// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Help View Component
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Text } from 'ink';
import { DEFAULT_THEME, APP_VERSION, LOGO } from '../../core/constants.js';

interface HelpViewProps {
  scrollOffset?: number;
}

export const HelpView: React.FC<HelpViewProps> = ({ scrollOffset = 0 }) => {
  return (
    <Box flexDirection="column" flexGrow={1} padding={1}>
      {/* Logo */}
      <Box flexDirection="column" marginBottom={1}>
        {LOGO.split('\n').slice(1, 7).map((line, i) => (
          <Text key={i} color={DEFAULT_THEME.colors.primary}>
            {line}
          </Text>
        ))}
      </Box>

      <Box marginBottom={1}>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          Version {APP_VERSION} • P2P Terminal Collaboration
        </Text>
      </Box>

      {/* Commands section */}
      <CommandSection
        title="💬 Chat Commands"
        commands={[
          { cmd: '/chat <message>', desc: 'Send a message' },
          { cmd: '/reply <id> <msg>', desc: 'Reply to a message' },
          { cmd: '/clear', desc: 'Clear chat history' },
        ]}
      />

      <CommandSection
        title="📋 Todo Commands"
        commands={[
          { cmd: '/todo', desc: 'Open todo view' },
          { cmd: '/todo add <task>', desc: 'Add a new task' },
          { cmd: '/todo done <id>', desc: 'Mark task as complete' },
          { cmd: '/todo delete <id>', desc: 'Delete a task' },
          { cmd: '/todo priority <id> <low|medium|high>', desc: 'Set priority' },
        ]}
      />

      <CommandSection
        title="📁 File Commands"
        commands={[
          { cmd: '/file', desc: 'Open file browser' },
          { cmd: '/file share <path>', desc: 'Share a file or folder' },
          { cmd: '/file list', desc: 'List shared files' },
          { cmd: '/file get <id>', desc: 'Download a shared file' },
          { cmd: '/file browse', desc: 'Browse local files' },
        ]}
      />

      <CommandSection
        title="📹 Video Call Commands"
        commands={[
          { cmd: '/videocall', desc: 'Open video call menu (arrow keys!)' },
          { cmd: '/call start', desc: 'Start video call (ASCII mode)' },
          { cmd: '/call end', desc: 'End video call' },
          { cmd: '/call mute', desc: 'Toggle mute' },
        ]}
      />

      <CommandSection
        title="📱 Phone Camera"
        commands={[
          { cmd: '/qr', desc: 'Show QR code for camera setup' },
          { cmd: '/camera <ip:port>', desc: 'Connect to phone camera' },
          { cmd: '/camera off', desc: 'Disconnect camera' },
          { cmd: '/camera help', desc: 'Show setup guide' },
        ]}
      />

      <CommandSection
        title="🎉 Fun Mode (Maskharebazi!)"
        commands={[
          { cmd: '/maskharebazi', desc: 'Toggle fun animations' },
          { cmd: '/maskharebazi now', desc: 'Play animation now' },
          { cmd: '/maskharebazi list', desc: 'Show all animations' },
        ]}
      />

      <CommandSection
        title="⚙️ Other Commands"
        commands={[
          { cmd: '/users', desc: 'List online users' },
          { cmd: '/name <name>', desc: 'Change your display name' },
          { cmd: '/view <view>', desc: 'Switch view (chat/todos/files/video)' },
          { cmd: '/help', desc: 'Show this help' },
          { cmd: '/quit', desc: 'Exit Termaaz' },
        ]}
      />

      {/* Keyboard shortcuts */}
      <Box flexDirection="column" marginTop={1}>
        <Text color={DEFAULT_THEME.colors.primary} bold>
          ⌨️  Keyboard Shortcuts
        </Text>
        <Box flexDirection="column" paddingLeft={2} marginTop={1}>
          <ShortcutRow keys="Tab" desc="Switch between views" />
          <ShortcutRow keys="Esc" desc="Cancel / Go back" />
          <ShortcutRow keys="↑/↓" desc="Navigate lists" />
          <ShortcutRow keys="Enter" desc="Send message / Confirm" />
          <ShortcutRow keys="Ctrl+C" desc="Exit Termaaz" />
        </Box>
      </Box>

      {/* Drag & Drop hint */}
      <Box marginTop={1} borderStyle="round" borderColor={DEFAULT_THEME.colors.accent} padding={1}>
        <Box flexDirection="column">
          <Text color={DEFAULT_THEME.colors.accent} bold>
            💡 Tip: Drag & Drop Files
          </Text>
          <Text color={DEFAULT_THEME.colors.text}>
            Drag files from your file manager and drop them into the terminal
          </Text>
          <Text color={DEFAULT_THEME.colors.text}>
            to share them instantly with all participants!
          </Text>
        </Box>
      </Box>

      {/* Credits */}
      <Box marginTop={1} justifyContent="center">
        <Text color={DEFAULT_THEME.colors.textMuted}>
          Made with ♥ • P2P powered by Hyperswarm
        </Text>
      </Box>
    </Box>
  );
};

interface CommandSectionProps {
  title: string;
  commands: Array<{ cmd: string; desc: string }>;
}

const CommandSection: React.FC<CommandSectionProps> = ({ title, commands }) => {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color={DEFAULT_THEME.colors.primary} bold>
        {title}
      </Text>
      <Box flexDirection="column" paddingLeft={2}>
        {commands.map((c, i) => (
          <Box key={i}>
            <Text color={DEFAULT_THEME.colors.accent}>{c.cmd.padEnd(35)}</Text>
            <Text color={DEFAULT_THEME.colors.textMuted}>{c.desc}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

interface ShortcutRowProps {
  keys: string;
  desc: string;
}

const ShortcutRow: React.FC<ShortcutRowProps> = ({ keys, desc }) => {
  return (
    <Box>
      <Text color={DEFAULT_THEME.colors.warning} bold>
        {keys.padEnd(12)}
      </Text>
      <Text color={DEFAULT_THEME.colors.textMuted}>{desc}</Text>
    </Box>
  );
};

// Welcome screen shown on first connection
export const WelcomeScreen: React.FC<{ roomId: string; userName: string }> = ({
  roomId,
  userName,
}) => {
  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" padding={2}>
      {/* Logo */}
      <Box flexDirection="column" marginBottom={2}>
        {LOGO.split('\n').slice(1, 7).map((line, i) => (
          <Text key={i} color={DEFAULT_THEME.colors.primary}>
            {line}
          </Text>
        ))}
      </Box>

      {/* Room info */}
      <Box
        flexDirection="column"
        alignItems="center"
        borderStyle="round"
        borderColor={DEFAULT_THEME.colors.primary}
        padding={2}
        marginBottom={1}
      >
        <Text color={DEFAULT_THEME.colors.text}>
          Welcome, <Text color={DEFAULT_THEME.colors.accent} bold>{userName}</Text>!
        </Text>
        <Box marginTop={1}>
          <Text color={DEFAULT_THEME.colors.textMuted}>Room ID: </Text>
          <Text color={DEFAULT_THEME.colors.warning} bold>
            {roomId}
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text color={DEFAULT_THEME.colors.textMuted}>
            Share this ID with others to let them join!
          </Text>
        </Box>
      </Box>

      {/* Quick start */}
      <Box flexDirection="column" marginTop={1}>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          Type a message and press Enter to chat
        </Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          Type /help to see all available commands
        </Text>
      </Box>
    </Box>
  );
};
