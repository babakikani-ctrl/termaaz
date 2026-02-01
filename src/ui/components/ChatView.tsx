// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Chat View Component (Clean UI)
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Text } from 'ink';
import type { Message, User } from '../../core/types.js';
import { formatTime, truncate, extractUrls } from '../../utils/helpers.js';
import { DEFAULT_THEME, STATUS } from '../../core/constants.js';

interface ChatViewProps {
  messages: Message[];
  currentUserId: string;
  typingUsers: User[];
  height?: number;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  currentUserId,
  typingUsers,
  height = 15,
}) => {
  const visibleMessages = messages.slice(-height);

  return (
    <Box flexDirection="column" flexGrow={1}>
      {/* Messages */}
      <Box flexDirection="column" flexGrow={1}>
        {visibleMessages.length === 0 ? (
          <Box justifyContent="center" paddingY={2}>
            <Text color={DEFAULT_THEME.colors.textMuted}>
              No messages yet. Start chatting!
            </Text>
          </Box>
        ) : (
          visibleMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.userId === currentUserId}
            />
          ))
        )}
      </Box>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <Box paddingX={1}>
          <TypingIndicator users={typingUsers} />
        </Box>
      )}
    </Box>
  );
};

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const time = formatTime(message.timestamp);

  // System message
  if (message.type === 'system') {
    return (
      <Box paddingX={1} justifyContent="center">
        <Text color={DEFAULT_THEME.colors.textMuted}>
          --- {message.content} ---
        </Text>
      </Box>
    );
  }

  // File message
  if (message.type === 'file' && message.fileInfo) {
    return (
      <Box paddingX={1} paddingY={0}>
        <Text color={DEFAULT_THEME.colors.textMuted}>{time} </Text>
        <Text color={message.userColor} bold>{message.userName}</Text>
        <Text color={DEFAULT_THEME.colors.textMuted}> shared </Text>
        <Text color={DEFAULT_THEME.colors.accent}>[file] {message.fileInfo.name}</Text>
      </Box>
    );
  }

  // URL detection
  const urls = extractUrls(message.content);
  const hasUrls = urls.length > 0;

  // Regular chat message
  return (
    <Box paddingX={1} flexDirection="column">
      <Box>
        <Text color={DEFAULT_THEME.colors.textMuted}>{time} </Text>
        <Text color={message.userColor} bold>
          {message.userName}
          {isOwn ? ' (you)' : ''}
        </Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>: </Text>
        <Text color={DEFAULT_THEME.colors.text} wrap="wrap">
          {message.content}
        </Text>
      </Box>
      {hasUrls && (
        <Box paddingLeft={6}>
          {urls.map((url, i) => (
            <Text key={i} color={DEFAULT_THEME.colors.accent} underline>
              [link] {truncate(url, 50)}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};

interface TypingIndicatorProps {
  users: User[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  const [dots, setDots] = React.useState(1);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setDots((d) => (d % 3) + 1);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  if (users.length === 0) return null;

  const names = users.map((u) => u.name);
  let text: string;

  if (names.length === 1) {
    text = `${names[0]} is typing`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing`;
  } else {
    text = `${names[0]} and ${names.length - 1} others are typing`;
  }

  return (
    <Box>
      <Text color={DEFAULT_THEME.colors.textMuted}>
        {'.'.repeat(dots)} {text}{'.'.repeat(dots)}
      </Text>
    </Box>
  );
};

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  prefix?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type a message...',
  prefix = '>',
}) => {
  return (
    <Box
      borderStyle="round"
      borderColor={DEFAULT_THEME.colors.border}
      paddingX={1}
    >
      <Text color={DEFAULT_THEME.colors.primary}>{prefix} </Text>
      <Text color={value ? DEFAULT_THEME.colors.text : DEFAULT_THEME.colors.textMuted}>
        {value || placeholder}
      </Text>
      <Text color={DEFAULT_THEME.colors.primary}>|</Text>
    </Box>
  );
};

interface OnlineUsersProps {
  users: User[];
  currentUserId: string;
}

export const OnlineUsers: React.FC<OnlineUsersProps> = ({ users, currentUserId }) => {
  return (
    <Box flexDirection="column" paddingX={1}>
      <Box marginBottom={1}>
        <Text color={DEFAULT_THEME.colors.textMuted} bold>
          Online ({users.length})
        </Text>
      </Box>
      {users.map((user) => (
        <Box key={user.id}>
          <Text color={DEFAULT_THEME.colors.success}>{STATUS.online} </Text>
          <Text color={user.color}>
            {user.name}
            {user.id === currentUserId ? ' (you)' : ''}
          </Text>
          {user.isTyping && (
            <Text color={DEFAULT_THEME.colors.textMuted}> ...</Text>
          )}
        </Box>
      ))}
    </Box>
  );
};
