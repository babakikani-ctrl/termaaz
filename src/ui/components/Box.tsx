// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Artistic UI Components (Ember Theme)
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box as InkBox, Text } from 'ink';
import {
  DEFAULT_THEME,
  BOX,
  DIVIDER,
  CORNER,
  LOADER_EMBER,
  STATUS,
  LOGO_SMALL
} from '../../core/constants.js';

// ═══════════════════════════════════════════════════════════════════════════
// STYLED BOX - Artistic container with decorative corners
// ═══════════════════════════════════════════════════════════════════════════

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
  variant?: 'default' | 'ember' | 'glow' | 'minimal';
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
  variant = 'default',
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'ember':
        return {
          borderColor: DEFAULT_THEME.colors.primary,
          decorator: BOX.diamondFilled,
        };
      case 'glow':
        return {
          borderColor: DEFAULT_THEME.colors.accent,
          decorator: BOX.star,
        };
      case 'minimal':
        return {
          borderColor: DEFAULT_THEME.colors.border,
          decorator: BOX.dot,
        };
      default:
        return {
          borderColor,
          decorator: BOX.diamond,
        };
    }
  };

  const style = getVariantStyle();

  return (
    <InkBox
      flexDirection="column"
      width={width}
      height={height}
      flexGrow={flexGrow}
      flexShrink={flexShrink}
      borderStyle="round"
      borderColor={style.borderColor}
      paddingX={padding}
    >
      {title && (
        <InkBox marginBottom={1}>
          <Text color={style.borderColor}>{style.decorator} </Text>
          <Text color={titleColor} bold>{title}</Text>
          <Text color={style.borderColor}> {style.decorator}</Text>
        </InkBox>
      )}
      {children}
    </InkBox>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// HEADER - Artistic header with logo and decorations
// ═══════════════════════════════════════════════════════════════════════════

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  showLogo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  rightContent,
  showLogo = true
}) => {
  return (
    <InkBox flexDirection="column">
      <InkBox paddingX={1} justifyContent="space-between" alignItems="center">
        <InkBox gap={1}>
          {showLogo && (
            <Text color={DEFAULT_THEME.colors.primary} bold>
              {DEFAULT_THEME.symbols.fire}
            </Text>
          )}
          <Text color={DEFAULT_THEME.colors.primary} bold>
            {title}
          </Text>
          {subtitle && (
            <>
              <Text color={DEFAULT_THEME.colors.border}>{BOX.dot}</Text>
              <Text color={DEFAULT_THEME.colors.textMuted}>{subtitle}</Text>
            </>
          )}
        </InkBox>
        {rightContent && <InkBox>{rightContent}</InkBox>}
      </InkBox>
    </InkBox>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STATUS BAR - Clean status display with Ember styling
// ═══════════════════════════════════════════════════════════════════════════

interface StatusBarProps {
  items: Array<{ label: string; value: string; color?: string }>;
}

export const StatusBar: React.FC<StatusBarProps> = ({ items }) => {
  return (
    <InkBox paddingX={1} gap={2}>
      <Text color={DEFAULT_THEME.colors.border}>{CORNER.bottomLeft}</Text>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <InkBox>
            <Text color={DEFAULT_THEME.colors.textMuted}>{item.label}</Text>
            <Text color={DEFAULT_THEME.colors.border}>{BOX.dot}</Text>
            <Text color={item.color || DEFAULT_THEME.colors.text}>{item.value}</Text>
          </InkBox>
          {index < items.length - 1 && (
            <Text color={DEFAULT_THEME.colors.border}>{BOX.vertical}</Text>
          )}
        </React.Fragment>
      ))}
      <Text color={DEFAULT_THEME.colors.border}>{CORNER.bottomRight}</Text>
    </InkBox>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// TABS - Artistic tab navigation with Ember styling
// ═══════════════════════════════════════════════════════════════════════════

interface TabsProps {
  tabs: Array<{ id: string; label: string; icon?: string }>;
  activeTab: string;
  onTabChange?: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab }) => {
  return (
    <InkBox paddingX={1} gap={1}>
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        return (
          <React.Fragment key={tab.id}>
            <InkBox>
              <Text color={isActive ? DEFAULT_THEME.colors.primary : DEFAULT_THEME.colors.border}>
                {isActive ? BOX.diamondFilled : BOX.diamond}
              </Text>
              <Text
                color={isActive ? DEFAULT_THEME.colors.accent : DEFAULT_THEME.colors.textMuted}
                bold={isActive}
              >
                {' '}{tab.label}
              </Text>
            </InkBox>
          </React.Fragment>
        );
      })}
      <InkBox marginLeft={2}>
        <Text color={DEFAULT_THEME.colors.border}>{BOX.dot} </Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>Tab</Text>
        <Text color={DEFAULT_THEME.colors.border}>{DEFAULT_THEME.symbols.arrow}</Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>switch</Text>
      </InkBox>
    </InkBox>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS BAR - Ember-styled progress indicator
