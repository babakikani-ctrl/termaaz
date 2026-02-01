// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Help View Component (Ember Theme)
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Text } from 'ink';
import { DEFAULT_THEME, APP_VERSION, BOX, STATUS, LOGO_SMALL } from '../../core/constants.js';

interface HelpViewProps {
  scrollOffset?: number;
}

export const HelpView: React.FC<HelpViewProps> = ({ scrollOffset = 0 }) => {
  return (
    <Box flexDirection="column" flexGrow={1} padding={1}>
      {/* Artistic Logo Header */}
      <Box flexDirection="column" alignItems="center" marginBottom={1}>
        <Text color={DEFAULT_THEME.colors.primary}>
          {BOX.star} {BOX.horizontal.repeat(8)} {BOX.star}
        </Text>
        <Box marginY={1}>
          <Text color={DEFAULT_THEME.colors.primary} bold>
            {BOX.diamondFilled} termaaz {BOX.diamondFilled}
          </Text>
        </Box>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          where terminals meet
        </Text>
        <Text color={DEFAULT_THEME.colors.primary}>
          {BOX.star} {BOX.horizontal.repeat(8)} {BOX.star}
        </Text>
      </Box>

      {/* Version info */}
      <Box justifyContent="center" marginBottom={1}>
        <Text color={DEFAULT_THEME.colors.border}>{BOX.diamond} </Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>v{APP_VERSION}</Text>
        <Text color={DEFAULT_THEME.colors.border}> {BOX.dot} </Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>P2P Collaboration</Text>
        <Text color={DEFAULT_THEME.colors.border}> {BOX.diamond}</Text>
      </Box>

      {/* Commands sections */}
      <Box flexDirection="column" gap={1}>
        <CommandSection
          title="Chat"
          icon={BOX.diamondFilled}
          commands={[
            { cmd: '/chat <msg>', desc: 'Send message' },
            { cmd: '/reply <id> <msg>', desc: 'Reply to message' },
            { cmd: '/clear', desc: 'Clear history' },
          ]}
        />

        <CommandSection
          title="Tasks"
          icon={BOX.diamondFilled}
          commands={[
            { cmd: '/todo', desc: 'View tasks' },
            { cmd: '/todo add <task>', desc: 'Add task' },
            { cmd: '/todo done <id>', desc: 'Complete task' },
            { cmd: '/todo delete <id>', desc: 'Remove task' },
            { cmd: '/todo priority <id> <level>', desc: 'Set priority' },
          ]}
        />

        <CommandSection
          title="Files"
          icon={BOX.diamondFilled}
          commands={[
            { cmd: '/file', desc: 'File browser' },
            { cmd: '/file share <path>', desc: 'Share file' },
            { cmd: '/file list', desc: 'List shared' },
            { cmd: '/file get <id>', desc: 'Download' },
          ]}
        />

        <CommandSection
          title="Video"
          icon={BOX.diamondFilled}
          commands={[
            { cmd: '/videocall', desc: 'Video menu' },
            { cmd: '/call start', desc: 'Start call' },
            { cmd: '/call end', desc: 'End call' },
            { cmd: '/call mute', desc: 'Toggle mute' },
          ]}
        />

        <CommandSection
          title="Camera"
          icon={BOX.diamondFilled}
          commands={[
            { cmd: '/qr', desc: 'Setup guide' },
            { cmd: '/camera <ip:port>', desc: 'Connect phone' },
            { cmd: '/camera off', desc: 'Disconnect' },
          ]}
        />

        <CommandSection
          title="Other"
          icon={BOX.diamond}
          commands={[
            { cmd: '/users', desc: 'Online users' },
            { cmd: '/name <name>', desc: 'Change name' },
            { cmd: '/help', desc: 'This menu' },
            { cmd: '/quit', desc: 'Exit' },
          ]}
        />
      </Box>

      {/* Keyboard shortcuts */}
      <Box flexDirection="column" marginTop={1}>
        <Box marginBottom={1}>
          <Text color={DEFAULT_THEME.colors.primary}>{BOX.diamondFilled} </Text>
          <Text color={DEFAULT_THEME.colors.accent} bold>Shortcuts</Text>
        </Box>
        <Box flexDirection="column" paddingLeft={2}>
          <ShortcutRow keys="Tab" desc="Switch views" />
          <ShortcutRow keys="Esc" desc="Go back" />
          <ShortcutRow keys="Up/Down" desc="Navigate" />
          <ShortcutRow keys="Enter" desc="Confirm" />
          <ShortcutRow keys="Ctrl+C" desc="Exit" />
        </Box>
      </Box>

      {/* Tip box */}
      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text color={DEFAULT_THEME.colors.accent}>{BOX.topLeft}{BOX.horizontal} Tip {BOX.horizontal.repeat(30)}{BOX.topRight}</Text>
        </Box>
        <Box paddingX={1}>
          <Text color={DEFAULT_THEME.colors.text}>
            Type / to see command menu
          </Text>
        </Box>
        <Box>
          <Text color={DEFAULT_THEME.colors.accent}>{BOX.bottomLeft}{BOX.horizontal.repeat(36)}{BOX.bottomRight}</Text>
        </Box>
      </Box>

      {/* Footer */}
      <Box marginTop={1} justifyContent="center">
        <Text color={DEFAULT_THEME.colors.border}>{BOX.diamond} </Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>Powered by Hyperswarm P2P</Text>
        <Text color={DEFAULT_THEME.colors.border}> {BOX.diamond}</Text>
      </Box>
    </Box>
  );
};

