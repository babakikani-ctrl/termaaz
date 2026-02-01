// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Video Call View Component (Ember Theme - Artistic ASCII)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import type { User } from '../../core/types.js';
import { DEFAULT_THEME, BOX, STATUS, LOADER_EMBER, ART } from '../../core/constants.js';

interface VideoViewProps {
  isActive: boolean;
  localFrame: string[][];
  remoteFrames: Map<string, string[][]>;
  participants: User[];
  isMuted: boolean;
}

export const VideoView: React.FC<VideoViewProps> = ({
  isActive,
  localFrame,
  remoteFrames,
  participants,
  isMuted,
}) => {
  if (!isActive) {
    return <VideoInactive />;
  }

  const hasRemote = remoteFrames.size > 0;

  return (
    <Box flexDirection="column" flexGrow={1} padding={1}>
      {/* Header with artistic styling */}
      <Box marginBottom={1} justifyContent="space-between">
        <Box gap={2}>
          <LiveIndicator />
          <Text color={DEFAULT_THEME.colors.primary} bold>Video Call</Text>
          <Text color={DEFAULT_THEME.colors.border}>{BOX.dot}</Text>
          <Text color={DEFAULT_THEME.colors.textMuted}>
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </Text>
        </Box>
        <Box gap={2}>
          <MuteIndicator isMuted={isMuted} />
          <ConnectionQuality />
        </Box>
      </Box>

      {/* Decorative divider */}
      <Box marginBottom={1}>
        <Text color={DEFAULT_THEME.colors.border}>
          {BOX.horizontal} {BOX.diamondFilled} {BOX.horizontal.repeat(50)} {BOX.diamondFilled} {BOX.horizontal}
        </Text>
      </Box>

      {/* Video grid */}
      <Box flexDirection="row" flexGrow={1} gap={1}>
        {/* Local video (picture-in-picture style) */}
        <Box flexDirection="column" width="25%">
          <VideoPanel
            title="You"
            frame={localFrame}
            color={DEFAULT_THEME.colors.primary}
            isLocal
          />
        </Box>

        {/* Remote video(s) */}
        <Box flexDirection="column" flexGrow={1}>
          {hasRemote ? (
            Array.from(remoteFrames.entries()).map(([peerId, frame]) => {
              const participant = participants.find(p => p.id === peerId);
              return (
                <VideoPanel
                  key={peerId}
                  title={participant?.name || 'Peer'}
                  frame={frame}
                  color={participant?.color || DEFAULT_THEME.colors.secondary}
                />
              );
            })
          ) : (
            <WaitingPanel />
          )}
        </Box>
      </Box>

      {/* Participants strip */}
      <Box marginTop={1}>
        <ParticipantStrip participants={participants} />
      </Box>

      {/* Controls footer */}
      <Box marginTop={1} paddingX={1}>
        <Box gap={3}>
          <ControlHint cmd="/call mute" desc="toggle audio" icon={BOX.diamond} />
          <ControlHint cmd="/call end" desc="leave call" icon={BOX.diamond} />
          <ControlHint cmd="Tab" desc="switch view" icon={BOX.dot} />
        </Box>
      </Box>
    </Box>
  );
};

// Live indicator with pulsing animation
const LiveIndicator: React.FC = () => {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse(p => (p + 1) % 2);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box>
      <Text color={DEFAULT_THEME.colors.error} bold>
        {pulse ? STATUS.online : STATUS.offline}
      </Text>
      <Text color={DEFAULT_THEME.colors.error} bold> LIVE</Text>
    </Box>
  );
};

// Mute indicator
const MuteIndicator: React.FC<{ isMuted: boolean }> = ({ isMuted }) => {
  return (
    <Box>
      <Text color={isMuted ? DEFAULT_THEME.colors.error : DEFAULT_THEME.colors.success}>
        {isMuted ? '[MUTED]' : '[AUDIO]'}
      </Text>
    </Box>
  );
};

