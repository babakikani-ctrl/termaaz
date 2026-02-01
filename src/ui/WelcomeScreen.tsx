// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Interactive Welcome Screen
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput, useApp, useStdout } from 'ink';
import TextInput from 'ink-text-input';
import { DEFAULT_THEME } from '../core/constants.js';

// Interactive ASCII Art Characters - Multiple sizes!
const CHARACTERS = {
  termaaz: `
 ████████╗███████╗██████╗ ███╗   ███╗ █████╗  █████╗ ███████╗
 ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██╔══██╗██╔══██╗╚══███╔╝
    ██║   █████╗  ██████╔╝██╔████╔██║███████║███████║  ███╔╝
    ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══██║██╔══██║ ███╔╝
    ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║  ██║██║  ██║███████╗
    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝`,

  // Cats - different sizes
  catSmall: ['=^.^=', '=^-^='],
  catMedium: [
    ` /\\_/\\
( o.o )
 > ^ <`,
    ` /\\_/\\
( -.- )
 > ^ <`,
  ],
  catLarge: [
    `  /\\_____/\\
 /  o   o  \\
(    >Y<    )
 \\  \\_|_/  /
  \\_______/`,
    `  /\\_____/\\
 /  -   -  \\
(    >Y<    )
 \\  \\_|_/  /
  \\_______/`,
  ],

  // Ducks - different sizes
  duckSmall: ['>o>', ' >o>'],
  duckMedium: [
    `  __
>(o )__
 ( ._>/
  \`--'`,
    `   __
 (o )>_
 ( ._>/
  \`--'`,
  ],
  duckLarge: [
    `    ___
  >(o   )____
   (  ._>   /
    \`------'`,
    `     ___
   (o   )>___
   (  ._>   /
    \`------'`,
  ],

  // Fish - different sizes
  fishSmall: ['><>', ' ><>', '  ><>'],
  fishMedium: [`><((('>`, ` ><((('>`, `  ><((('>`],
  fishLarge: [
    `      /\\
><(((o  >`,
    `       /\\
 ><(((o  >`,
    `        /\\
  ><(((o  >`,
  ],

  // Birds
  birdSmall: ['~v~', ' ~v~', '  ~v~'],
  birdMedium: ['\\o/', ' \\o/', '  \\o/'],
  birdLarge: [
    ` ___
(o>o)
 \\V/`,
    `  ___
 (o>o)
  \\V/`,
  ],

  // Butterflies
  butterflySmall: ['}{', ' }{', '  }{'],
  butterflyMedium: ['╱◠‿◠╲', ' ╱◠‿◠╲'],
  butterflyLarge: [
    ` \\ _ /
 (o _ o)
  / | \\`,
    `  \\ _ /
  (o _ o)
   / | \\`,
  ],

  // Rockets
  rocketSmall: ['^', ' ^', '  ^', '   ^'],
  rocketMedium: [
    ` /\\
|##|
 \\/`,
    `  /\\
 |##|
  \\/`,
  ],
  rocketLarge: [
    `   /\\
  /  \\
 | ## |
 | ## |
/| ## |\\
 \\____/
  ****`,
    `    /\\
   /  \\
  | ## |
  | ## |
 /| ## |\\
  \\____/
   ****`,
  ],

  // UFOs
  ufoSmall: ['(-)', '(-)', ' (-)'],
  ufoMedium: [
    ' _O_\n(___)',
    '  _O_\n (___)'],
  ufoLarge: [
    '   ___\n _/   \\_\n(o o o o)\n \\_____/',
    '    ___\n  _/   \\_\n (o o o o)\n  \\_____/'],

  // Hearts
  heartSmall: ['<3', ' <3', '  <3'],
  heartMedium: [
    ' ** **\n*    *\n *  *\n  **',
    '  ** **\n *    *\n  *  *\n   **'],

  // Stars & sparkles
  stars: ['✦', '✧', '★', '☆', '✶', '✷', '✸', '✹', '✺', '⋆', '✫', '✬', '·', '•', '°', '∘'],
  sparkles: ['✨', '💫', '⭐', '🌟', '✴️'],

  // Emojis that float
  floatingEmojis: ['🐱', '🐤', '🐟', '🦋', '🚀', '👽', '💕', '🌸', '🍕', '☕', '🎮', '🎵', '🌙', '⚡', '🔥', '🌈'],
};

