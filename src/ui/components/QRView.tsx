// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Phone Camera Setup View (Simple)
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Text } from 'ink';
import { getLocalIP } from '../../utils/qr-code.js';
import { DEFAULT_THEME } from '../../core/constants.js';

interface QRViewProps {
  onClose?: () => void;
}

export const QRView: React.FC<QRViewProps> = ({ onClose }) => {
  const localIP = getLocalIP();

  return (
    <Box flexDirection="column" padding={1}>
      <Text color={DEFAULT_THEME.colors.primary} bold>
        📱 PHONE CAMERA SETUP
      </Text>

      <Box marginTop={1} flexDirection="column">
        <Text color={DEFAULT_THEME.colors.accent}>Your Computer IP: {localIP}</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color={DEFAULT_THEME.colors.text} bold>Step 1: Install app on phone</Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>  iPhone: Camo, EpocCam</Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>  Android: IP Webcam, DroidCam</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color={DEFAULT_THEME.colors.text} bold>Step 2: Same WiFi</Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>  Phone & computer on same network</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color={DEFAULT_THEME.colors.text} bold>Step 3: Start camera app</Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>  Note the IP:Port shown in app</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color={DEFAULT_THEME.colors.text} bold>Step 4: Connect in Termaaz</Text>
        <Text color={DEFAULT_THEME.colors.secondary}>  /camera {'<phone-ip>:<port>'}</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text color={DEFAULT_THEME.colors.textMuted}>Common ports: 8080, 4747, 5000</Text>
      </Box>

      <Box marginTop={1}>
        <Text color={DEFAULT_THEME.colors.textMuted}>Press ESC to close</Text>
      </Box>
    </Box>
  );
};

export default QRView;
