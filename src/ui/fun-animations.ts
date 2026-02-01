// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Fun ASCII Animations (Maskharebazi Mode!)
// Random fun animations that appear in the terminal
// ═══════════════════════════════════════════════════════════════════════════

import { EventEmitter } from 'events';

// ASCII Art Collection
const ASCII_ART = {
  // Yellow Duck walking
  duck: {
    frames: [
      `
  __
>(o )___
  ( ._> /
   \`---'   `,
      `
   __
  (o )>__
  ( ._> /
   \`---'  `,
    ],
    color: '#FFE066',
    name: 'Duck',
    message: '🦆 Quack quack!',
  },

  // Cat
  cat: {
    frames: [
      `
  /\\_/\\
 ( o.o )
  > ^ <  `,
      `
  /\\_/\\
 ( -.- )
  > ^ <  `,
    ],
    color: '#FFB8D9',
    name: 'Cat',
    message: '🐱 Meow~',
  },

  // Growing tree
  tree: {
    frames: [
      `
    |
   /|\\
    |   `,
      `
    *
   /|\\
  / | \\
    |    `,
      `
   \\|/
    *
   /|\\
  / | \\
   /|\\   `,
      `
  \\\\|//
   \\|/
    *
   /|\\
  //|\\\\
   /|\\   `,
    ],
    color: '#7DFFB3',
    name: 'Tree',
    message: '🌳 A tree is growing...',
  },

  // Rocket launch
  rocket: {
    frames: [
      `
    /\\
   |  |
   |  |
  /|  |\\
 / |  | \\
   ^^^^   `,
      `
    /\\
   |  |
   |  |
  /|  |\\
 / |  | \\
   ****
   ****   `,
      `
    /\\
   |  |
  /|  |\\
   ****
   ****
   ****   `,
    ],
    color: '#FF6B9D',
    name: 'Rocket',
    message: '🚀 3... 2... 1... Liftoff!',
  },

  // Fish swimming
  fish: {
    frames: [
      `
><(((('>      `,
      `
  ><(((('>    `,
      `
      ><(((('>`,
    ],
    color: '#7EB8FF',
    name: 'Fish',
    message: '🐟 Blub blub...',
  },

  // UFO
  ufo: {
    frames: [
      `
     ___
 ___|___|___
  o  o  o   `,
      `
      ___
  ___|___|___
   o  o  o   `,
      `
       ___
   ___|___|___
    o  o  o   `,
    ],
    color: '#C79BFF',
    name: 'UFO',
    message: '👽 Beep boop beep!',
  },

  // Butterfly
  butterfly: {
    frames: [
      `
 ╱◠‿◠╲
  ╲  ╱
   )(   `,
      `
 ╲◠‿◠╱
  ╱  ╲
   )(   `,
    ],
    color: '#FFE066',
    name: 'Butterfly',
    message: '🦋 Flutter flutter~',
  },

  // Ghost
  ghost: {
    frames: [
      `
  .-.
 ( o o )
 |  O  |
 | ||| |
  '   '  `,
      `
  .-.
 ( o o )
 |  O  |
 || | ||
  '   '  `,
    ],
    color: '#B8E0FF',
    name: 'Ghost',
    message: '👻 Boooo!',
  },

  // Heart beat
  heart: {
    frames: [
      `
  ♥ ♥
 ♥   ♥
  ♥ ♥
   ♥   `,
      `
 ♥♥ ♥♥
♥     ♥
 ♥   ♥
  ♥ ♥
   ♥    `,
    ],
    color: '#FF6B9D',
    name: 'Heart',
    message: '💕 Sending love!',
  },

  // Running person
  runner: {
    frames: [
      `
  O
 /|\\
 / \\  `,
      `
  O
 \\|/
 | |  `,
      `
  O
 /|\\
 / \\  `,
    ],
    color: '#FFE066',
    name: 'Runner',
    message: '🏃 Gotta go fast!',
  },

  // Snail
  snail: {
    frames: [
      `
    @/
  _/     `,
      `
     @/
   _/    `,
      `
      @/
    _/   `,
    ],
    color: '#A8FFE0',
    name: 'Snail',
    message: '🐌 Slowly but surely...',
  },

  // Stars twinkling
  stars: {
    frames: [
      `
 *  .  *
   * .
 .  *  . `,
      `
 .  *  .
   . *
 *  .  * `,
    ],
    color: '#FFE066',
    name: 'Stars',
    message: '✨ Twinkle twinkle~',
  },

  // Rainbow
  rainbow: {
    frames: [
      `
    .---.
  .'     '.
 /  R O Y  \\
|  G B I V  |`,
    ],
    color: '#FF6B9D',
    name: 'Rainbow',
    message: '🌈 Somewhere over the rainbow!',
  },

  // Dancing person
  dancer: {
    frames: [
      `
  \\o/
   |
  / \\  `,
      `
  \\o
   |\\
  / \\  `,
      `
   o/
  /|
  / \\  `,
      `
  \\o/
   |
  / \\  `,
    ],
    color: '#C79BFF',
    name: 'Dancer',
    message: '💃 Dance dance dance!',
  },

  // Pac-Man
  pacman: {
    frames: [
      `
ᗧ···●    `,
      `
 ᗧ··●    `,
      `
  ᗧ·●    `,
      `
   ᗧ●    `,
    ],
    color: '#FFE066',
    name: 'Pac-Man',
    message: '🎮 Wakka wakka!',
  },

  // Coffee
  coffee: {
    frames: [
      `
   (  )
  (    )
 ~~~~~~~~
 |      |]
 \\      /
  \`----'  `,
      `
    (  )
   (   )
 ~~~~~~~~
 |      |]
 \\      /
  \`----'  `,
    ],
    color: '#FFD9A8',
    name: 'Coffee',
    message: '☕ Coffee break!',
  },
};