interface CommandSectionProps {
  title: string;
  icon: string;
  commands: Array<{ cmd: string; desc: string }>;
}

const CommandSection: React.FC<CommandSectionProps> = ({ title, icon, commands }) => {
  return (
    <Box flexDirection="column">
      <Box marginBottom={0}>
        <Text color={DEFAULT_THEME.colors.primary}>{icon} </Text>
        <Text color={DEFAULT_THEME.colors.accent} bold>{title}</Text>
      </Box>
      <Box flexDirection="column" paddingLeft={2}>
        {commands.map((c, i) => (
          <Box key={i}>
            <Text color={DEFAULT_THEME.colors.secondary}>{c.cmd.padEnd(28)}</Text>
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
      <Text color={DEFAULT_THEME.colors.accent} bold>[{keys}]</Text>
      <Text color={DEFAULT_THEME.colors.border}> {BOX.dot} </Text>
      <Text color={DEFAULT_THEME.colors.textMuted}>{desc}</Text>
    </Box>
  );
};

// Welcome screen with artistic design
export const WelcomeScreen: React.FC<{ roomId: string; userName: string }> = ({
  roomId,
  userName,
}) => {
  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" padding={2}>
      {/* Artistic logo */}
      <Box flexDirection="column" alignItems="center" marginBottom={2}>
        <Text color={DEFAULT_THEME.colors.primary}>
          {BOX.star} {BOX.dot} {BOX.diamondFilled} {BOX.dot} {BOX.star}
        </Text>
        <Box marginY={1}>
          <Text color={DEFAULT_THEME.colors.primary} bold>
            {BOX.doubleHorizontal.repeat(3)} termaaz {BOX.doubleHorizontal.repeat(3)}
          </Text>
        </Box>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          where terminals meet
        </Text>
        <Text color={DEFAULT_THEME.colors.primary}>
          {BOX.star} {BOX.dot} {BOX.diamondFilled} {BOX.dot} {BOX.star}
        </Text>
      </Box>

      {/* Welcome box */}
      <Box flexDirection="column" alignItems="center" marginBottom={1}>
        <Box>
          <Text color={DEFAULT_THEME.colors.primary}>
            {BOX.topLeft}{BOX.horizontal.repeat(30)}{BOX.topRight}
          </Text>
        </Box>
        <Box paddingX={2} paddingY={1} flexDirection="column" alignItems="center">
          <Box>
            <Text color={DEFAULT_THEME.colors.text}>Welcome, </Text>
            <Text color={DEFAULT_THEME.colors.accent} bold>{userName}</Text>
          </Box>
          <Box marginTop={1}>
            <Text color={DEFAULT_THEME.colors.textMuted}>Room: </Text>
            <Text color={DEFAULT_THEME.colors.warning} bold>{roomId}</Text>
          </Box>
        </Box>
        <Box>
          <Text color={DEFAULT_THEME.colors.primary}>
            {BOX.bottomLeft}{BOX.horizontal.repeat(30)}{BOX.bottomRight}
          </Text>
        </Box>
      </Box>

      {/* Share hint */}
      <Box marginTop={1} paddingX={2}>
        <Text color={DEFAULT_THEME.colors.border}>{BOX.diamond} </Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          Share this code with others to connect
        </Text>
        <Text color={DEFAULT_THEME.colors.border}> {BOX.diamond}</Text>
      </Box>

      {/* Quick tips */}
      <Box flexDirection="column" marginTop={2} alignItems="center">
        <Text color={DEFAULT_THEME.colors.textMuted}>
          Type a message and press Enter to chat
        </Text>
        <Box marginTop={1}>
          <Text color={DEFAULT_THEME.colors.accent}>/help</Text>
          <Text color={DEFAULT_THEME.colors.textMuted}> for all commands</Text>
        </Box>
      </Box>
    </Box>
  );
};
