# TERMAAZ

```
 ████████╗███████╗██████╗ ███╗   ███╗ █████╗  █████╗ ███████╗
 ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██╔══██╗██╔══██╗╚══███╔╝
    ██║   █████╗  ██████╔╝██╔████╔██║███████║███████║  ███╔╝
    ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══██║██╔══██║ ███╔╝
    ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║  ██║██║  ██║███████╗
    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
```

**P2P Terminal Collaboration Platform**

> 💬 Chat • 📋 Todos • 📁 Files • 📹 Video Calls • 🎉 Fun Animations - All P2P in your terminal!

---

## Features

| Feature | Description |
|---------|-------------|
| 💬 **Real-time Chat** | P2P encrypted messaging with typing indicators |
| 📋 **Shared Todos** | Collaborative task list with priorities |
| 📁 **File Sharing** | Share files instantly, drag & drop support |
| 📹 **ASCII Video Calls** | Video calls rendered as ASCII art! |
| 📱 **Phone as Webcam** | Use iPhone/Android camera over WiFi |
| 🎮 **Interactive Menus** | Arrow key selection for commands |
| 🎉 **Fun Mode** | Random ASCII art creatures flying around! |
| 🔐 **Encrypted** | End-to-end encrypted P2P connection |
| 🌐 **Cross-Platform** | Windows, macOS, Linux |

---

## Quick Start

### Step 1: Install

```bash
# Clone the repository
git clone https://github.com/babakikani-ctrl/termaaz.git
cd termaaz

# Install dependencies
npm install

# Build
npm run build
```

### Step 2: Run

```bash
npm start
```

### Step 3: Welcome Screen

1. Watch the cute ASCII creatures fly by! 🐱 🐤 🐟
2. Move cursor with **Arrow Keys**
3. Press **Enter** to continue

### Step 4: Enter Your Name

Type your name and press **Enter**.

### Step 5: Enter Password

```
Password: termaazation
```

### Step 6: You're Connected!

Share the **Room ID** with friends so they can join!

---

## Connecting with Friends

**Person 1 (Create Room):**
```bash
npm start
# Enter name, password
# Get Room ID: a1b2c3d4e5f6...
```

**Person 2 (Join Room):**
```bash
npm start -- --join a1b2c3d4e5f6
# Or just run and paste the Room ID
```

---

## Interactive Command Menus

Type these commands **without arguments** to get interactive menus!

| Command | Menu Options |
|---------|-------------|
| `/videocall` | Start Call, QR Code, Connect Camera |
| `/camera` | Show QR, Enter IP, Disconnect |
| `/todo` | View Todos, Add New |
| `/file` | View Files, Share, Browse |
| `/maskharebazi` | Toggle, Play Now, List |

**Use ↑↓ to navigate, Enter to select, Esc to cancel!**

```
╭────────────────────────────────╮
│ 📹 Video Call                  │
├────────────────────────────────┤
│ ▸ ▶️ Start Call                │ ← Selected
│   📱 Phone Camera (QR)         │
│   🔗 Connect Camera            │
│   ❌ Cancel                     │
├────────────────────────────────┤
│ ↑↓ Navigate • Enter Select     │
╰────────────────────────────────╯
```

---

## All Commands

### 💬 Chat

| Command | Aliases | Description |
|---------|---------|-------------|
| `/chat <message>` | `/c`, `/say` | Send a message |
| `/reply <id> <msg>` | `/r` | Reply to a message |
| `/clear` | `/cls` | Clear chat history |

**Just type a message and press Enter!**

---

### 📋 Todo List

| Command | Aliases | Description |
|---------|---------|-------------|
| `/todo` | `/t` | Open todo menu/view |
| `/todo add <task>` | `/t a` | Add a new task |
| `/todo done <id>` | `/t d` | Mark task complete |
| `/todo delete <id>` | `/t del` | Delete a task |
| `/todo priority <id> <low\|medium\|high>` | | Set priority |

**Example:**
```
/todo add Fix the login bug
/todo done 1
/todo priority 2 high
```

---

### 📁 Files

| Command | Aliases | Description |
|---------|---------|-------------|
| `/file` | `/f` | Open file menu |
| `/file share <path>` | `/f s` | Share a file |
| `/file list` | `/f l` | List shared files |
| `/file get <id>` | | Download a file |
| `/file browse` | `/f b` | Browse local files |