// ═══════════════════════════════════════════════════════════════════════════

interface ProgressBarProps {
  progress: number;
  width?: number;
  showPercentage?: boolean;
  color?: string;
  style?: 'blocks' | 'ember' | 'dots';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  width = 20,
  showPercentage = true,
  color = DEFAULT_THEME.colors.primary,
  style = 'ember',
}) => {
  const filled = Math.round(progress * width);
  const empty = width - filled;

  const getChars = () => {
    switch (style) {
      case 'blocks':
        return { filled: '█', empty: '░' };
      case 'dots':
        return { filled: '●', empty: '○' };
      case 'ember':
      default:
        return { filled: '◆', empty: '◇' };
    }
  };

  const chars = getChars();

  return (
    <InkBox>
      <Text color={DEFAULT_THEME.colors.border}>[</Text>
      <Text color={color}>{chars.filled.repeat(filled)}</Text>
      <Text color={DEFAULT_THEME.colors.border}>{chars.empty.repeat(empty)}</Text>
      <Text color={DEFAULT_THEME.colors.border}>]</Text>
      {showPercentage && (
        <Text color={DEFAULT_THEME.colors.textMuted}> {Math.round(progress * 100)}%</Text>
      )}
    </InkBox>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// BADGE - Styled tag/badge component
// ═══════════════════════════════════════════════════════════════════════════

interface BadgeProps {
  text: string;
  color?: string;
  variant?: 'solid' | 'outline' | 'subtle';
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  color = DEFAULT_THEME.colors.primary,
  variant = 'solid',
}) => {
  switch (variant) {
    case 'outline':
      return (
        <InkBox>
          <Text color={color}>[</Text>
          <Text color={color}>{text}</Text>
          <Text color={color}>]</Text>
        </InkBox>
      );
    case 'subtle':
      return (
        <InkBox>
          <Text color={color}>{BOX.diamond} </Text>
          <Text color={color}>{text}</Text>
        </InkBox>
      );
    case 'solid':
    default:
      return (
        <Text color={color} bold inverse>
          {' '}{text}{' '}
        </Text>
      );
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SPINNER - Ember-themed loading animation
// ═══════════════════════════════════════════════════════════════════════════

interface SpinnerProps {
  text?: string;
  style?: 'default' | 'ember' | 'dots';
}

export const Spinner: React.FC<SpinnerProps> = ({ text, style = 'ember' }) => {
  const [frame, setFrame] = React.useState(0);

  const getFrames = () => {
    switch (style) {
      case 'dots':
        return ['·  ', '·· ', '···', ' ··', '  ·', '   '];
      case 'ember':
        return LOADER_EMBER;
      default:
        return ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    }
  };

  const frames = getFrames();

  React.useEffect(() => {
    const timer = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, style === 'ember' ? 200 : 80);
    return () => clearInterval(timer);
  }, [style]);

  return (
    <InkBox>
      <Text color={DEFAULT_THEME.colors.primary}>{frames[frame]}</Text>
      {text && <Text color={DEFAULT_THEME.colors.textMuted}> {text}</Text>}
    </InkBox>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DIVIDER - Artistic section dividers
// ═══════════════════════════════════════════════════════════════════════════

interface DividerProps {
  title?: string;
  color?: string;
  style?: 'simple' | 'fancy' | 'dots' | 'stars';
  width?: number;
}

export const Divider: React.FC<DividerProps> = ({
  title,
  color = DEFAULT_THEME.colors.border,
  style = 'simple',
  width = 50,
}) => {
  const getDividerLine = () => {
    switch (style) {
      case 'fancy':
        return `${BOX.horizontal} ${BOX.diamondFilled} ${BOX.horizontal.repeat(width - 6)} ${BOX.diamondFilled} ${BOX.horizontal}`;
      case 'dots':
        return `${BOX.dot} `.repeat(Math.floor(width / 2));
      case 'stars':
        return `${BOX.spark} ${BOX.dot} ${BOX.star} ${BOX.dot} `.repeat(Math.floor(width / 8));
      case 'simple':
      default:
        return BOX.horizontal.repeat(width);
    }
  };

  if (title) {
    const sideWidth = Math.floor((width - title.length - 4) / 2);
    return (
      <InkBox>
        <Text color={color}>{BOX.horizontal.repeat(sideWidth)} </Text>
        <Text color={DEFAULT_THEME.colors.primary}>{BOX.diamondFilled} </Text>
        <Text color={DEFAULT_THEME.colors.accent}>{title}</Text>
        <Text color={DEFAULT_THEME.colors.primary}> {BOX.diamondFilled}</Text>
        <Text color={color}> {BOX.horizontal.repeat(sideWidth)}</Text>
      </InkBox>
    );
  }

  return <Text color={color}>{getDividerLine()}</Text>;
};

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATION - Toast-style notification
// ═══════════════════════════════════════════════════════════════════════════

interface NotificationProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export const Notification: React.FC<NotificationProps> = ({ type, message }) => {
  const getTypeStyle = () => {
    switch (type) {
      case 'success':
        return { color: DEFAULT_THEME.colors.success, icon: STATUS.success };
      case 'warning':
        return { color: DEFAULT_THEME.colors.warning, icon: STATUS.pending };
      case 'error':
        return { color: DEFAULT_THEME.colors.error, icon: STATUS.error };
      case 'info':
      default:
        return { color: DEFAULT_THEME.colors.info, icon: STATUS.active };
    }
  };

  const style = getTypeStyle();

  return (
    <InkBox paddingX={1}>
      <Text color={style.color}>{style.icon} </Text>
      <Text color={DEFAULT_THEME.colors.text}>{message}</Text>
    </InkBox>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MENU ITEM - Selectable menu row
// ═══════════════════════════════════════════════════════════════════════════

interface MenuItemProps {
  label: string;
  description?: string;
  selected?: boolean;
  icon?: string;
  shortcut?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  label,
  description,
  selected = false,
  icon,
  shortcut,
}) => {
  return (
    <InkBox paddingX={1}>
      <Text color={selected ? DEFAULT_THEME.colors.primary : DEFAULT_THEME.colors.border}>
        {selected ? BOX.diamondFilled : BOX.diamond}
      </Text>
      <Text color={DEFAULT_THEME.colors.border}> </Text>
      {icon && <Text color={DEFAULT_THEME.colors.accent}>{icon} </Text>}
      <Text color={selected ? DEFAULT_THEME.colors.accent : DEFAULT_THEME.colors.text} bold={selected}>
        {label}
      </Text>
      {description && (
        <Text color={DEFAULT_THEME.colors.textMuted}> {BOX.dot} {description}</Text>
      )}
      {shortcut && (
        <Text color={DEFAULT_THEME.colors.border}> [{shortcut}]</Text>
      )}
    </InkBox>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATE - Artistic empty state display
// ═══════════════════════════════════════════════════════════════════════════

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  const defaultIcon = `
    ${BOX.dot}   ${BOX.dot}
      ${BOX.diamond}
    ${BOX.dot}   ${BOX.dot}
  `;

  return (
    <InkBox flexDirection="column" alignItems="center" padding={2}>
      {icon ? (
        <Text color={DEFAULT_THEME.colors.border}>{icon}</Text>
      ) : (
        <InkBox flexDirection="column" alignItems="center">
          {defaultIcon.trim().split('\n').map((line, i) => (
            <Text key={i} color={DEFAULT_THEME.colors.border}>{line}</Text>
          ))}
        </InkBox>
      )}
      <InkBox marginTop={1}>
        <Text color={DEFAULT_THEME.colors.textMuted}>{title}</Text>
      </InkBox>
      {description && (
        <Text color={DEFAULT_THEME.colors.border}>{description}</Text>
      )}
      {action && (
        <InkBox marginTop={1}>
          <Text color={DEFAULT_THEME.colors.accent}>{DEFAULT_THEME.symbols.arrow} {action}</Text>
        </InkBox>
      )}
    </InkBox>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION HEADER - Styled section title
// ═══════════════════════════════════════════════════════════════════════════

interface SectionHeaderProps {
  title: string;
  count?: number;
  action?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  count,
  action,
}) => {
  return (
    <InkBox justifyContent="space-between" marginBottom={1}>
      <InkBox>
        <Text color={DEFAULT_THEME.colors.primary}>{BOX.diamondFilled} </Text>
        <Text color={DEFAULT_THEME.colors.text} bold>{title}</Text>
        {count !== undefined && (
          <Text color={DEFAULT_THEME.colors.textMuted}> ({count})</Text>
        )}
      </InkBox>
      {action && (
        <Text color={DEFAULT_THEME.colors.accent}>{action}</Text>
      )}
    </InkBox>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// INPUT FIELD - Styled text input display
// ═══════════════════════════════════════════════════════════════════════════

interface InputFieldProps {
  value: string;
  placeholder?: string;
  prefix?: string;
  focused?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  value,
  placeholder = 'Type here...',
  prefix = DEFAULT_THEME.symbols.arrowRight,
  focused = true,
}) => {
  return (
    <InkBox
      borderStyle="round"
      borderColor={focused ? DEFAULT_THEME.colors.primary : DEFAULT_THEME.colors.border}
      paddingX={1}
    >
      <Text color={DEFAULT_THEME.colors.primary}>{prefix} </Text>
      <Text color={value ? DEFAULT_THEME.colors.text : DEFAULT_THEME.colors.textMuted}>
        {value || placeholder}
      </Text>
      {focused && <Text color={DEFAULT_THEME.colors.accent}>|</Text>}
    </InkBox>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// KEY HINT - Keyboard shortcut display
// ═══════════════════════════════════════════════════════════════════════════

interface KeyHintProps {
  keys: string;
  description: string;
}

export const KeyHint: React.FC<KeyHintProps> = ({ keys, description }) => {
  return (
    <InkBox>
      <Text color={DEFAULT_THEME.colors.accent} bold>[{keys}]</Text>
      <Text color={DEFAULT_THEME.colors.textMuted}> {description}</Text>
    </InkBox>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// LOGO DISPLAY - Animated logo component
// ═══════════════════════════════════════════════════════════════════════════

interface LogoProps {
  animated?: boolean;
  size?: 'small' | 'large';
}

export const Logo: React.FC<LogoProps> = ({ animated = false, size = 'small' }) => {
  const [glow, setGlow] = React.useState(0);

  React.useEffect(() => {
    if (!animated) return;
    const timer = setInterval(() => {
      setGlow((g) => (g + 1) % 4);
    }, 300);
    return () => clearInterval(timer);
  }, [animated]);

  const glowColors = [
    DEFAULT_THEME.colors.primary,
    DEFAULT_THEME.colors.secondary,
    DEFAULT_THEME.colors.accent,
    DEFAULT_THEME.colors.secondary,
  ];

  if (size === 'small') {
    return (
      <Text color={animated ? glowColors[glow] : DEFAULT_THEME.colors.primary} bold>
        {LOGO_SMALL}
      </Text>
    );
  }

  return (
    <InkBox flexDirection="column">
      <Text color={animated ? glowColors[glow] : DEFAULT_THEME.colors.primary}>
        {BOX.doubleTopLeft}{BOX.doubleHorizontal.repeat(10)}{BOX.doubleTopRight}
      </Text>
      <Text color={animated ? glowColors[glow] : DEFAULT_THEME.colors.primary}>
        {BOX.doubleVertical}  termaaz  {BOX.doubleVertical}
      </Text>
      <Text color={animated ? glowColors[glow] : DEFAULT_THEME.colors.primary}>
        {BOX.doubleBottomLeft}{BOX.doubleHorizontal.repeat(10)}{BOX.doubleBottomRight}
      </Text>
    </InkBox>
  );
};