// All character types for random selection
const CHARACTER_TYPES = [
  { key: 'catSmall', color: '#FFB8D9' },
  { key: 'catMedium', color: '#FFB8D9' },
  { key: 'catLarge', color: '#FFB8D9' },
  { key: 'duckSmall', color: '#FFE066' },
  { key: 'duckMedium', color: '#FFE066' },
  { key: 'duckLarge', color: '#FFE066' },
  { key: 'fishSmall', color: '#7EB8FF' },
  { key: 'fishMedium', color: '#7EB8FF' },
  { key: 'fishLarge', color: '#7EB8FF' },
  { key: 'birdSmall', color: '#A8FFE0' },
  { key: 'birdMedium', color: '#A8FFE0' },
  { key: 'birdLarge', color: '#A8FFE0' },
  { key: 'butterflySmall', color: '#C79BFF' },
  { key: 'butterflyMedium', color: '#C79BFF' },
  { key: 'butterflyLarge', color: '#C79BFF' },
  { key: 'rocketSmall', color: '#FF6B9D' },
  { key: 'rocketMedium', color: '#FF6B9D' },
  { key: 'rocketLarge', color: '#FF6B9D' },
  { key: 'ufoSmall', color: '#C79BFF' },
  { key: 'ufoMedium', color: '#C79BFF' },
  { key: 'ufoLarge', color: '#C79BFF' },
  { key: 'heartSmall', color: '#FF6B9D' },
  { key: 'heartMedium', color: '#FF6B9D' },
];

// Particle type for floating elements
interface Particle {
  id: number;
  x: number;
  y: number;
  char: string;
  frames: string[];
  frameIndex: number;
  color: string;
  vx: number;
  vy: number;
  size: 'small' | 'medium' | 'large';
  type: string;
  lifetime: number;
  maxLifetime: number;
}

interface WelcomeScreenProps {
  onComplete: (userName: string, password: string) => void;
  roomPassword?: string;
  initialName?: string;
}