**Example:**
```
/file share ~/Documents/project.zip
/file get abc123
```

---

### 📹 Video Call (ASCII Art!)

| Command | Aliases | Description |
|---------|---------|-------------|
| `/videocall` | `/vc`, `/call` | Open video menu |
| `/call start` | | Start video call |
| `/call end` | | End video call |
| `/call mute` | | Toggle mute |

Video is rendered as beautiful ASCII art in the terminal!

---

### 📱 Phone Camera

Use your iPhone or Android as a webcam over WiFi!

| Command | Aliases | Description |
|---------|---------|-------------|
| `/qr` | `/qrcode` | Show QR code for setup |
| `/camera <ip:port>` | `/cam` | Connect to phone camera |
| `/camera off` | | Disconnect camera |
| `/camera help` | | Show setup guide |

#### How to Set Up Phone Camera:

1. **Install a camera app on your phone:**
   - **iPhone:** Camo, EpocCam, iVCam (free)
   - **Android:** DroidCam, IP Webcam (free)

2. **Connect phone & computer to the same WiFi**

3. **Open the camera app on your phone, start the server**

4. **Find the IP address** (shown in the app, like `192.168.1.50:8080`)

5. **Connect in Termaaz:**
   ```
   /camera 192.168.1.50:8080
   ```

**Common Ports:**
| App | Port |
|-----|------|
| IP Webcam (Android) | 8080 |
| DroidCam | 4747 |
| Camo/EpocCam | 5000 |

---

### 🎉 Fun Mode (Maskharebazi!)

Random ASCII art creatures fly across your screen!

| Command | Aliases | Description |
|---------|---------|-------------|
| `/maskharebazi` | `/fun`, `/msk` | Toggle fun mode / Open menu |
| `/maskharebazi on` | | Enable animations |
| `/maskharebazi off` | | Disable animations |
| `/maskharebazi now` | | Play animation now! |
| `/maskharebazi now <name>` | | Play specific animation |
| `/maskharebazi list` | | Show all animations |

**Available Animations:**
```
🐱 cat       🐤 duck      🐟 fish      🦋 butterfly
🚀 rocket    👽 ufo       💕 heart     👻 ghost
🌳 tree      🏃 runner    🐌 snail     ⭐ stars
🌈 rainbow   💃 dancer    👾 pacman    ☕ coffee
```

**Example:**
```
/maskharebazi now cat
/maskharebazi now rocket
```

---

### 👥 Users

| Command | Aliases | Description |
|---------|---------|-------------|
| `/users` | `/u`, `/who` | List online users |
| `/name <name>` | `/nick` | Change your name |

---

### 🔧 Other

| Command | Aliases | Description |
|---------|---------|-------------|
| `/view <view>` | | Switch view |
| `/help` | `/h`, `/?` | Show help |
| `/quit` | `/q`, `/exit` | Exit Termaaz |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Switch between views |
| `Esc` | Cancel / Go back / Close menu |
| `↑` `↓` | Navigate lists and menus |
| `Enter` | Send message / Select / Confirm |
| `Ctrl+C` | Exit Termaaz |

---

## Views

Press **Tab** to cycle through views:

| # | View | Description |
|---|------|-------------|
| 1 | 💬 **Chat** | Real-time messaging + online users sidebar |
| 2 | 📋 **Todos** | Shared task list with priorities |
| 3 | 📁 **Files** | Shared files + local file browser |
| 4 | 📹 **Video** | ASCII video calls |
| 5 | ❓ **Help** | Command reference |

---

## CLI Options

```bash
termaaz [options] [room-id]

Options:
  -c, --create          Create a new room
  -j, --join <room-id>  Join an existing room
  -n, --name <name>     Set your display name
  -p, --password <pwd>  Set room password
  -s, --skip-intro      Skip welcome animation
  -h, --help            Show help
```

**Examples:**
```bash
# Create a new room
npm start -- --create

# Join a room with ID
npm start -- --join a1b2c3d4

# Join with custom name
npm start -- -n "Alice" --join a1b2c3d4

# Skip intro animation
npm start -- -s --create
```

---

## Password

The password for all rooms is:

```
termaazation
```

---

## Theme Colors

Termaaz uses a beautiful **Midnight** theme:

