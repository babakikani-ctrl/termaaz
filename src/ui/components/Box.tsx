// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Custom Box Component
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box as InkBox, Text } from 'ink';
import { DEFAULT_THEME, BOX } from '../../core/constants.js';

interface StyledBoxProps {
  children: React.ReactNode;
  title?: string;
  width?: number | string;
  height?: number | string;
  padding?: number;
  borderColor?: string;
  titleColor?: string;
  flexGrow?: number;
  flexShrink?: number;
}

export const StyledBox: React.FC<StyledBoxProps> = ({
  children,
  title,
  width,
  height,
  padding = 1,
  borderColor = DEFAULT_THEME.colors.border,
  titleColor = DEFAULT_THEME.colors.primary,
  flexGrow,
  flexShrink,
}) => {
  return (
    <InkBox
      flexDirection="column"
      width={width}
      height={height}
      flexGrow={flexGrow}
      flexShrink={flexShrink}
      borderStyle="round"
      borderColor={borderColor}
      paddingX={padding}
    >
      {title && (
        <InkBox marginBottom={1}>
          <Text color={titleColor} bold>
            {BOX.horizontal} {title} {BOX.horizontal}
          </Text>
        </InkBox>
      )}
      {children}
    </InkBox>
  );
};

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, rightContent }) => {
  return (
    <InkBox
      borderStyle="single"
      borderColor={DEFAULT_THEME.colors.primary}
      paddingX={2}
      justifyContent="space-between"
    >
      <InkBox>
        <Text color={DEFAULT_THEME.colors.primary} bold>
          {title}
        </Text>
        {subtitle && (
          <Text color={DEFAULT_THEME.colors.textMuted}> │ {subtitle}</Text>
        )}
      </InkBox>
      {rightContent && <InkBox>{rightContent}</InkBox>}
    </InkBox>
  );
};

interface StatusBarProps {
  items: Array<{ label: string; value: string; color?: string }>;
}

export const StatusBar: React.FC<StatusBarProps> = ({ items }) => {
  return (
    <InkBox
      borderStyle="single"
      borderColor={DEFAULT_THEME.colors.border}
      paddingX={1}
      justifyContent="space-between"
    >
      {items.map((item, index) => (
        <InkBox key={index}>
          <Text color={DEFAULT_THEME.colors.textMuted}>{item.label}: </Text>
          <Text color={item.color || DEFAULT_THEME.colors.text}>{item.value}</Text>
        </InkBox>
      ))}
    </InkBox>
  );
};

interface TabsProps {
  tabs: Array<{ id: string; label: string; icon?: string }>;
  activeTab: string;
  onTabChange?: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab }) => {
  return (
    <InkBox paddingX={1} gap={2}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Text
            key={tab.id}
            color={isActive ? DEFAULT_THEME.colors.accent : DEFAULT_THEME.colors.textMuted}
            bold={isActive}
            underline={isActive}
          >
            {tab.label}
          </Text>
        );
      })}
      <Text color={DEFAULT_THEME.colors.textMuted}> Tab: switch</Text>
    </InkBox>
  );
};

interface ProgressBarProps {
  progress: number;
  width?: number;
  showPercentage?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  width = 20,
  showPercentage = true,
  color = DEFAULT_THEME.colors.primary,
}) => {
  const filled = Math.round(progress * width);
  const empty = width - filled;

  return (
    <InkBox>
      <Text color={color}>{'█'.repeat(filled)}</Text>
      <Text color={DEFAULT_THEME.colors.border}>{'░'.repeat(empty)}</Text>
      {showPercentage && (
        <Text color={DEFAULT_THEME.colors.textMuted}> {Math.round(progress * 100)}%</Text>
      )}
    </InkBox>
  );
};

interface BadgeProps {
  text: string;
  color?: string;
  bgColor?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  color = DEFAULT_THEME.colors.text,
}) => {
  return (
    <Text color={color} bold inverse>
      {' '}{text}{' '}
    </Text>
  );
};

interface SpinnerProps {
  text?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ text }) => {
  const [frame, setFrame] = React.useState(0);
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  return (
    <InkBox>
      <Text color={DEFAULT_THEME.colors.primary}>{frames[frame]}</Text>
      {text && <Text color={DEFAULT_THEME.colors.textMuted}> {text}</Text>}
    </InkBox>
  );
};

interface DividerProps {
  title?: string;
  color?: string;
}

export const Divider: React.FC<DividerProps> = ({
  title,
  color = DEFAULT_THEME.colors.border,
}) => {
  if (title) {
    return (
      <InkBox>
        <Text color={color}>{'─'.repeat(3)} </Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>{title}</Text>
        <Text color={color}> {'─'.repeat(30)}</Text>
      </InkBox>
    );
  }
  return <Text color={color}>{'─'.repeat(50)}</Text>;
};
