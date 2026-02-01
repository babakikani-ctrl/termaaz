// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Main Application Component
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput, useApp, useStdin } from 'ink';
import TextInput from 'ink-text-input';

import { StateManager } from '../core/state.js';
import { P2PNetwork } from '../network/p2p.js';
import { FileManager } from '../files/file-manager.js';
import { AsciiVideo } from '../video/ascii-video.js';
import { PhoneCamera } from '../video/phone-camera.js';
import { FunAnimations } from './fun-animations.js';
import { executeCommand, parseCommand, getCommandSuggestions } from '../commands/parser.js';
import type { CommandContext } from '../commands/parser.js';
import type { ViewType, Message, Todo, SharedFile, FileInfo, User } from '../core/types.js';

import { Header, StatusBar, Tabs, Spinner, Divider } from './components/Box.js';
import { ChatView, OnlineUsers } from './components/ChatView.js';
import { TodoView, TodoStats } from './components/TodoView.js';
import { FileView } from './components/FileView.js';
import { VideoView } from './components/VideoView.js';
import { HelpView, WelcomeScreen } from './components/HelpView.js';
import { QRView } from './components/QRView.js';
import { CommandMenu, shouldShowMenu, getMenuConfig, MENU_CONFIGS, SLASH_MENU } from './components/CommandMenu.js';
import type { MenuOption, CommandMenuConfig } from './components/CommandMenu.js';

import { DEFAULT_THEME, APP_NAME, TYPING_TIMEOUT } from '../core/constants.js';
import { debounce } from '../utils/helpers.js';
import { getLocalIP } from '../utils/qr-code.js';
import os from 'os';

interface AppProps {
  roomId?: string;
  userName: string;
  createRoom: boolean;
  roomPassword?: string;
}