| Color | Hex | Usage |
|-------|-----|-------|
| 🟣 Purple | `#7C3AED` | Primary, borders, headers |
| 🩷 Pink | `#EC4899` | Secondary, highlights |
| 🩵 Cyan | `#06B6D4` | Accent, links, interactive |
| 🟢 Green | `#10B981` | Success, online status |
| 🟡 Amber | `#F59E0B` | Warning, pending items |
| 🔴 Red | `#EF4444` | Error, urgent priority |

---

## How P2P Works

```
┌──────────────┐                    ┌──────────────┐
│   User A     │                    │   User B     │
│   (Mac)      │◄──── Internet ────►│  (Windows)   │
│              │    Direct P2P      │              │
│ termaaz -c   │    Connection      │ termaaz ID   │
└──────────────┘                    └──────────────┘
         │                                  │
         └──────────┬───────────────────────┘
                    │
            ┌───────▼───────┐
            │  Hyperswarm   │
            │     DHT       │
            │  (Discovery)  │
            └───────────────┘
```

1. User A creates a room → gets a Room ID
2. User B joins with that Room ID
3. Both connect via DHT (Distributed Hash Table)
4. Direct encrypted P2P connection established
5. **No server in the middle!**

---

## Troubleshooting

### "Connection failed"
- Check your internet connection
- Make sure ports aren't blocked by firewall
- Try creating a new room

### "Password ghalate!"
- The password is: `termaazation`
- Make sure you type it correctly

### "Phone camera not connecting"
- Verify phone and computer are on same WiFi
- Check the IP address is correct
- Try common ports: 8080, 4747, 5000
- Make sure camera app is running and streaming

### "Video not showing"
- Both users need to run `/call start`
- Make sure your terminal supports Unicode
- Try a larger terminal window

### "Animations not showing"
- Make sure fun mode is on: `/maskharebazi on`
- Animations appear randomly every 1-5 minutes
- Or trigger manually: `/maskharebazi now`

---

## Project Structure

```
src/
├── commands/         # Command parser
│   └── parser.ts     # All slash commands
├── core/             # Core modules
│   ├── constants.ts  # Theme, colors, symbols
│   ├── state.ts      # State management
│   └── types.ts      # TypeScript types
├── files/            # File sharing
│   └── file-manager.ts
├── network/          # P2P networking
│   └── p2p.ts        # Hyperswarm connection
├── ui/               # UI components
│   ├── components/   # React (Ink) components
│   │   ├── Box.tsx
│   │   ├── ChatView.tsx
│   │   ├── CommandMenu.tsx
│   │   ├── FileView.tsx
│   │   ├── HelpView.tsx
│   │   ├── QRView.tsx
│   │   ├── TodoView.tsx
│   │   └── VideoView.tsx
│   ├── App.tsx       # Main app
│   ├── fun-animations.ts
│   └── WelcomeScreen.tsx
├── utils/            # Utilities
│   ├── helpers.ts
│   └── qr-code.ts    # QR code generation
├── video/            # Video features
│   ├── ascii-video.ts
│   └── phone-camera.ts
└── index.tsx         # Entry point
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **TypeScript** | Language |
| **Ink** | React for terminals |
| **Hyperswarm** | P2P networking |
| **Jimp** | Image processing (phone camera) |
| **QRCode Terminal** | QR code generation |

---

## Development

```bash
# Development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Clean build
npm run clean
```

---

## Requirements

- **Node.js 18+** - [Download](https://nodejs.org)
- **npm** - Comes with Node.js
- A terminal with Unicode support

---

## License

MIT License

---

## Credits

Made with ♥ using:
- [Hyperswarm](https://github.com/hyperswarm/hyperswarm) - P2P networking
- [Ink](https://github.com/vadimdemedes/ink) - React for terminals
- [Jimp](https://github.com/jimp-dev/jimp) - Image processing

---

```
╭────────────────────────────────────────────────────╮
│                                                    │
│   💬 Chat • 📋 Todos • 📁 Files • 📹 Video Calls   │
│              🎉 Fun Animations                     │
│                                                    │
│            All P2P in your terminal!               │
│                                                    │
│      Password: termaazation                        │
│                                                    │
│                Made with ♥                         │
│                                                    │
╰────────────────────────────────────────────────────╯
```
