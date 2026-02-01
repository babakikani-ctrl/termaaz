// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Video Call View Component (ASCII)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import type { User } from '../../core/types.js';
import { DEFAULT_THEME, VIDEO_WIDTH, VIDEO_HEIGHT } from '../../core/constants.js';

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
      {/* Header */}
      <Box marginBottom={1} justifyContent="space-between">
        <Box>
          <Text color={DEFAULT_THEME.colors.error} bold>
            ● LIVE
          </Text>
          <Text color={DEFAULT_THEME.colors.primary} bold>
            {' '}Video Call
          </Text>
          <Text color={DEFAULT_THEME.colors.textMuted}>
            {' '}({participants.length} participants)
          </Text>
        </Box>
        <Box gap={2}>
          <Text color={isMuted ? DEFAULT_THEME.colors.error : DEFAULT_THEME.colors.success}>
            {isMuted ? '🔇 Muted' : '🔊 Unmuted'}
          </Text>
        </Box>
      </Box>

      {/* Video frames */}
      <Box flexDirection="row" flexGrow={1} gap={1}>
        {/* Local video (small) */}
        <Box flexDirection="column" width="30%">
          <Box marginBottom={0}>
            <Text color={DEFAULT_THEME.colors.primary} bold>You</Text>
          </Box>
          <VideoFrame
            frame={localFrame}
            width={Math.floor(VIDEO_WIDTH * 0.4)}
            height={Math.floor(VIDEO_HEIGHT * 0.6)}
            borderColor={DEFAULT_THEME.colors.primary}
          />
        </Box>

        {/* Remote video (large) */}
        <Box flexDirection="column" flexGrow={1}>
          {hasRemote ? (
            Array.from(remoteFrames.entries()).map(([peerId, frame], index) => {
              const participant = participants.find(p => p.id === peerId);
              return (
                <Box key={peerId} flexDirection="column">
                  <Box marginBottom={0}>
                    <Text color={participant?.color || DEFAULT_THEME.colors.text} bold>
                      {participant?.name || `Peer ${index + 1}`}
                    </Text>
                  </Box>
                  <VideoFrame
                    frame={frame}
                    width={VIDEO_WIDTH}
                    height={VIDEO_HEIGHT}
                    borderColor={participant?.color || DEFAULT_THEME.colors.border}
                  />
                </Box>
              );
            })
          ) : (
            <Box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
              <WaitingAnimation />
              <Text color={DEFAULT_THEME.colors.textMuted}>
                Waiting for others to join...
              </Text>
            </Box>
          )}
        </Box>
      </Box>

      {/* Participants bar */}
      <Box marginTop={1}>
        <ParticipantsBar participants={participants} />
      </Box>

      {/* Controls */}
      <Box marginTop={1} borderStyle="single" borderColor={DEFAULT_THEME.colors.border} paddingX={1}>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          /call mute • /call end • Tab: Switch view
        </Text>
      </Box>
    </Box>
  );
};

interface VideoFrameProps {
  frame: string[][];
  width: number;
  height: number;
  borderColor: string;
}

const VideoFrame: React.FC<VideoFrameProps> = ({ frame, width, height, borderColor }) => {
  // Scale frame to target dimensions
  const scaledFrame = scaleFrame(frame, width, height);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={borderColor}
    >
      {scaledFrame.map((row, y) => (
        <Text key={y} color={DEFAULT_THEME.colors.text}>
          {row.join('')}
        </Text>
      ))}
    </Box>
  );
};

function scaleFrame(frame: string[][], targetWidth: number, targetHeight: number): string[][] {
  if (!frame || frame.length === 0) {
    return Array(targetHeight).fill(null).map(() => Array(targetWidth).fill(' '));
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

const VideoInactive: React.FC = () => {
  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} padding={2}>
      <Box marginBottom={2}>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          ╭───────────────────────────────────────╮
        </Text>
      </Box>
      <Box marginBottom={1}>
        <Text color={DEFAULT_THEME.colors.primary} bold>
          📹 Video Call
        </Text>
      </Box>
      <Box marginBottom={2}>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          Start a video call with /call start
        </Text>
      </Box>
      <AsciiCamera />
      <Box marginTop={2}>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          ╰───────────────────────────────────────╯
        </Text>
      </Box>
    </Box>
  );
};

const AsciiCamera: React.FC = () => {
  const camera = [
    '    ╭─────────────────╮    ',
    '   ╭┤   ╭───────╮     ├╮   ',
    '   │├───┤ ○   ○ ├─────┤│   ',
    '   │├───┤   ◡   ├─────┤│   ',
    '   ╰┤   ╰───────╯     ├╯   ',
    '    ╰─────────────────╯    ',
  ];

  return (
    <Box flexDirection="column">
      {camera.map((line, i) => (
        <Text key={i} color={DEFAULT_THEME.colors.border}>
          {line}
        </Text>
      ))}
    </Box>
  );
};

const WaitingAnimation: React.FC = () => {
  const [frame, setFrame] = useState(0);

  const frames = [
    '( •_•)',
    '( •_•)>⌐■-■',
    '(⌐■_■)',
    '(⌐■_■)',
    '( •_•)>⌐■-■',
    '( •_•)',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box marginBottom={2}>
      <Text color={DEFAULT_THEME.colors.primary} bold>
        {frames[frame]}
      </Text>
    </Box>
  );
};

interface ParticipantsBarProps {
  participants: User[];
}

const ParticipantsBar: React.FC<ParticipantsBarProps> = ({ participants }) => {
  return (
    <Box gap={2} borderStyle="single" borderColor={DEFAULT_THEME.colors.border} paddingX={1}>
      <Text color={DEFAULT_THEME.colors.textMuted}>Participants:</Text>
      {participants.map((p) => (
        <Box key={p.id}>
          <Text color={DEFAULT_THEME.colors.success}>●</Text>
          <Text color={p.color}> {p.name}</Text>
        </Box>
      ))}
    </Box>
  );
};

// Animated ASCII art for "connecting" state
export const ConnectingAnimation: React.FC = () => {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDots((d) => (d + 1) % 4);
    }, 300);
    return () => clearInterval(timer);
  }, []);

  const frames = [
    '   ╭──╮   ',
    '  ╭┤  ├╮  ',
    '  │○  ○│  ',
    '  │ ◡◡ │  ',
    '  ╰────╯  ',
  ];

  return (
    <Box flexDirection="column" alignItems="center">
      {frames.map((line, i) => (
        <Text key={i} color={DEFAULT_THEME.colors.primary}>
          {line}
        </Text>
      ))}
      <Box marginTop={1}>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          Connecting{'.'.repeat(dots)}
        </Text>
      </Box>
    </Box>
  );
};