export const App: React.FC<AppProps> = ({ roomId: initialRoomId, userName, createRoom, roomPassword }) => {
  const { exit } = useApp();
  const { isRawModeSupported } = useStdin();

  // Core managers
  const [stateManager] = useState(() => new StateManager());
  const [network, setNetwork] = useState<P2PNetwork | null>(null);
  const [fileManager] = useState(() => new FileManager('', userName));
  const [asciiVideo] = useState(() => new AsciiVideo());
  const [phoneCamera] = useState(() => new PhoneCamera());
  const [funAnimations] = useState(() => new FunAnimations());

  // Fun animations state (OFF by default)
  const [currentAnimation, setCurrentAnimation] = useState<{ frame: string; color: string } | null>(null);
  const [funModeEnabled, setFunModeEnabled] = useState(false);

  // Phone camera state
  const [phoneCameraConnected, setPhoneCameraConnected] = useState(false);
  const [phoneCameraUrl, setPhoneCameraUrl] = useState('');

  // UI State
  const [input, setInput] = useState('');
  const [currentView, setCurrentView] = useState<ViewType>('chat');
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState(initialRoomId || '');
  const [showWelcome, setShowWelcome] = useState(true);

  // Data State
  const [messages, setMessages] = useState<Message[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [localFiles, setLocalFiles] = useState<FileInfo[]>([]);
  const [currentPath, setCurrentPath] = useState(os.homedir());
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<User[]>([]);

  // Selection state for lists
  const [selectedTodoIndex, setSelectedTodoIndex] = useState(0);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [fileMode, setFileMode] = useState<'shared' | 'browser'>('shared');
  const [transfers, setTransfers] = useState<Map<string, number>>(new Map());

  // Video state
  const [localFrame, setLocalFrame] = useState<string[][]>([]);
  const [remoteFrames, setRemoteFrames] = useState<Map<string, string[][]>>(new Map());

  // QR Code state
  const [showQR, setShowQR] = useState(false);

  // Command Menu state
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandMenuConfig, setCommandMenuConfig] = useState<CommandMenuConfig | null>(null);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Typing indicator
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Setup fun animations
  useEffect(() => {
    funAnimations.on('animation-start', ({ message, color }) => {
      stateManager.addSystemMessage(message);
      updateState();
    });

    funAnimations.on('frame', ({ frame, color }) => {
      setCurrentAnimation({ frame, color });
    });

    funAnimations.on('animation-end', () => {
      setTimeout(() => setCurrentAnimation(null), 500);
    });

    // Start animations after a delay
    const startTimer = setTimeout(() => {
      if (funModeEnabled) {
        funAnimations.start();
      }
    }, 10000); // Start after 10 seconds

    return () => {
      clearTimeout(startTimer);
      funAnimations.destroy();
    };
  }, []);

  // Initialize user and connect
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const user = stateManager.initUser(userName);
        const p2p = new P2PNetwork(user.id, user.name, user.color);

        // Setup network event listeners
        p2p.on('peer-joined', (peerUser: User) => {
          stateManager.addPeer(peerUser);
          stateManager.addSystemMessage(`${peerUser.name} joined the room`);
          updateState();
        });

        p2p.on('peer-left', (peerUser: User) => {
          stateManager.removePeer(peerUser.id);
          stateManager.addSystemMessage(`${peerUser.name} left the room`);
          updateState();
        });

        p2p.on('message', (msg: any) => {
          const message = stateManager.addMessage({
            userId: msg.senderId,
            userName: msg.senderName,
            userColor: msg.payload.userColor || '#FFFFFF',
            content: msg.payload.content,
            timestamp: msg.timestamp,
            type: 'text',
            replyTo: msg.payload.replyTo,
          });
          updateState();
        });

        p2p.on('typing', ({ userId, userName }: { userId: string; userName: string }) => {
          stateManager.setPeerTyping(userId, true);
          updateState();
        });

        p2p.on('stop-typing', ({ userId }: { userId: string }) => {
          stateManager.setPeerTyping(userId, false);
          updateState();
        });

        p2p.on('todo', (msg: any) => {
          if (msg.type === 'todo_add') {
            stateManager.addTodo(msg.payload.content, msg.payload.priority);
          } else if (msg.type === 'todo_update') {
            stateManager.updateTodo(msg.payload.id, msg.payload);
          } else if (msg.type === 'todo_delete') {
            stateManager.deleteTodo(msg.payload.id);
          }
          updateState();
        });

        p2p.on('file-shared', (msg: any) => {
          fileManager.registerRemoteFile(msg.payload);
          stateManager.addSharedFile(msg.payload);
          updateState();
        });

        p2p.on('video-frame', (msg: any) => {
          setRemoteFrames((prev) => {
            const next = new Map(prev);
            next.set(msg.senderId, msg.payload.frame);
            return next;
          });
        });

        // Sync handlers - when a new peer joins, they request our data
        p2p.on('sync-request', ({ peerId }: { peerId: string }) => {
          // Send our current state to the requesting peer
          const syncData = {
            messages: stateManager.getMessages(),
            todos: stateManager.getTodos(),
            sharedFiles: stateManager.getSharedFiles(),
            members: stateManager.getMembers(),
          };
          p2p.sendSyncResponse(peerId, syncData);
        });

        // When we receive sync data from an existing peer
        p2p.on('sync-response', (msg: any) => {
          const { messages, todos, sharedFiles } = msg.payload;

          // Merge messages (avoid duplicates)
          if (messages && messages.length > 0) {
            messages.forEach((m: any) => {
              if (!stateManager.getMessages().find((existing) => existing.id === m.id)) {
                stateManager.addMessage(m);
              }
            });
          }

          // Merge todos
          if (todos && todos.length > 0) {
            todos.forEach((t: any) => {
              if (!stateManager.getTodos().find((existing) => existing.id === t.id)) {
                stateManager.addTodo(t.content, t.priority);
              }
            });
          }

          // Merge shared files
          if (sharedFiles && sharedFiles.length > 0) {
            sharedFiles.forEach((f: any) => {
              if (!stateManager.getSharedFiles().find((existing) => existing.id === f.id)) {
                stateManager.addSharedFile(f);
              }
            });
          }

          updateState();
        });

        p2p.on('ready', () => {
          setIsConnected(true);
          setIsConnecting(false);
        });

        // Create or join room
        if (createRoom) {
          const newRoomId = await p2p.createRoom('Termaaz Room');
          setRoomId(newRoomId);
          stateManager.createRoom(newRoomId, 'Termaaz Room', Buffer.from(newRoomId));
        } else if (initialRoomId) {
          await p2p.joinRoom(initialRoomId);
          stateManager.createRoom(initialRoomId, 'Termaaz Room', Buffer.from(initialRoomId));
        }

        setNetwork(p2p);
        updateState();

        // Load initial directory listing
        const files = await fileManager.listDirectory(currentPath);
        setLocalFiles(files);

        // Auto-hide welcome after delay
        setTimeout(() => setShowWelcome(false), 3000);

      } catch (error) {
        stateManager.addSystemMessage(`Connection error: ${error}`);
        setIsConnecting(false);
      }
    };

    initializeApp();

    return () => {
      network?.destroy();
      asciiVideo.destroy();
    };
  }, []);

  // Update state from manager
  const updateState = useCallback(() => {
    setMessages([...stateManager.getMessages()]);
    setTodos([...stateManager.getTodos()]);
    setSharedFiles([...stateManager.getSharedFiles()]);
    setOnlineUsers([...stateManager.getMembers()]);
    setTypingUsers([...stateManager.getTypingUsers()]);
  }, [stateManager]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      network?.sendTyping();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      network?.sendStopTyping();
    }, TYPING_TIMEOUT);
  }, [isTyping, network]);

  // Command context for command execution
  const commandContext: CommandContext = {
    sendMessage: (content: string) => {
      const user = stateManager.getCurrentUser();
      if (user) {
        network?.sendChat(content);
        stateManager.addMessage({
          userId: user.id,
          userName: user.name,
          userColor: user.color,
          content,
          timestamp: Date.now(),
          type: 'text',
        });
        updateState();
      }
    },
    sendTodo: (action, data) => {
      if (action === 'add') {
        const todo = stateManager.addTodo(data.content, data.priority);
        network?.sendTodo(action, todo);
      } else if (action === 'update') {
        const todo = stateManager.updateTodo(data.id, data);
        if (todo) network?.sendTodo(action, todo);
      } else if (action === 'delete') {
        stateManager.deleteTodo(data.id);
        network?.sendTodo(action, data);
      }
      updateState();
    },
    shareFile: async (path: string) => {
      const file = await fileManager.shareFile(path);
      if (file) {
        network?.sendFileShare(file);
        stateManager.addSharedFile(file);
        updateState();
      }
      return file;
    },
    startVideoCall: () => {
      setIsVideoActive(true);
      asciiVideo.startCapture('face');
      asciiVideo.on('frame', (frame) => {
        setLocalFrame(frame);
        network?.sendVideoFrame(frame);
      });
    },
    endVideoCall: () => {
      setIsVideoActive(false);
      asciiVideo.stopCapture();
      setLocalFrame([]);
      setRemoteFrames(new Map());
    },
    changeView: (view: string) => {
      setCurrentView(view as ViewType);
      setShowWelcome(false);
    },
    setInputMode: () => {},
    getUsers: () => stateManager.getMembers(),
    getTodos: () => stateManager.getTodos(),
    getFiles: () => stateManager.getSharedFiles(),
    updateUserName: (name: string) => {
      stateManager.updateUserName(name);
      network?.updateUserName(name);
    },
    clearMessages: () => {
      stateManager.clearMessages();
      updateState();
    },
    quit: () => exit(),
    getCurrentUser: () => stateManager.getCurrentUser(),
    addNotification: (type, message) => {
      stateManager.addNotification(type as any, message);
    },
    // Phone camera functions
    connectPhoneCamera: async (url: string) => {
      try {
        const connected = await phoneCamera.connect(url);
        if (connected) {
          setPhoneCameraConnected(true);
          setPhoneCameraUrl(url);
          setIsVideoActive(true);

          // Listen for frames from phone camera
          phoneCamera.on('frame', (frame) => {
            setLocalFrame(frame);
            network?.sendVideoFrame(frame);
          });

          phoneCamera.on('error', (err) => {
            stateManager.addSystemMessage(`Camera error: ${err.message}`);
            updateState();
          });

          phoneCamera.on('disconnected', () => {
            setPhoneCameraConnected(false);
            setPhoneCameraUrl('');
            stateManager.addSystemMessage('Phone camera disconnected');
            updateState();
          });

          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
    disconnectPhoneCamera: () => {
      phoneCamera.disconnect();
      setPhoneCameraConnected(false);
      setPhoneCameraUrl('');
      setLocalFrame([]);
    },
    getCameraStatus: () => ({
      connected: phoneCameraConnected,
      url: phoneCameraUrl,
    }),
    showQRCode: () => {
      setShowQR(true);
    },
    getLocalIP: () => getLocalIP(),
    // Fun animations
    toggleFunMode: () => {
      const newState = funAnimations.toggle();
      setFunModeEnabled(newState);
      return newState;
    },
    triggerAnimation: (name?: string) => {
      funAnimations.triggerNow(name);
    },
    isFunModeEnabled: () => funModeEnabled,
  };

  // Handle menu option selection
  const handleMenuSelect = (option: MenuOption, command: string) => {
    setShowCommandMenu(false);
    setCommandMenuConfig(null);

    // Execute the selected action based on command and option
    switch (command) {
      case 'videocall':
      case 'call':
        if (option.id === 'start') {
          commandContext.startVideoCall();
          commandContext.changeView('video');
        } else if (option.id === 'qr') {
          commandContext.showQRCode();
        } else if (option.id === 'camera') {
          stateManager.addSystemMessage('Enter camera IP: /camera <ip>:<port>');
          updateState();
        } else if (option.id === 'end') {
          commandContext.endVideoCall();
        }
        break;

      case 'camera':
        if (option.id === 'qr') {
          commandContext.showQRCode();
        } else if (option.id === 'connect') {
          stateManager.addSystemMessage('Enter camera IP: /camera <ip>:<port>');
          updateState();
        } else if (option.id === 'disconnect') {
          commandContext.disconnectPhoneCamera();
          stateManager.addSystemMessage('Camera disconnected');
          updateState();
        }
        break;

      case 'todo':
        if (option.id === 'view') {
          commandContext.changeView('todos');
        } else if (option.id === 'add') {
          stateManager.addSystemMessage('Add task: /todo add <task>');
          updateState();
        }
        break;

      case 'file':
        if (option.id === 'view') {
          commandContext.changeView('files');
        } else if (option.id === 'share') {
          stateManager.addSystemMessage('Share file: /file share <path>');
          updateState();
        } else if (option.id === 'browse') {
          commandContext.changeView('files');
          commandContext.setInputMode('file-browser');
        }
        break;

      case 'maskharebazi':
        if (option.id === 'toggle') {
          const enabled = commandContext.toggleFunMode();
          stateManager.addSystemMessage(enabled ? '🎉 Maskharebazi ON!' : '😴 Maskharebazi OFF');
          updateState();
        } else if (option.id === 'now') {
          commandContext.triggerAnimation();
          stateManager.addSystemMessage('🎬 Animation playing!');
          updateState();
        } else if (option.id === 'list') {
          stateManager.addSystemMessage('Animations: duck, cat, tree, rocket, fish, ufo, butterfly, ghost, heart, runner, snail, stars, rainbow, dancer, pacman, coffee');
          updateState();
        }
        break;
    }
  };

  // Handle slash menu selection (when user types "/" and selects a command)
  const handleSlashMenuSelect = (option: MenuOption) => {
    setShowCommandMenu(false);
    setCommandMenuConfig(null);

    if (option.id === 'cancel') return;

    // Some commands open their own sub-menu
    if (MENU_CONFIGS[option.id]) {
      const menuConfig = MENU_CONFIGS[option.id];
      setCommandMenuConfig({
        ...menuConfig,
        onSelect: (subOption) => handleMenuSelect(subOption, option.id),
        onCancel: () => {
          setShowCommandMenu(false);
          setCommandMenuConfig(null);
        },
      });
      setShowCommandMenu(true);
      return;
    }

    // Execute direct commands
    switch (option.id) {
      case 'chat':
        stateManager.addSystemMessage('Type your message and press Enter');
        updateState();
        break;
      case 'qr':
        commandContext.showQRCode();
        break;
      case 'users':
        const users = commandContext.getUsers();
        const currentUser = commandContext.getCurrentUser();
        const list = users.map(u => `${u.id === currentUser?.id ? '(you)' : ''} ${u.name}`).join(', ');
        stateManager.addSystemMessage(`Online: ${list}`);
        updateState();
        break;
      case 'help':
        commandContext.changeView('help');
        break;
    }
  };

  // Handle input submission
  const handleSubmit = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Clear input first
    setInput('');

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      network?.sendStopTyping();
    }

    // Check if just "/" - show main command menu
    if (trimmedInput === '/') {
      setCommandMenuConfig({
        ...SLASH_MENU,
        onSelect: handleSlashMenuSelect,
        onCancel: () => {
          setShowCommandMenu(false);
          setCommandMenuConfig(null);
        },
      });
      setShowCommandMenu(true);
      return;
    }

    // Check if it's a command
    if (trimmedInput.startsWith('/')) {
      // Check if this command should show a menu (no arguments)
      const parts = trimmedInput.split(/\s+/);
      const commandOnly = parts[0];
      const hasArgs = parts.length > 1;

      if (!hasArgs && shouldShowMenu(commandOnly)) {
        const menuConfig = getMenuConfig(commandOnly);
        if (menuConfig) {
          const cmd = commandOnly.toLowerCase().replace('/', '');
          setCommandMenuConfig({
            ...menuConfig,
            onSelect: (option) => handleMenuSelect(option, cmd),
            onCancel: () => {
              setShowCommandMenu(false);
              setCommandMenuConfig(null);
            },
          });
          setShowCommandMenu(true);
          return;
        }
      }

      // Execute command normally (with arguments or no menu)
      const result = await executeCommand(trimmedInput, commandContext);
      if (!result.success && result.message) {
        stateManager.addSystemMessage(result.message);
        updateState();
      } else if (result.message) {
        stateManager.addSystemMessage(result.message);
        updateState();
      }
    } else {
      // Regular message
      commandContext.sendMessage(trimmedInput);
    }
  };

  // Handle keyboard input
  useInput((inputKey, key) => {
    // Tab to switch views
    if (key.tab) {
      const views: ViewType[] = ['chat', 'todos', 'files', 'video', 'help'];
      const currentIndex = views.indexOf(currentView);
      const nextView = views[(currentIndex + 1) % views.length];
      setCurrentView(nextView);
      setShowWelcome(false);
      return;
    }

    // Escape to close menus or go back to chat
    if (key.escape) {
      if (showCommandMenu) {
        setShowCommandMenu(false);
        setCommandMenuConfig(null);
      } else if (showQR) {
        setShowQR(false);
      } else {
        setCurrentView('chat');
      }
      return;
    }

    // Arrow keys for list navigation
    if (key.upArrow || key.downArrow) {
      if (currentView === 'todos') {
        const maxIndex = todos.filter(t => !t.completed).length - 1;
        if (key.upArrow) {
          setSelectedTodoIndex(Math.max(0, selectedTodoIndex - 1));
        } else {
          setSelectedTodoIndex(Math.min(maxIndex, selectedTodoIndex + 1));
        }
      } else if (currentView === 'files') {
        const files = fileMode === 'shared' ? sharedFiles : localFiles;
        const maxIndex = files.length - 1;
        if (key.upArrow) {
          setSelectedFileIndex(Math.max(0, selectedFileIndex - 1));
        } else {
          setSelectedFileIndex(Math.min(maxIndex, selectedFileIndex + 1));
        }
      }
    }

    // Enter for file browser navigation
    if (key.return && currentView === 'files' && fileMode === 'browser') {
      const file = localFiles[selectedFileIndex];
      if (file?.isDirectory) {
        setCurrentPath(file.path);
        fileManager.listDirectory(file.path).then(setLocalFiles);
        setSelectedFileIndex(0);
      } else if (file) {
        // Share the selected file
        commandContext.shareFile(file.path);
      }
    }
  });

  // Tabs configuration
  const tabs = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'todos', label: 'Todos', icon: '📋' },
    { id: 'files', label: 'Files', icon: '📁' },
    { id: 'video', label: 'Video', icon: '📹' },
    { id: 'help', label: 'Help', icon: '❓' },
  ];

  // Render loading state
  if (isConnecting) {
    return (
      <Box flexDirection="column" padding={2} alignItems="center" justifyContent="center">
        <Spinner text="Connecting to P2P network..." />
        <Box marginTop={1}>
          <Text color={DEFAULT_THEME.colors.textMuted}>
            This may take a few seconds...
          </Text>
        </Box>
      </Box>
    );
  }

  // Main render
  return (
    <Box flexDirection="column" width="100%" height="100%">
      {/* Header - Clean & Simple */}
      <Box paddingX={1} paddingY={0} justifyContent="space-between">
        <Box gap={1}>
          <Text color={DEFAULT_THEME.colors.primary} bold>{APP_NAME}</Text>
          <Text color={DEFAULT_THEME.colors.textMuted}>Room: </Text>
          <Text color={DEFAULT_THEME.colors.accent} bold>{roomId}</Text>
        </Box>
        <Box gap={2}>
          <Text color={isConnected ? DEFAULT_THEME.colors.success : DEFAULT_THEME.colors.error}>
            {isConnected ? '●' : '○'}
          </Text>
          <Text color={DEFAULT_THEME.colors.textMuted}>{onlineUsers.length} online</Text>
        </Box>
      </Box>
      <Divider />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={currentView} />

      {/* Main content area */}
      <Box flexDirection="row" flexGrow={1}>
        {/* Left sidebar - Online users */}
        {currentView === 'chat' && (
          <Box width={20} borderStyle="single" borderColor={DEFAULT_THEME.colors.border}>
            <OnlineUsers users={onlineUsers} currentUserId={stateManager.getCurrentUser()?.id || ''} />
          </Box>
        )}

        {/* Main content */}
        <Box flexDirection="column" flexGrow={1}>
          {showWelcome && currentView === 'chat' ? (
            <WelcomeScreen roomId={roomId} userName={userName} />
          ) : (
            <>
              {currentView === 'chat' && (
                <ChatView
                  messages={messages}
                  currentUserId={stateManager.getCurrentUser()?.id || ''}
                  typingUsers={typingUsers}
                />
              )}

              {currentView === 'todos' && (
                <TodoView
                  todos={todos}
                  selectedIndex={selectedTodoIndex}
                  currentUserId={stateManager.getCurrentUser()?.id || ''}
                />
              )}

              {currentView === 'files' && (
                <FileView
                  sharedFiles={sharedFiles}
                  localFiles={localFiles}
                  currentPath={currentPath}
                  selectedIndex={selectedFileIndex}
                  mode={fileMode}
                  transfers={transfers}
                />
              )}

              {currentView === 'video' && (
                <VideoView
                  isActive={isVideoActive}
                  localFrame={localFrame}
                  remoteFrames={remoteFrames}
                  participants={onlineUsers}
                  isMuted={isMuted}
                />
              )}

              {currentView === 'help' && <HelpView />}
            </>
          )}
        </Box>

      </Box>

      {/* Fun Animation Overlay */}
      {currentAnimation && (
        <Box
          position="absolute"
          flexDirection="column"
          borderStyle="round"
          borderColor={currentAnimation.color}
          paddingX={2}
          paddingY={1}
        >
          {currentAnimation.frame.split('\n').map((line, i) => (
            <Text key={i} color={currentAnimation.color}>
              {line}
            </Text>
          ))}
        </Box>
      )}

      {/* QR Code Overlay */}
      {showQR && (
        <Box
          position="absolute"
          flexDirection="column"
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            borderStyle="double"
            borderColor={DEFAULT_THEME.colors.primary}
            paddingX={2}
            paddingY={1}
          >
            <QRView onClose={() => setShowQR(false)} />
          </Box>
        </Box>
      )}

      {/* Command Menu Overlay */}
      {showCommandMenu && commandMenuConfig && (
        <Box
          position="absolute"
          flexDirection="column"
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
        >
          <CommandMenu config={commandMenuConfig} />
        </Box>
      )}

      {/* Input area */}
      <Box
        borderStyle="round"
        borderColor={DEFAULT_THEME.colors.primary}
        paddingX={1}
      >
        <Text color={DEFAULT_THEME.colors.primary}>› </Text>
        <TextInput
          value={input}
          onChange={(value) => {
            setInput(value);
            handleTyping();
            if (showQR) setShowQR(false); // Close QR when typing
          }}
          onSubmit={handleSubmit}
          placeholder={currentView === 'chat' ? 'Type a message or /command...' : 'Type a /command...'}
        />
      </Box>

      {/* Status bar */}
      <StatusBar
        items={[
          { label: 'View', value: currentView, color: DEFAULT_THEME.colors.primary },
          { label: 'Room', value: roomId.slice(0, 8), color: DEFAULT_THEME.colors.accent },
          { label: 'Tab', value: 'switch view', color: DEFAULT_THEME.colors.textMuted },
          { label: 'Esc', value: 'back to chat', color: DEFAULT_THEME.colors.textMuted },
        ]}
      />
    </Box>
  );
};

export default App;