// The secret password for all rooms!
const SECRET_PASSWORD = 'termaazation';

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete, roomPassword, initialName }) => {
  const { stdout } = useStdout();
  const termWidth = stdout?.columns || 80;
  const termHeight = stdout?.rows || 24;

  const [stage, setStage] = useState<'intro' | 'name' | 'password' | 'connecting'>('intro');
  const [frame, setFrame] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [starParticles, setStarParticles] = useState<Particle[]>([]);
  const [cursorX, setCursorX] = useState(Math.floor(termWidth / 2));
  const [cursorY, setCursorY] = useState(Math.floor(termHeight / 2));
  const [userName, setUserName] = useState(initialName || '');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [particleIdCounter, setParticleIdCounter] = useState(0);

  // Create a random particle (ASCII art character)
  const createRandomParticle = useCallback((id: number): Particle => {
    const charType = CHARACTER_TYPES[Math.floor(Math.random() * CHARACTER_TYPES.length)];
    const frames = (CHARACTERS as any)[charType.key] as string[];
    const size = charType.key.includes('Small') ? 'small' : charType.key.includes('Large') ? 'large' : 'medium';

    // Random position - spawn from edges
    const edge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    let x = 0, y = 0, vx = 0, vy = 0;

    switch (edge) {
      case 0: // top
        x = Math.random() * termWidth;
        y = 0;
        vx = (Math.random() - 0.5) * 2;
        vy = Math.random() * 0.5 + 0.2;
        break;
      case 1: // right
        x = termWidth - 5;
        y = Math.random() * (termHeight - 15);
        vx = -(Math.random() * 0.5 + 0.2);
        vy = (Math.random() - 0.5) * 0.5;
        break;
      case 2: // bottom
        x = Math.random() * termWidth;
        y = termHeight - 15;
        vx = (Math.random() - 0.5) * 2;
        vy = -(Math.random() * 0.5 + 0.2);
        break;
      case 3: // left
        x = 0;
        y = Math.random() * (termHeight - 15);
        vx = Math.random() * 0.5 + 0.2;
        vy = (Math.random() - 0.5) * 0.5;
        break;
    }

    return {
      id,
      x,
      y,
      char: frames[0],
      frames,
      frameIndex: 0,
      color: charType.color,
      vx,
      vy,
      size,
      type: charType.key,
      lifetime: 0,
      maxLifetime: 50 + Math.random() * 100, // Random lifetime
    };
  }, [termWidth, termHeight]);

  // Create a star particle
  const createStarParticle = useCallback((id: number): Particle => {
    const useEmoji = Math.random() > 0.7;
    const char = useEmoji
      ? CHARACTERS.floatingEmojis[Math.floor(Math.random() * CHARACTERS.floatingEmojis.length)]
      : CHARACTERS.stars[Math.floor(Math.random() * CHARACTERS.stars.length)];

    return {
      id,
      x: Math.random() * termWidth,
      y: Math.random() * (termHeight - 12),
      char,
      frames: [char],
      frameIndex: 0,
      color: ['#FFE066', '#C79BFF', '#7EB8FF', '#FF6B9D', '#7DFFB3', '#A8FFE0'][Math.floor(Math.random() * 6)],
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 0.3,
      size: 'small',
      type: 'star',
      lifetime: 0,
      maxLifetime: 200,
    };
  }, [termWidth, termHeight]);

  // Initialize particles
  useEffect(() => {
    // Stars
    const initialStars: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      initialStars.push(createStarParticle(i));
    }
    setStarParticles(initialStars);

    // Start with a few ASCII art characters
    const initialParticles: Particle[] = [];
    for (let i = 0; i < 3; i++) {
      initialParticles.push(createRandomParticle(20 + i));
    }
    setParticles(initialParticles);
    setParticleIdCounter(23);
  }, [createStarParticle, createRandomParticle]);

  // Separate timer for spawning ASCII art (1-5 minutes random)
  useEffect(() => {
    const scheduleNextSpawn = () => {
      // Random delay between 1 minute (60000ms) and 5 minutes (300000ms)
      const delay = 60000 + Math.random() * 240000; // 1-5 min

      return setTimeout(() => {
        setParticleIdCounter(prev => {
          const newId = prev + 1;
          setParticles(p => [...p.slice(-3), createRandomParticle(newId)]); // Keep max 4 particles
          return newId;
        });
        // Schedule next spawn
        spawnTimer = scheduleNextSpawn();
      }, delay);
    };

    let spawnTimer = scheduleNextSpawn();

    return () => clearTimeout(spawnTimer);
  }, [createRandomParticle]);

  // Animation loop (just for animation frames, not spawning)
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => f + 1);
      setShowCursor(c => !c);

      // Update star particles - they follow cursor slightly
      setStarParticles(prev => prev.map(p => {
        const dx = cursorX - p.x;
        const dy = cursorY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const attraction = dist > 5 ? 0.015 : 0;

        let newX = p.x + p.vx + dx * attraction;
        let newY = p.y + p.vy + dy * attraction;

        // Bounce off edges
        let newVx = p.vx;
        let newVy = p.vy;
        if (newX < 0 || newX > termWidth - 1) {
          newVx *= -1;
          newX = Math.max(0, Math.min(termWidth - 1, newX));
        }
        if (newY < 0 || newY > termHeight - 12) {
          newVy *= -1;
          newY = Math.max(0, Math.min(termHeight - 12, newY));
        }

        return { ...p, x: newX, y: newY, vx: newVx, vy: newVy };
      }));

      // Update ASCII art particles
      setParticles(prev => prev
        .map(p => {
          let newX = p.x + p.vx;
          let newY = p.y + p.vy;
          const newFrameIndex = (p.frameIndex + 1) % p.frames.length;
          const newLifetime = p.lifetime + 1;

          return {
            ...p,
            x: newX,
            y: newY,
            frameIndex: newFrameIndex,
            char: p.frames[newFrameIndex],
            lifetime: newLifetime,
          };
        })
        .filter(p => {
          // Remove if out of bounds or lifetime exceeded
          return p.lifetime < p.maxLifetime &&
                 p.x > -20 && p.x < termWidth + 20 &&
                 p.y > -10 && p.y < termHeight;
        })
      );
    }, 200);

    return () => clearInterval(interval);
  }, [cursorX, cursorY, termWidth, termHeight, createRandomParticle]);

  // Handle keyboard input for cursor movement
  useInput((input, key) => {
    if (stage === 'intro') {
      // Move cursor with arrow keys
      if (key.leftArrow) setCursorX(x => Math.max(0, x - 3));
      if (key.rightArrow) setCursorX(x => Math.min(termWidth - 1, x + 3));
      if (key.upArrow) setCursorY(y => Math.max(0, y - 1));
      if (key.downArrow) setCursorY(y => Math.min(termHeight - 10, y + 1));

      // Enter to continue to name input
      if (key.return) {
        setStage('name');
      }
    }
  });

  // Handle name submit
  const handleNameSubmit = useCallback(() => {
    if (!userName.trim()) {
      return;
    }
    setStage('password');
  }, [userName]);

  // Handle password submit
  const handlePasswordSubmit = useCallback(() => {
    // Check against secret password
    if (password !== SECRET_PASSWORD) {
      setPasswordError('Password ghalate! Dobare try kon.');
      setPassword('');
      return;
    }
    setStage('connecting');
    setTimeout(() => {
      onComplete(userName.trim(), password);
    }, 1500);
  }, [password, userName, onComplete]);

  // Colors
  const colors = {
    primary: '#7C3AED',
    secondary: '#EC4899',
    accent: '#06B6D4',
    text: '#FFFFFF',
    muted: '#6B7280',
  };

  // Render based on stage
  if (stage === 'connecting') {
    return (
      <Box flexDirection="column" alignItems="center" justifyContent="center" height={termHeight}>
        <Box marginBottom={2}>
          <Text color={colors.primary}>
            {CHARACTERS.termaaz}
          </Text>
        </Box>
        <Box>
          <Text color={colors.accent}>
            ⚡ Salam <Text color={colors.secondary} bold>{userName}</Text>! Connecting to P2P network...
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text color={colors.muted}>
            {frame % 4 === 0 ? '◐' : frame % 4 === 1 ? '◓' : frame % 4 === 2 ? '◑' : '◒'} Please wait
          </Text>
        </Box>
      </Box>
    );
  }

  // Name input stage
  if (stage === 'name') {
    return (
      <Box flexDirection="column" alignItems="center" justifyContent="center" height={termHeight}>
        <Box marginBottom={2}>
          <Text color={colors.primary}>
            {CHARACTERS.termaaz}
          </Text>
        </Box>

        <Box
          flexDirection="column"
          alignItems="center"
          borderStyle="round"
          borderColor={colors.accent}
          paddingX={4}
          paddingY={2}
        >
          <Box marginBottom={1}>
            <Text color={colors.text}>👤 Esmet chie?</Text>
          </Box>

          <Box>
            <Text color={colors.accent}>› </Text>
            <TextInput
              value={userName}
              onChange={setUserName}
              onSubmit={handleNameSubmit}
              placeholder="Name"
            />
          </Box>

          <Box marginTop={2}>
            <Text color={colors.muted}>Press Enter to continue</Text>
          </Box>
        </Box>

        {/* Animated characters at bottom */}
        <Box marginTop={2} width={60} justifyContent="space-between">
          <Text color="#FFB8D9">{CHARACTERS.catMedium[frame % CHARACTERS.catMedium.length]}</Text>
          <Text color="#FFE066">{CHARACTERS.duckMedium[frame % CHARACTERS.duckMedium.length]}</Text>
        </Box>
      </Box>
    );
  }

  if (stage === 'password') {
    return (
      <Box flexDirection="column" alignItems="center" justifyContent="center" height={termHeight}>
        <Box marginBottom={2}>
          <Text color={colors.primary}>
            {CHARACTERS.termaaz}
          </Text>
        </Box>

        <Box
          flexDirection="column"
          alignItems="center"
          borderStyle="round"
          borderColor={colors.secondary}
          paddingX={4}
          paddingY={2}
        >
          <Box marginBottom={1}>
            <Text color={colors.text}>
              Salam <Text color={colors.accent} bold>{userName}</Text>! 👋
            </Text>
          </Box>

          <Box marginBottom={1}>
            <Text color={colors.text}>🔐 Password ro vared kon:</Text>
          </Box>

          <Box>
            <Text color={colors.secondary}>› </Text>
            <TextInput
              value={password}
              onChange={setPassword}
              onSubmit={handlePasswordSubmit}
              mask="*"
              placeholder="password"
            />
          </Box>

          {passwordError && (
            <Box marginTop={1}>
              <Text color="#EF4444">⚠ {passwordError}</Text>
            </Box>
          )}

          <Box marginTop={2}>
            <Text color={colors.muted}>Press Enter to join</Text>
          </Box>
        </Box>

        {/* Animated characters at bottom */}
        <Box marginTop={2} width={60} justifyContent="space-between">
          <Text color="#FFB8D9">{CHARACTERS.catMedium[frame % CHARACTERS.catMedium.length]}</Text>
          <Text color="#FFE066">{CHARACTERS.duckMedium[frame % CHARACTERS.duckMedium.length]}</Text>
        </Box>
      </Box>
    );
  }

  // Intro stage - interactive animation
  return (
    <Box flexDirection="column" height={termHeight}>
      {/* Floating star particles */}
      <Box position="absolute" width={termWidth} height={termHeight - 10}>
        {starParticles.map((p) => (
          <Box key={`star-${p.id}`} position="absolute" marginLeft={Math.floor(p.x)} marginTop={Math.floor(p.y)}>
            <Text color={p.color}>{p.char}</Text>
          </Box>
        ))}
      </Box>

      {/* ASCII Art particles - cats, ducks, fish, etc. */}
      <Box position="absolute" width={termWidth} height={termHeight - 10}>
        {particles.map((p) => (
          <Box key={`art-${p.id}`} position="absolute" marginLeft={Math.floor(p.x)} marginTop={Math.floor(p.y)}>
            {p.char.split('\n').map((line, i) => (
              <Text key={i} color={p.color}>{line}</Text>
            ))}
          </Box>
        ))}
      </Box>

      {/* Cursor indicator */}
      <Box position="absolute" marginLeft={cursorX} marginTop={cursorY}>
        <Text color={showCursor ? colors.accent : colors.primary}>
          {showCursor ? '◉' : '○'}
        </Text>
      </Box>

      {/* Main content */}
      <Box flexDirection="column" alignItems="center" marginTop={3}>
        {/* Logo */}
        <Box>
          <Text color={colors.primary}>
            {CHARACTERS.termaaz}
          </Text>
        </Box>

        {/* Tagline */}
        <Box marginTop={1}>
          <Text color={colors.muted}>✦ P2P Terminal Collaboration ✦</Text>
        </Box>

        {/* Instructions */}
        <Box
          marginTop={3}
          borderStyle="round"
          borderColor={colors.secondary}
          paddingX={3}
          paddingY={1}
        >
          <Text color={colors.text}>
            🎮 Use <Text color={colors.accent}>Arrow Keys</Text> to move • Watch the creatures fly by!
          </Text>
        </Box>

        <Box marginTop={2}>
          <Text color={colors.secondary}>
            ▸ Press <Text color={colors.accent} bold>ENTER</Text> to continue ◂
          </Text>
        </Box>

        {/* Footer */}
        <Box marginTop={2}>
          <Text color={colors.muted} dimColor>
            🐱 🐤 🐟 🦋 🚀 👽 - Random sizes & timing!
          </Text>
        </Box>

        <Box marginTop={1}>
          <Text color={colors.muted} dimColor>
            Chat • Todos • Files • Video Calls • All P2P
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default WelcomeScreen;
