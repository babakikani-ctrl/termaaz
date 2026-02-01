// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Interactive Command Menu with Arrow Key Selection
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { DEFAULT_THEME } from '../../core/constants.js';

export interface MenuOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface CommandMenuConfig {
  title: string;
  options: MenuOption[];
  onSelect: (option: MenuOption) => void;
  onCancel: () => void;
}

// Main command menu (shows when user types just "/")
export const SLASH_MENU: Omit<CommandMenuConfig, 'onSelect' | 'onCancel'> = {
  title: 'Commands',
  options: [
    { id: 'chat', label: 'Chat', description: 'Send a message' },
    { id: 'videocall', label: 'Video Call', description: 'Start video call' },
    { id: 'camera', label: 'Phone Camera', description: 'Use phone as webcam' },
    { id: 'todo', label: 'Todo List', description: 'Manage tasks' },
    { id: 'file', label: 'Files', description: 'Share files' },
    { id: 'users', label: 'Users', description: 'See online users' },
    { id: 'help', label: 'Help', description: 'Show all commands' },
    { id: 'cancel', label: 'Cancel', description: 'Close menu' },
  ],
};

// Menu configurations for different commands
export const MENU_CONFIGS: Record<string, Omit<CommandMenuConfig, 'onSelect' | 'onCancel'>> = {
  videocall: {
    title: 'Video Call',
    options: [
      { id: 'start', label: 'Start Call', description: 'Start ASCII video call' },
      { id: 'camera', label: 'Phone Camera', description: 'Show camera setup' },
      { id: 'cancel', label: 'Cancel', description: 'Go back' },
    ],
  },
  call: {
    title: 'Video Call',
    options: [
      { id: 'start', label: 'Start Call', description: 'Start video call' },
      { id: 'end', label: 'End Call', description: 'End current call' },
      { id: 'cancel', label: 'Cancel', description: 'Go back' },
    ],
  },
  camera: {
    title: 'Phone Camera',
    options: [
      { id: 'qr', label: 'Setup Guide', description: 'Show setup instructions' },
      { id: 'connect', label: 'Enter IP', description: 'Type phone IP:port' },
      { id: 'disconnect', label: 'Disconnect', description: 'Disconnect camera' },
      { id: 'cancel', label: 'Cancel', description: 'Go back' },
    ],
  },
  todo: {
    title: 'Todo List',
    options: [
      { id: 'view', label: 'View Todos', description: 'Open todo list' },
      { id: 'add', label: 'Add New', description: 'Add a new task' },
      { id: 'cancel', label: 'Cancel', description: 'Go back' },
    ],
  },
  file: {
    title: 'Files',
    options: [
      { id: 'view', label: 'View Files', description: 'See shared files' },
      { id: 'share', label: 'Share File', description: 'Share a file' },
      { id: 'browse', label: 'Browse Local', description: 'Browse local files' },
      { id: 'cancel', label: 'Cancel', description: 'Go back' },
    ],
  },
};

interface CommandMenuProps {
  config: CommandMenuConfig;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({ config }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { title, options, onSelect, onCancel } = config;

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      const selected = options[selectedIndex];
      if (selected.id === 'cancel') {
        onCancel();
      } else {
        onSelect(selected);
      }
    } else if (key.escape) {
      onCancel();
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={DEFAULT_THEME.colors.primary}
      paddingX={2}
      paddingY={1}
    >
      {/* Title */}
      <Box marginBottom={1}>
        <Text color={DEFAULT_THEME.colors.primary} bold>
          {title}
        </Text>
      </Box>

      {/* Options */}
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;
        return (
          <Box key={option.id} marginBottom={index < options.length - 1 ? 0 : 0}>
            <Text
              color={isSelected ? DEFAULT_THEME.colors.accent : DEFAULT_THEME.colors.text}
              bold={isSelected}
            >
              {isSelected ? '▸ ' : '  '}
              {option.icon ? `${option.icon} ` : ''}
              {option.label}
            </Text>
            {isSelected && option.description && (
              <Text color={DEFAULT_THEME.colors.textMuted}>
                {' '}- {option.description}
              </Text>
            )}
          </Box>
        );
      })}

      {/* Help */}
      <Box marginTop={1} borderStyle="single" borderColor={DEFAULT_THEME.colors.border} paddingX={1}>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          ↑↓ Navigate • Enter Select • Esc Cancel
        </Text>
      </Box>
    </Box>
  );
};

// Check if a command should show menu
export function shouldShowMenu(command: string): boolean {
  const cmd = command.toLowerCase().replace('/', '');
  // Only show menu if command is alone (no arguments)
  return cmd in MENU_CONFIGS;
}

// Get menu config for a command
export function getMenuConfig(command: string): Omit<CommandMenuConfig, 'onSelect' | 'onCancel'> | null {
  const cmd = command.toLowerCase().replace('/', '');
  return MENU_CONFIGS[cmd] || null;
}

export default CommandMenu;
