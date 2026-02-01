// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - File Browser View Component
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Text } from 'ink';
import type { SharedFile, FileInfo } from '../../core/types.js';
import { formatFileSize, formatRelative, getFileIcon, truncate } from '../../utils/helpers.js';
import { DEFAULT_THEME } from '../../core/constants.js';
import { ProgressBar } from './Box.js';

interface FileViewProps {
  sharedFiles: SharedFile[];
  localFiles: FileInfo[];
  currentPath: string;
  selectedIndex: number;
  mode: 'shared' | 'browser';
  transfers: Map<string, number>;
}

export const FileView: React.FC<FileViewProps> = ({
  sharedFiles,
  localFiles,
  currentPath,
  selectedIndex,
  mode,
  transfers,
}) => {
  return (
    <Box flexDirection="column" flexGrow={1} padding={1}>
      {/* Header */}
      <Box marginBottom={1} justifyContent="space-between">
        <Box>
          <Text color={DEFAULT_THEME.colors.primary} bold>
            📁 {mode === 'shared' ? 'Shared Files' : 'File Browser'}
          </Text>
        </Box>
        <Box gap={2}>
          <Text
            color={mode === 'shared' ? DEFAULT_THEME.colors.primary : DEFAULT_THEME.colors.textMuted}
            bold={mode === 'shared'}
            inverse={mode === 'shared'}
          >
            {' '}Shared{' '}
          </Text>
          <Text
            color={mode === 'browser' ? DEFAULT_THEME.colors.primary : DEFAULT_THEME.colors.textMuted}
            bold={mode === 'browser'}
            inverse={mode === 'browser'}
          >
            {' '}Browse{' '}
          </Text>
        </Box>
      </Box>

      {/* Current path (browser mode) */}
      {mode === 'browser' && (
        <Box marginBottom={1}>
          <Text color={DEFAULT_THEME.colors.textMuted}>📍 </Text>
          <Text color={DEFAULT_THEME.colors.accent}>{truncate(currentPath, 60)}</Text>
        </Box>
      )}

      {/* File list */}
      <Box flexDirection="column" flexGrow={1}>
        {mode === 'shared' ? (
          // Shared files view
          sharedFiles.length === 0 ? (
            <EmptyState message="No shared files yet. Share with /file share <path>" />
          ) : (
            sharedFiles.map((file, index) => (
              <SharedFileItem
                key={file.id}
                file={file}
                isSelected={index === selectedIndex}
                progress={transfers.get(file.id)}
              />
            ))
          )
        ) : (
          // Browser view
          localFiles.map((file, index) => (
            <LocalFileItem
              key={file.id || file.name}
              file={file}
              isSelected={index === selectedIndex}
            />
          ))
        )}
      </Box>

      {/* Active transfers */}
      {transfers.size > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color={DEFAULT_THEME.colors.textMuted} bold>
            ── Active Transfers ──
          </Text>
          {Array.from(transfers.entries()).map(([fileId, progress]) => {
            const file = sharedFiles.find((f) => f.id === fileId);
            return (
              <Box key={fileId} paddingLeft={1}>
                <Text color={DEFAULT_THEME.colors.accent}>
                  {file?.name || fileId}
                </Text>
                <Text color={DEFAULT_THEME.colors.textMuted}> </Text>
                <ProgressBar progress={progress} width={15} />
              </Box>
            );
          })}
        </Box>
      )}

      {/* Help */}
      <Box marginTop={1} borderStyle="single" borderColor={DEFAULT_THEME.colors.border} paddingX={1}>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          {mode === 'browser'
            ? 'Enter: Open/Share • Backspace: Go up • Tab: Switch mode'
            : '/file share <path> • /file get <id> • Tab: Switch mode'}
        </Text>
      </Box>
    </Box>
  );
};

interface SharedFileItemProps {
  file: SharedFile;
  isSelected: boolean;
  progress?: number;
}

