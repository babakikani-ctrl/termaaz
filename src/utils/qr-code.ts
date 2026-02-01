// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - QR Code Generator for Phone Camera Connection
// ═══════════════════════════════════════════════════════════════════════════

import os from 'os';
import qrcode from 'qrcode-terminal';

// Get local IP address
export function getLocalIP(): string {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const info of iface) {
      // Skip internal and non-IPv4 addresses
      if (info.internal || info.family !== 'IPv4') continue;

      // Prefer WiFi/Ethernet interfaces
      if (info.address.startsWith('192.168.') ||
          info.address.startsWith('10.') ||
          info.address.startsWith('172.')) {
        return info.address;
      }
    }
  }

  return '127.0.0.1';
}

// Generate QR code as string array for terminal display
export function generateQRCode(data: string): Promise<string[]> {
  return new Promise((resolve) => {
    const lines: string[] = [];

    // Capture QR code output
    const originalLog = console.log;
    console.log = (line: string) => {
      lines.push(line);
    };

    qrcode.generate(data, { small: true }, () => {
      console.log = originalLog;
      resolve(lines);
    });
  });
}

// Camera app connection info
export interface CameraConnectionInfo {
  localIP: string;
  termaazPort: number;
  qrData: string;
  instructions: {
    camo: string[];
    ipWebcam: string[];
    droidcam: string[];
  };
}

// Generate connection info for phone camera apps
export function getCameraConnectionInfo(port: number = 8765): CameraConnectionInfo {
  const localIP = getLocalIP();

  // QR code contains connection URL
  const qrData = `termaaz://${localIP}:${port}`;

  return {
    localIP,
    termaazPort: port,
    qrData,
    instructions: {
      camo: [
        '📱 CAMO Setup:',
        '1. Install Camo app on iPhone/Android',
        '2. Open Camo on phone',
        `3. In Termaaz, use: /camera ${localIP}:8080`,
        '   (Camo usually uses port 8080)',
      ],
      ipWebcam: [
        '📱 IP WEBCAM Setup (Android):',
        '1. Install "IP Webcam" from Play Store',
        '2. Open app, scroll down, tap "Start server"',
        '3. Note the IP shown (e.g., 192.168.1.50:8080)',
        `4. In Termaaz: /camera <phone-ip>:8080`,
      ],
      droidcam: [
        '📱 DROIDCAM Setup:',
        '1. Install DroidCam on phone',
        '2. Open app, note the WiFi IP',
        `3. In Termaaz: /camera <phone-ip>:4747`,
      ],
    },
  };
}

// Generate ASCII art QR code box
export async function generateCameraQRDisplay(): Promise<string[]> {
  const info = getCameraConnectionInfo();
  const qrLines = await generateQRCode(info.qrData);

  const display: string[] = [
    '',
    '╭──────────────────────────────────────────────────────────────╮',
    '│          📱 PHONE CAMERA - SCAN TO CONNECT 📱               │',
    '╰──────────────────────────────────────────────────────────────╯',
    '',
    `  Your IP: ${info.localIP}`,
    '',
    ...qrLines.map(line => `  ${line}`),
    '',
    '╭──────────────────────────────────────────────────────────────╮',
    '│  Quick Setup:                                                │',
    '│                                                              │',
    '│  iPhone:  Install "Camo" app                                 │',
    '│  Android: Install "IP Webcam" or "DroidCam"                  │',
    '│                                                              │',
    '│  Then run camera app and use:                                │',
    `│    /camera <phone-ip>:<port>                                 │`,
    '│                                                              │',
    '│  Common ports:                                               │',
    '│    • IP Webcam: 8080                                         │',
    '│    • DroidCam:  4747                                         │',
    '│    • Camo:      8080                                         │',
    '╰──────────────────────────────────────────────────────────────╯',
    '',
    '  Press ESC to close',
    '',
  ];

  return display;
}

// Get simple instructions without QR
export function getCameraInstructions(): string[] {
  const info = getCameraConnectionInfo();

  return [
    '',
    '╭──────────────────────────────────────────────────────────────╮',
    '│          📱 PHONE CAMERA SETUP GUIDE 📱                     │',
    '╰──────────────────────────────────────────────────────────────╯',
    '',
    `  📍 Your Computer IP: ${info.localIP}`,
    '',
    '  ─────────────────────────────────────────────────────────────',
    '',
    '  📱 iPhone - CAMO (Recommended):',
    '     1. Download "Camo" from App Store (free)',
    '     2. Open Camo on iPhone',
    '     3. Both devices must be on same WiFi',
    '     4. In Termaaz type: /camera <phone-ip>:8080',
    '',
    '  📱 Android - IP WEBCAM (Recommended):',
    '     1. Download "IP Webcam" from Play Store (free)',
    '     2. Open app → Start server',
    '     3. Note the IP:Port shown on screen',
    '     4. In Termaaz type: /camera <phone-ip>:8080',
    '',
    '  📱 Android - DROIDCAM:',
    '     1. Download "DroidCam" from Play Store',
    '     2. Open app, note WiFi IP',
    '     3. In Termaaz type: /camera <phone-ip>:4747',
    '',
    '  ─────────────────────────────────────────────────────────────',
    '',
    '  💡 Tip: Make sure phone and computer are on same WiFi!',
    '',
  ];
}
