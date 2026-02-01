// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Phone Camera Setup View (Ember Theme)
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Text } from 'ink';
import { getLocalIP } from '../../utils/qr-code.js';
import { DEFAULT_THEME, BOX, STATUS } from '../../core/constants.js';

interface QRViewProps {
  onClose?: () => void;
}

export const QRView: React.FC<QRViewProps> = ({ onClose }) => {
  const localIP = getLocalIP();

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={DEFAULT_THEME.colors.primary}>{BOX.diamondFilled} </Text>
        <Text color={DEFAULT_THEME.colors.accent} bold>
          Phone Camera Setup
        </Text>
      </Box>

      {/* Decorative divider */}
      <Box marginBottom={1}>
        <Text color={DEFAULT_THEME.colors.border}>
          {BOX.horizontal} {BOX.diamond} {BOX.horizontal.repeat(25)} {BOX.diamond} {BOX.horizontal}
        </Text>
      </Box>

      {/* IP Address display */}
      <Box marginBottom={1} flexDirection="column">
        <Box>
          <Text color={DEFAULT_THEME.colors.textMuted}>Your IP: </Text>
          <Text color={DEFAULT_THEME.colors.warning} bold>{localIP}</Text>
        </Box>
      </Box>

      {/* Steps */}
      <Box flexDirection="column" gap={1}>
        <StepItem
          step={1}
          title="Install app on phone"
          details={['iPhone: Camo, EpocCam', 'Android: IP Webcam, DroidCam']}
        />

        <StepItem
          step={2}
          title="Same WiFi network"
          details={['Phone and computer on same network']}
        />

        <StepItem
          step={3}
          title="Start camera app"
          details={['Note the IP:Port shown in app']}
        />

        <StepItem
          step={4}
          title="Connect in Termaaz"
          details={['/camera <phone-ip>:<port>']}
          highlight
        />
      </Box>

      {/* Common ports */}
      <Box marginTop={1}>
        <Text color={DEFAULT_THEME.colors.border}>{BOX.diamond} </Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>Common ports: </Text>
        <Text color={DEFAULT_THEME.colors.accent}>8080, 4747, 5000</Text>
      </Box>

      {/* Footer */}
      <Box marginTop={1}>
        <Text color={DEFAULT_THEME.colors.border}>
          {BOX.horizontal.repeat(35)}
        </Text>
      </Box>
      <Box>
        <Text color={DEFAULT_THEME.colors.textMuted}>[Esc] close</Text>
      </Box>
    </Box>
  );
};

interface StepItemProps {
  step: number;
  title: string;
  details: string[];
  highlight?: boolean;
}

const StepItem: React.FC<StepItemProps> = ({ step, title, details, highlight }) => {
  return (
    <Box flexDirection="column">
      <Box>
        <Text color={DEFAULT_THEME.colors.primary}>{BOX.diamondFilled} </Text>
        <Text color={DEFAULT_THEME.colors.text} bold>Step {step}: </Text>
        <Text color={DEFAULT_THEME.colors.accent}>{title}</Text>
      </Box>
      {details.map((detail, i) => (
        <Box key={i} paddingLeft={3}>
          <Text color={DEFAULT_THEME.colors.border}>{BOX.teeRight} </Text>
          <Text color={highlight ? DEFAULT_THEME.colors.secondary : DEFAULT_THEME.colors.textMuted}>
            {detail}
          </Text>
        </Box>
      ))}
    </Box>
  );
};

export default QRView;