type ArtKey = keyof typeof ASCII_ART;

export class FunAnimations extends EventEmitter {
  private isEnabled: boolean = true;
  private intervalId: NodeJS.Timeout | null = null;
  private currentAnimation: NodeJS.Timeout | null = null;
  private minInterval: number = 60000;  // 1 minute
  private maxInterval: number = 300000; // 5 minutes

  constructor() {
    super();
  }

  // Start random animations
  start(): void {
    if (this.intervalId) return;
    this.scheduleNext();
  }

  // Schedule next animation
  private scheduleNext(): void {
    if (!this.isEnabled) return;

    const delay = this.minInterval + Math.random() * (this.maxInterval - this.minInterval);

    this.intervalId = setTimeout(() => {
      if (this.isEnabled) {
        this.playRandomAnimation();
        this.scheduleNext();
      }
    }, delay);
  }

  // Play a random animation
  playRandomAnimation(): void {
    if (!this.isEnabled) return;

    const keys = Object.keys(ASCII_ART) as ArtKey[];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    this.playAnimation(randomKey);
  }

  // Play specific animation
  playAnimation(name: ArtKey): void {
    const art = ASCII_ART[name];
    if (!art) return;

    let frameIndex = 0;
    const frameCount = art.frames.length;

    // Emit start message
    this.emit('animation-start', {
      name: art.name,
      message: art.message,
      color: art.color,
    });

    // Animate frames
    this.currentAnimation = setInterval(() => {
      const frame = art.frames[frameIndex];
      this.emit('frame', {
        frame,
        color: art.color,
        name: art.name,
      });

      frameIndex++;
      if (frameIndex >= frameCount * 2) { // Play twice
        if (this.currentAnimation) {
          clearInterval(this.currentAnimation);
          this.currentAnimation = null;
        }
        this.emit('animation-end', { name: art.name });
      } else {
        frameIndex = frameIndex % frameCount;
      }
    }, 300);
  }

  // Toggle animations on/off
  toggle(): boolean {
    this.isEnabled = !this.isEnabled;

    if (!this.isEnabled) {
      this.stop();
    } else {
      this.start();
    }

    return this.isEnabled;
  }

  // Enable animations
  enable(): void {
    this.isEnabled = true;
    this.start();
  }

  // Disable animations
  disable(): void {
    this.isEnabled = false;
    this.stop();
  }

  // Check if enabled
  getIsEnabled(): boolean {
    return this.isEnabled;
  }

  // Stop all animations
  stop(): void {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    if (this.currentAnimation) {
      clearInterval(this.currentAnimation);
      this.currentAnimation = null;
    }
  }

  // Set interval range (in seconds)
  setInterval(minSeconds: number, maxSeconds: number): void {
    this.minInterval = minSeconds * 1000;
    this.maxInterval = maxSeconds * 1000;
  }

  // Get list of available animations
  getAvailableAnimations(): string[] {
    return Object.keys(ASCII_ART);
  }

  // Trigger animation now (for testing or manual trigger)
  triggerNow(name?: string): void {
    if (name && name in ASCII_ART) {
      this.playAnimation(name as ArtKey);
    } else {
      this.playRandomAnimation();
    }
  }

  // Cleanup
  destroy(): void {
    this.stop();
    this.removeAllListeners();
  }
}

// Fun messages that appear randomly
export const FUN_MESSAGES = [
  '🎉 Yay! Coding is fun!',
  '🌟 You\'re doing great!',
  '🎮 Take a break, play a game!',
  '🍕 Pizza time?',
  '🎵 La la la~',
  '🌈 Good vibes only!',
  '🚀 To infinity and beyond!',
  '🎪 Welcome to the circus!',
  '🌸 Cherry blossom season~',
  '🎃 Boo!',
  '🦄 Unicorns are real!',
  '🌙 Sweet dreams!',
  '☀️ Good morning sunshine!',
  '🍦 Ice cream break!',
  '🎸 Rock on!',
];

export function getRandomFunMessage(): string {
  return FUN_MESSAGES[Math.floor(Math.random() * FUN_MESSAGES.length)];
}
