#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - P2P Terminal Collaboration Platform
// ═══════════════════════════════════════════════════════════════════════════
//
//  ████████╗███████╗██████╗ ███╗   ███╗ █████╗  █████╗ ███████╗
//  ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██╔══██╗██╔══██╗╚══███╔╝
//     ██║   █████╗  ██████╔╝██╔████╔██║███████║███████║  ███╔╝
//     ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══██║██╔══██║ ███╔╝
//     ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║  ██║██║  ██║███████╗
//     ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
//
//  Chat • Todos • Files • Video Calls - All P2P in your terminal
//
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { render, Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { App } from './ui/App.js';
import { WelcomeScreen } from './ui/WelcomeScreen.js';
import { DEFAULT_THEME, LOGO, WELCOME_MESSAGE } from './core/constants.js';
import os from 'os';

// Parse command line arguments
const args = process.argv.slice(2);

interface CLIOptions {
  roomId?: string;
  userName?: string;
  password?: string;
  create: boolean;
  help: boolean;
  skipIntro: boolean;
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    create: false,
    help: false,
    skipIntro: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--create' || arg === '-c') {
      options.create = true;
    } else if (arg === '--join' || arg === '-j') {
      options.roomId = args[++i];
    } else if (arg === '--name' || arg === '-n') {
      options.userName = args[++i];
    } else if (arg === '--password' || arg === '-p') {
      options.password = args[++i];
    } else if (arg === '--skip-intro' || arg === '-s') {
      options.skipIntro = true;
    } else if (!arg.startsWith('-') && !options.roomId) {
      // Treat standalone argument as room ID
      options.roomId = arg;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
${LOGO}
  ${DEFAULT_THEME.colors.primary}TERMAAZ${'\x1b[0m'} - P2P Terminal Collaboration Platform

  ${'\x1b[1m'}USAGE:${'\x1b[0m'}
    termaaz [options] [room-id]

  ${'\x1b[1m'}OPTIONS:${'\x1b[0m'}
    -c, --create          Create a new room
    -j, --join <room-id>  Join an existing room
    -n, --name <name>     Set your display name
    -p, --password <pwd>  Set room password
    -s, --skip-intro      Skip welcome animation
    -h, --help            Show this help message

  ${'\x1b[1m'}EXAMPLES:${'\x1b[0m'}
    termaaz --create                    Create a new room
    termaaz --join abc123def456         Join room with ID
    termaaz abc123def456                Join room (shorthand)
    termaaz -c -n "Alice"               Create room with custom name

  ${'\x1b[1m'}FEATURES:${'\x1b[0m'}
    💬 Real-time P2P chat
    📋 Shared todo lists
    📁 File sharing & browsing
    📹 ASCII video calls
    🔒 End-to-end encrypted
    🌐 No server required

  ${'\x1b[1m'}IN-APP COMMANDS:${'\x1b[0m'}
    /chat <message>       Send a message
    /todo add <task>      Add a todo item
    /file share <path>    Share a file
    /call start           Start video call
    /help                 Show all commands

  Made with ♥ using Hyperswarm P2P technology
`);
}

// Setup screen component for getting user info
interface SetupScreenProps {
  onComplete: (userName: string, roomId: string | null, createRoom: boolean) => void;
  initialRoomId?: string;
  initialName?: string;
  createMode: boolean;
}

const SetupScreen: React.FC<SetupScreenProps> = ({
  onComplete,
  initialRoomId,
  initialName,
  createMode,
}) => {
  const [step, setStep] = React.useState<'name' | 'room'>('name');
  const [userName, setUserName] = React.useState(initialName || '');
  const [roomId, setRoomId] = React.useState(initialRoomId || '');

  const handleNameSubmit = () => {
    if (userName.trim()) {
      if (createMode || initialRoomId) {
        onComplete(userName.trim(), initialRoomId || null, createMode);
      } else {
        setStep('room');
      }
    }
  };

  const handleRoomSubmit = () => {
    onComplete(userName.trim(), roomId.trim() || null, !roomId.trim());
  };

  return (
    <Box flexDirection="column" padding={2}>
      {/* Logo */}
      <Box flexDirection="column" marginBottom={2}>
        {LOGO.split('\n').slice(1, 7).map((line, i) => (
          <Text key={i} color={DEFAULT_THEME.colors.primary}>
            {line}
          </Text>
        ))}
      </Box>

      <Box marginBottom={1}>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          P2P Terminal Collaboration Platform
        </Text>
      </Box>

      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={DEFAULT_THEME.colors.primary}
        padding={2}
        marginTop={1}
      >
        {step === 'name' ? (
          <>
            <Box marginBottom={1}>
              <Text color={DEFAULT_THEME.colors.text}>
                What's your name?
              </Text>
            </Box>
            <Box>
              <Text color={DEFAULT_THEME.colors.primary}>› </Text>
              <TextInput
                value={userName}
                onChange={setUserName}
                onSubmit={handleNameSubmit}
                placeholder={os.userInfo().username || 'Enter your name'}
              />
            </Box>
            <Box marginTop={1}>
              <Text color={DEFAULT_THEME.colors.textMuted}>
                Press Enter to continue
              </Text>
            </Box>
          </>
        ) : (
          <>
            <Box marginBottom={1}>
              <Text color={DEFAULT_THEME.colors.text}>
                Enter Room ID to join (or leave empty to create new):
              </Text>
            </Box>
            <Box>
              <Text color={DEFAULT_THEME.colors.primary}>› </Text>
              <TextInput
                value={roomId}
                onChange={setRoomId}
                onSubmit={handleRoomSubmit}
                placeholder="Leave empty to create new room"
              />
            </Box>
            <Box marginTop={1}>
              <Text color={DEFAULT_THEME.colors.textMuted}>
                Press Enter to {roomId ? 'join' : 'create new room'}
              </Text>
            </Box>
          </>
        )}
      </Box>

      <Box marginTop={2}>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          Tip: Use --help to see command line options
        </Text>
      </Box>
    </Box>
  );
};

// Main entry point
async function main(): Promise<void> {
  const options = parseArgs(args);

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Function to start the app after welcome screen
  const startApp = (userName: string, roomId: string | undefined, createRoom: boolean, password?: string) => {
    render(
      <App
        roomId={roomId}
        userName={userName}
        createRoom={createRoom}
        roomPassword={password}
      />
    );
  };

  // Function to show setup screen
  const showSetup = (password?: string) => {
    let resolved = false;
    const { unmount } = render(
      <SetupScreen
        onComplete={(name, room, create) => {
          if (resolved) return;
          resolved = true;
          unmount();
          startApp(name, room || undefined, create, password);
        }}
        initialRoomId={options.roomId}
        initialName={options.userName}
        createMode={options.create}
      />
    );
  };

  // Skip intro if flag is set or all info provided via CLI
  if (options.skipIntro) {
    if (options.userName && (options.create || options.roomId)) {
      startApp(options.userName, options.roomId, options.create && !options.roomId, options.password);
    } else {
      showSetup(options.password);
    }
    return;
  }

  // Show welcome screen first - it now collects name and password
  let welcomeResolved = false;
  const { unmount: unmountWelcome, waitUntilExit } = render(
    <WelcomeScreen
      onComplete={(userName, password) => {
        if (welcomeResolved) return;
        welcomeResolved = true;
        unmountWelcome();

        // Welcome screen now collects name and password
        // Go directly to app with create mode (anyone can create/join the global room)
        startApp(userName, options.roomId, options.create || !options.roomId, password);
      }}
      roomPassword={options.password}
      initialName={options.userName}
    />
  );

  await waitUntilExit();
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
