// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Chat View Component (Ember Theme)
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Text } from 'ink';
import type { Message, User } from '../../core/types.js';
import { formatTime, truncate, extractUrls } from '../../utils/helpers.js';
import { DEFAULT_THEME, BOX, STATUS } from '../../core/constants.js';

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
          <EmptyChat />
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

// Empty chat state
const EmptyChat: React.FC = () => {
  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" paddingY={4}>
      <Box flexDirection="column" alignItems="center" marginBottom={2}>
        <Text color={DEFAULT_THEME.colors.border}>
          {BOX.diamond}   {BOX.diamond}
        </Text>
        <Text color={DEFAULT_THEME.colors.border}>
            {BOX.dot}
        </Text>
        <Text color={DEFAULT_THEME.colors.border}>
          {BOX.diamond}   {BOX.diamond}
        </Text>
      </Box>
      <Text color={DEFAULT_THEME.colors.textMuted}>
        No messages yet
      </Text>
      <Box marginTop={1}>
        <Text color={DEFAULT_THEME.colors.accent}>
          Start chatting!
        </Text>
      </Box>
    </Box>
  );
};

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const time = formatTime(message.timestamp);

  // System message - centered with artistic styling
  if (message.type === 'system') {
    return (
      <Box paddingX={1} justifyContent="center" marginY={0}>
        <Text color={DEFAULT_THEME.colors.border}>{BOX.horizontal} </Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          {message.content}
        </Text>
        <Text color={DEFAULT_THEME.colors.border}> {BOX.horizontal}</Text>
      </Box>
    );
  }

  // File message
  if (message.type === 'file' && message.fileInfo) {
    return (
      <Box paddingX={1} paddingY={0}>
        <Text color={DEFAULT_THEME.colors.textMuted}>{time} </Text>
        <Text color={message.userColor} bold>{message.userName}</Text>
        <Text color={DEFAULT_THEME.colors.border}> {BOX.dot} </Text>
        <Text color={DEFAULT_THEME.colors.accent}>
          [{BOX.diamond}] {message.fileInfo.name}
        </Text>
      </Box>
    );
  }

  // URL detection
  const urls = extractUrls(message.content);
  const hasUrls = urls.length > 0;

  // Regular chat message with artistic styling
  return (
    <Box paddingX={1} flexDirection="column">
      <Box>
        {/* Time */}
        <Text color={DEFAULT_THEME.colors.textMuted}>{time} </Text>

        {/* User indicator */}
        <Text color={message.userColor}>{isOwn ? STATUS.online : STATUS.active} </Text>

        {/* Username */}
        <Text color={message.userColor} bold>
          {message.userName}
        </Text>
        {isOwn && <Text color={DEFAULT_THEME.colors.textMuted}> (you)</Text>}

        {/* Separator */}
        <Text color={DEFAULT_THEME.colors.border}> {BOX.dot} </Text>

        {/* Content */}
        <Text color={DEFAULT_THEME.colors.text} wrap="wrap">
          {message.content}
        </Text>
      </Box>

      {/* URL links */}
      {hasUrls && (
        <Box paddingLeft={8}>
          {urls.map((url, i) => (
            <Box key={i}>
              <Text color={DEFAULT_THEME.colors.border}>{BOX.teeRight} </Text>
              <Text color={DEFAULT_THEME.colors.info} underline>
                {truncate(url, 50)}
              </Text>
            </Box>
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
  const [frame, setFrame] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setFrame((f) => (f + 1) % 4);
    }, 300);
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

  const dots = [BOX.dot, BOX.diamond, BOX.diamondFilled, BOX.diamond];

  return (
    <Box>
      <Text color={DEFAULT_THEME.colors.primary}>{dots[frame]} </Text>
      <Text color={DEFAULT_THEME.colors.textMuted}>
        {text}
      </Text>
      <Text color={DEFAULT_THEME.colors.primary}> {dots[frame]}</Text>
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
  prefix = DEFAULT_THEME.symbols.arrowRight,
}) => {
  return (
    <Box
      borderStyle="round"
      borderColor={DEFAULT_THEME.colors.primary}
      paddingX={1}
    >
      <Text color={DEFAULT_THEME.colors.primary}>{prefix} </Text>
      <Text color={value ? DEFAULT_THEME.colors.text : DEFAULT_THEME.colors.textMuted}>
        {value || placeholder}
      </Text>
      <Text color={DEFAULT_THEME.colors.accent}>|</Text>
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
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={DEFAULT_THEME.colors.primary}>{BOX.diamondFilled} </Text>
        <Text color={DEFAULT_THEME.colors.accent} bold>
          Online
        </Text>
        <Text color={DEFAULT_THEME.colors.textMuted}> ({users.length})</Text>
      </Box>

      {/* Divider */}
      <Box marginBottom={1}>
        <Text color={DEFAULT_THEME.colors.border}>
          {BOX.horizontal.repeat(16)}
        </Text>
      </Box>

      {/* User list */}
      {users.map((user) => (
        <Box key={user.id} marginBottom={0}>
          <Text color={DEFAULT_THEME.colors.success}>{STATUS.online} </Text>
          <Text color={user.color} bold>
            {user.name}
          </Text>
          {user.id === currentUserId && (
            <Text color={DEFAULT_THEME.colors.textMuted}> (you)</Text>
          )}
          {user.isTyping && (
            <Text color={DEFAULT_THEME.colors.accent}> {BOX.dot}{BOX.dot}{BOX.dot}</Text>
          )}
        </Box>
      ))}

      {/* Footer decoration */}
      <Box marginTop={1}>
        <Text color={DEFAULT_THEME.colors.border}>
          {BOX.horizontal.repeat(16)}
        </Text>
      </Box>
    </Box>
  );
};