// Connection quality indicator
const ConnectionQuality: React.FC = () => {
  const [quality, setQuality] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuality(Math.floor(Math.random() * 2) + 2); // Random 2-3 bars
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const bars = BOX.diamondFilled.repeat(quality) + BOX.diamond.repeat(4 - quality);
  const color = quality >= 3 ? DEFAULT_THEME.colors.success : DEFAULT_THEME.colors.warning;

  return (
    <Box>
      <Text color={DEFAULT_THEME.colors.textMuted}>Signal </Text>
      <Text color={color}>{bars}</Text>
    </Box>
  );
};

// Video panel with artistic frame
interface VideoPanelProps {
  title: string;
  frame: string[][];
  color: string;
  isLocal?: boolean;
}

const VideoPanel: React.FC<VideoPanelProps> = ({ title, frame, color, isLocal }) => {
  const targetWidth = isLocal ? 40 : 80;
  const targetHeight = isLocal ? 15 : 24;
  const scaledFrame = scaleFrame(frame, targetWidth, targetHeight);

  return (
    <Box flexDirection="column">
      {/* Title bar */}
      <Box>
        <Text color={color}>{BOX.topLeft}{BOX.horizontal}</Text>
        <Text color={color}> {BOX.diamondFilled} </Text>
        <Text color={DEFAULT_THEME.colors.text} bold>{title}</Text>
        {isLocal && <Text color={DEFAULT_THEME.colors.textMuted}> (you)</Text>}
        <Text color={color}> {BOX.horizontal.repeat(Math.max(0, targetWidth - title.length - 10))}{BOX.topRight}</Text>
      </Box>

      {/* Video content */}
      <Box flexDirection="column" borderStyle="single" borderColor={color}>
        {scaledFrame.map((row, y) => (
          <Text key={y} color={DEFAULT_THEME.colors.text}>
            {row.join('')}
          </Text>
        ))}
      </Box>

      {/* Bottom bar */}
      <Box>
        <Text color={color}>{BOX.bottomLeft}{BOX.horizontal.repeat(targetWidth)}{BOX.bottomRight}</Text>
      </Box>
    </Box>
  );
};

// Frame scaling utility
function scaleFrame(frame: string[][], targetWidth: number, targetHeight: number): string[][] {
  if (!frame || frame.length === 0) {
    // Return artistic placeholder pattern
    return generatePlaceholderPattern(targetWidth, targetHeight);
  }

  const sourceHeight = frame.length;
  const sourceWidth = frame[0]?.length || 0;
  const result: string[][] = [];

  for (let y = 0; y < targetHeight; y++) {
    const row: string[] = [];
    const srcY = Math.floor((y / targetHeight) * sourceHeight);

    for (let x = 0; x < targetWidth; x++) {
      const srcX = Math.floor((x / targetWidth) * sourceWidth);
      row.push(frame[srcY]?.[srcX] || ' ');
    }
    result.push(row);
  }

  return result;
}

// Generate artistic placeholder pattern
function generatePlaceholderPattern(width: number, height: number): string[][] {
  const pattern: string[][] = [];
  const chars = [' ', BOX.dot, ' ', BOX.dot];

  for (let y = 0; y < height; y++) {
    const row: string[] = [];
    for (let x = 0; x < width; x++) {
      // Create subtle diagonal pattern
      const idx = ((x + y) % 8 === 0) ? 1 : 0;
      row.push(chars[idx]);
    }
    pattern.push(row);
  }

  // Add centered camera icon
  const centerY = Math.floor(height / 2);
  const centerX = Math.floor(width / 2);
  const icon = ['[o]'];

  icon.forEach((line, i) => {
    const y = centerY - 1 + i;
    if (y >= 0 && y < height) {
      const startX = centerX - Math.floor(line.length / 2);
      for (let j = 0; j < line.length && startX + j < width; j++) {
        if (startX + j >= 0) {
          pattern[y][startX + j] = line[j];
        }
      }
    }
  });

  return pattern;
}

// Waiting panel with animation
const WaitingPanel: React.FC = () => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % LOADER_EMBER.length);
    }, 300);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
      {/* Animated waiting icon */}
      <Box flexDirection="column" alignItems="center" marginBottom={2}>
        <Text color={DEFAULT_THEME.colors.primary}>
          {BOX.diamond}   {BOX.diamond}
        </Text>
        <Text color={DEFAULT_THEME.colors.primary}>
            {LOADER_EMBER[frame]}
        </Text>
        <Text color={DEFAULT_THEME.colors.primary}>
          {BOX.diamond}   {BOX.diamond}
        </Text>
      </Box>

      <Text color={DEFAULT_THEME.colors.textMuted}>
        Waiting for others to join...
      </Text>

      <Box marginTop={1}>
        <Text color={DEFAULT_THEME.colors.accent}>
          Share the room code to invite
        </Text>
      </Box>
    </Box>
  );
};