const SharedFileItem: React.FC<SharedFileItemProps> = ({ file, isSelected, progress }) => {
  const icon = getFileIcon(file.name, file.isDirectory);

  return (
    <Box paddingLeft={1}>
      {/* Selection indicator */}
      <Text color={DEFAULT_THEME.colors.primary}>
        {isSelected ? '› ' : '  '}
      </Text>

      {/* Icon */}
      <Text>{icon} </Text>

      {/* ID */}
      <Text color={DEFAULT_THEME.colors.textMuted} dimColor>
        #{file.id.slice(0, 6)}{' '}
      </Text>

      {/* Name */}
      <Text
        color={file.isDirectory ? DEFAULT_THEME.colors.accent : DEFAULT_THEME.colors.text}
        bold={file.isDirectory}
      >
        {truncate(file.name, 30)}
      </Text>

      {/* Size */}
      <Text color={DEFAULT_THEME.colors.textMuted}>
        {' '}({file.isDirectory ? 'DIR' : formatFileSize(file.size)})
      </Text>

      {/* Shared by */}
      <Text color={DEFAULT_THEME.colors.textMuted}>
        {' '}• {file.sharedByName}
      </Text>

      {/* Availability status */}
      <Text color={file.isAvailable ? DEFAULT_THEME.colors.success : DEFAULT_THEME.colors.warning}>
        {' '}{file.isAvailable ? '●' : '○'}
      </Text>

      {/* Transfer progress */}
      {progress !== undefined && progress < 1 && (
        <Box marginLeft={1}>
          <ProgressBar progress={progress} width={10} showPercentage={false} />
        </Box>
      )}
    </Box>
  );
};

interface LocalFileItemProps {
  file: FileInfo;
  isSelected: boolean;
}

const LocalFileItem: React.FC<LocalFileItemProps> = ({ file, isSelected }) => {
  const icon = getFileIcon(file.name, file.isDirectory);

  return (
    <Box paddingLeft={1}>
      {/* Selection indicator */}
      <Text color={DEFAULT_THEME.colors.primary}>
        {isSelected ? '› ' : '  '}
      </Text>

      {/* Icon */}
      <Text>{icon} </Text>

      {/* Name */}
      <Text
        color={file.isDirectory ? DEFAULT_THEME.colors.accent : DEFAULT_THEME.colors.text}
        bold={file.isDirectory}
      >
        {file.name === '..' ? '.. (parent)' : truncate(file.name, 40)}
      </Text>

      {/* Size (for files) */}
      {!file.isDirectory && file.size > 0 && (
        <Text color={DEFAULT_THEME.colors.textMuted}>
          {' '}({formatFileSize(file.size)})
        </Text>
      )}
    </Box>
  );
};

interface EmptyStateProps {
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <Box justifyContent="center" paddingY={2}>
      <Text color={DEFAULT_THEME.colors.textMuted} italic>
        {message}
      </Text>
    </Box>
  );
};

interface FilePreviewProps {
  file: SharedFile | FileInfo | null;
  content?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, content }) => {
  if (!file) {
    return (
      <Box padding={1}>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          Select a file to preview
        </Text>
      </Box>
    );
  }

  const icon = getFileIcon(file.name, file.isDirectory);

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color={DEFAULT_THEME.colors.primary} bold>
          {icon} {file.name}
        </Text>
      </Box>

      <Box flexDirection="column">
        <Text color={DEFAULT_THEME.colors.textMuted}>
          Size: {file.isDirectory ? 'Directory' : formatFileSize(file.size)}
        </Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          Path: {truncate(file.path, 50)}
        </Text>
        {'sharedByName' in file && file.sharedByName && (
          <Text color={DEFAULT_THEME.colors.textMuted}>
            Shared by: {file.sharedByName}
          </Text>
        )}
      </Box>

      {content && (
        <Box flexDirection="column" marginTop={1}>
          <Text color={DEFAULT_THEME.colors.textMuted}>── Preview ──</Text>
          <Box borderStyle="single" borderColor={DEFAULT_THEME.colors.border} padding={1}>
            <Text color={DEFAULT_THEME.colors.text}>
              {truncate(content, 500)}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};