// Participant strip at bottom
interface ParticipantStripProps {
  participants: User[];
}

const ParticipantStrip: React.FC<ParticipantStripProps> = ({ participants }) => {
  return (
    <Box paddingX={1} gap={2}>
      <Text color={DEFAULT_THEME.colors.border}>{BOX.vertical}</Text>
      <Text color={DEFAULT_THEME.colors.textMuted}>Participants:</Text>
      {participants.map((p) => (
        <Box key={p.id} gap={1}>
          <Text color={DEFAULT_THEME.colors.success}>{STATUS.online}</Text>
          <Text color={p.color}>{p.name}</Text>
        </Box>
      ))}
      <Text color={DEFAULT_THEME.colors.border}>{BOX.vertical}</Text>
    </Box>
  );
};

// Control hint display
interface ControlHintProps {
  cmd: string;
  desc: string;
  icon: string;
}

const ControlHint: React.FC<ControlHintProps> = ({ cmd, desc, icon }) => {
  return (
    <Box>
      <Text color={DEFAULT_THEME.colors.border}>{icon} </Text>
      <Text color={DEFAULT_THEME.colors.accent}>{cmd}</Text>
      <Text color={DEFAULT_THEME.colors.textMuted}> {desc}</Text>
    </Box>
  );
};

// Inactive video state
const VideoInactive: React.FC = () => {
  const [glow, setGlow] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setGlow(g => (g + 1) % 4);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const glowColors = [
    DEFAULT_THEME.colors.border,
    DEFAULT_THEME.colors.primary,
    DEFAULT_THEME.colors.accent,
    DEFAULT_THEME.colors.primary,
  ];

  const camera = [
    '    ╭─────────────╮    ',
    '    │             │    ',
    '    │   [o] [o]   │    ',
    '    │      ▽      │    ',
    '    │             │    ',
    '    ╰─────────────╯    ',
  ];

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} padding={2}>
      {/* Decorative header */}
      <Box marginBottom={2}>
        <Text color={DEFAULT_THEME.colors.border}>
          {BOX.star} {BOX.dot} {BOX.star} {BOX.dot} {BOX.star}
        </Text>
      </Box>

      {/* Title */}
      <Box marginBottom={2}>
        <Text color={DEFAULT_THEME.colors.primary} bold>Video Call</Text>
      </Box>

      {/* Animated camera icon */}
      <Box flexDirection="column" marginBottom={2}>
        {camera.map((line, i) => (
          <Text key={i} color={glowColors[glow]}>
            {line}
          </Text>
        ))}
      </Box>

      {/* Instructions */}
      <Box flexDirection="column" alignItems="center">
        <Text color={DEFAULT_THEME.colors.textMuted}>
          Start a video call to begin
        </Text>
        <Box marginTop={1}>
          <Text color={DEFAULT_THEME.colors.accent}>/call start</Text>
        </Box>
      </Box>

      {/* Decorative footer */}
      <Box marginTop={2}>
        <Text color={DEFAULT_THEME.colors.border}>
          {BOX.horizontal} {BOX.diamondFilled} {BOX.horizontal.repeat(20)} {BOX.diamondFilled} {BOX.horizontal}
        </Text>
      </Box>
    </Box>
  );
};

// Connecting animation
export const ConnectingAnimation: React.FC = () => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % LOADER_EMBER.length);
    }, 250);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box flexDirection="column" alignItems="center">
      <Box marginBottom={1}>
        <Text color={DEFAULT_THEME.colors.primary}>
          {BOX.diamond} {LOADER_EMBER[frame]} {BOX.diamond}
        </Text>
      </Box>
      <Text color={DEFAULT_THEME.colors.textMuted}>
        Connecting...
      </Text>
    </Box>
  );
};
