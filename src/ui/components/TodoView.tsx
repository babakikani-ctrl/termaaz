// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Todo View Component (Ember Theme)
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Text } from 'ink';
import type { Todo } from '../../core/types.js';
import { formatRelative, truncate } from '../../utils/helpers.js';
import { DEFAULT_THEME, BOX, STATUS } from '../../core/constants.js';

interface TodoViewProps {
  todos: Todo[];
  selectedIndex: number;
  currentUserId: string;
}

export const TodoView: React.FC<TodoViewProps> = ({
  todos,
  selectedIndex,
  currentUserId,
}) => {
  const pendingTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <Box flexDirection="column" flexGrow={1} padding={1}>
      {/* Header with decorative border */}
      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Text color={DEFAULT_THEME.colors.primary}>{BOX.diamondFilled} </Text>
          <Text color={DEFAULT_THEME.colors.accent} bold>Tasks</Text>
          <Text color={DEFAULT_THEME.colors.border}> {BOX.horizontal.repeat(20)} </Text>
          <TodoMiniStats pending={pendingTodos.length} done={completedTodos.length} />
        </Box>
      </Box>

      {/* Progress bar */}
      {todos.length > 0 && (
        <Box marginBottom={1}>
          <TodoProgressBar total={todos.length} completed={completedTodos.length} />
        </Box>
      )}

      {/* Pending section */}
      {pendingTodos.length > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          <Box marginBottom={1}>
            <Text color={DEFAULT_THEME.colors.border}>{BOX.teeRight}{BOX.horizontal} </Text>
            <Text color={DEFAULT_THEME.colors.warning}>Pending</Text>
            <Text color={DEFAULT_THEME.colors.textMuted}> ({pendingTodos.length})</Text>
          </Box>
          <Box flexDirection="column">
            {pendingTodos.map((todo, index) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                isSelected={index === selectedIndex}
                isOwn={todo.createdBy === currentUserId}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Completed section */}
      {completedTodos.length > 0 && (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text color={DEFAULT_THEME.colors.border}>{BOX.teeRight}{BOX.horizontal} </Text>
            <Text color={DEFAULT_THEME.colors.success}>Done</Text>
            <Text color={DEFAULT_THEME.colors.textMuted}> ({completedTodos.length})</Text>
          </Box>
          <Box flexDirection="column">
            {completedTodos.slice(-5).map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                isSelected={false}
                isOwn={todo.createdBy === currentUserId}
              />
            ))}
            {completedTodos.length > 5 && (
              <Box paddingLeft={4}>
                <Text color={DEFAULT_THEME.colors.textMuted}>
                  {BOX.dot} +{completedTodos.length - 5} more completed
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Empty state */}
      {todos.length === 0 && (
        <Box flexDirection="column" alignItems="center" paddingY={3}>
          <Box flexDirection="column" alignItems="center" marginBottom={1}>
            <Text color={DEFAULT_THEME.colors.border}>   {BOX.diamond}   </Text>
            <Text color={DEFAULT_THEME.colors.border}> {BOX.diamond}   {BOX.diamond} </Text>
            <Text color={DEFAULT_THEME.colors.border}>   {BOX.diamond}   </Text>
          </Box>
          <Text color={DEFAULT_THEME.colors.textMuted}>
            No tasks yet
          </Text>
          <Box marginTop={1}>
            <Text color={DEFAULT_THEME.colors.accent}>/todo add {'<task>'}</Text>
          </Box>
        </Box>
      )}

      {/* Commands footer */}
      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text color={DEFAULT_THEME.colors.border}>{BOX.bottomLeft}{BOX.horizontal.repeat(40)}{BOX.bottomRight}</Text>
        </Box>
        <Box paddingX={1} gap={2}>
          <CommandHint cmd="/todo add" desc="new task" />
          <CommandHint cmd="/todo done" desc="complete" />
          <CommandHint cmd="/todo delete" desc="remove" />
        </Box>
      </Box>
    </Box>
  );
};

// Mini stats display
const TodoMiniStats: React.FC<{ pending: number; done: number }> = ({ pending, done }) => {
  return (
    <Box gap={1}>
      <Text color={DEFAULT_THEME.colors.border}>{BOX.vertical}</Text>
      <Text color={DEFAULT_THEME.colors.warning}>{pending}</Text>
      <Text color={DEFAULT_THEME.colors.textMuted}>pending</Text>
      <Text color={DEFAULT_THEME.colors.border}>{BOX.dot}</Text>
      <Text color={DEFAULT_THEME.colors.success}>{done}</Text>
      <Text color={DEFAULT_THEME.colors.textMuted}>done</Text>
    </Box>
  );
};

// Progress bar
const TodoProgressBar: React.FC<{ total: number; completed: number }> = ({ total, completed }) => {
  const progress = total > 0 ? completed / total : 0;
  const width = 30;
  const filled = Math.round(progress * width);
  const empty = width - filled;

  return (
    <Box paddingLeft={2}>
      <Text color={DEFAULT_THEME.colors.border}>[</Text>
      <Text color={DEFAULT_THEME.colors.success}>{BOX.diamondFilled.repeat(filled)}</Text>
      <Text color={DEFAULT_THEME.colors.border}>{BOX.diamond.repeat(empty)}</Text>
      <Text color={DEFAULT_THEME.colors.border}>]</Text>
      <Text color={DEFAULT_THEME.colors.textMuted}> {Math.round(progress * 100)}%</Text>
    </Box>
  );
};

// Command hint
const CommandHint: React.FC<{ cmd: string; desc: string }> = ({ cmd, desc }) => {
  return (
    <Box>
      <Text color={DEFAULT_THEME.colors.accent}>{cmd}</Text>
      <Text color={DEFAULT_THEME.colors.textMuted}> {desc}</Text>
    </Box>
  );
};

interface TodoItemProps {
  todo: Todo;
  isSelected: boolean;
  isOwn: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, isSelected, isOwn }) => {
  const priorityConfig: Record<string, { color: string; symbol: string }> = {
    low: { color: DEFAULT_THEME.colors.textMuted, symbol: BOX.dot },
    medium: { color: DEFAULT_THEME.colors.warning, symbol: BOX.diamond },
    high: { color: DEFAULT_THEME.colors.error, symbol: BOX.diamondFilled },
  };

  const priority = priorityConfig[todo.priority] || priorityConfig.low;

  // Artistic checkbox
  const checkbox = todo.completed
    ? `[${STATUS.success}]`  // [✓]
    : `[ ]`;

  const checkboxColor = todo.completed
    ? DEFAULT_THEME.colors.success
    : DEFAULT_THEME.colors.border;

  return (
    <Box
      paddingX={1}
      paddingY={0}
      borderStyle={isSelected ? 'round' : undefined}
      borderColor={isSelected ? DEFAULT_THEME.colors.primary : undefined}
    >
      {/* Selection indicator */}
      <Text color={isSelected ? DEFAULT_THEME.colors.primary : DEFAULT_THEME.colors.border}>
        {isSelected ? DEFAULT_THEME.symbols.arrowRight : ' '}{' '}
      </Text>

      {/* Checkbox with artistic style */}
      <Text color={checkboxColor} bold>
        {checkbox}{' '}
      </Text>

      {/* ID badge */}
      <Text color={DEFAULT_THEME.colors.textMuted}>
        #{todo.id}{' '}
      </Text>

      {/* Priority indicator */}
      <Text color={priority.color}>
        {priority.symbol}{' '}
      </Text>

      {/* Content with strikethrough for completed */}
      <Text
        color={todo.completed ? DEFAULT_THEME.colors.textMuted : DEFAULT_THEME.colors.text}
        strikethrough={todo.completed}
        dimColor={todo.completed}
      >
        {truncate(todo.content, 40)}
      </Text>

      {/* Metadata */}
      <Text color={DEFAULT_THEME.colors.border}> {BOX.dot} </Text>
      <Text color={DEFAULT_THEME.colors.textMuted}>
        {todo.createdByName}{isOwn ? ' (you)' : ''}
      </Text>

      {/* Completion indicator */}
      {todo.completed && todo.completedAt && (
        <>
          <Text color={DEFAULT_THEME.colors.border}> {BOX.dot} </Text>
          <Text color={DEFAULT_THEME.colors.success}>
            {formatRelative(todo.completedAt)}
          </Text>
        </>
      )}
    </Box>
  );
};

interface TodoStatsProps {
  todos: Todo[];
}

export const TodoStats: React.FC<TodoStatsProps> = ({ todos }) => {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const pending = total - completed;
  const progress = total > 0 ? completed / total : 0;
  const highPriority = todos.filter((t) => !t.completed && t.priority === 'high').length;

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Visual progress */}
      <Box marginBottom={1}>
        <Text color={DEFAULT_THEME.colors.textMuted}>Progress </Text>
        <Text color={DEFAULT_THEME.colors.border}>[</Text>
        <Text color={DEFAULT_THEME.colors.success}>
          {BOX.diamondFilled.repeat(Math.round(progress * 15))}
        </Text>
        <Text color={DEFAULT_THEME.colors.border}>
          {BOX.diamond.repeat(15 - Math.round(progress * 15))}
        </Text>
        <Text color={DEFAULT_THEME.colors.border}>]</Text>
        <Text color={DEFAULT_THEME.colors.accent}> {Math.round(progress * 100)}%</Text>
      </Box>

      {/* Stats row */}
      <Box gap={2}>
        <Box>
          <Text color={DEFAULT_THEME.colors.success}>{STATUS.success} </Text>
          <Text color={DEFAULT_THEME.colors.text}>{completed}</Text>
          <Text color={DEFAULT_THEME.colors.textMuted}> done</Text>
        </Box>
        <Text color={DEFAULT_THEME.colors.border}>{BOX.vertical}</Text>
        <Box>
          <Text color={DEFAULT_THEME.colors.warning}>{BOX.diamond} </Text>
          <Text color={DEFAULT_THEME.colors.text}>{pending}</Text>
          <Text color={DEFAULT_THEME.colors.textMuted}> pending</Text>
        </Box>
        {highPriority > 0 && (
          <>
            <Text color={DEFAULT_THEME.colors.border}>{BOX.vertical}</Text>
            <Box>
              <Text color={DEFAULT_THEME.colors.error}>{BOX.diamondFilled} </Text>
              <Text color={DEFAULT_THEME.colors.text}>{highPriority}</Text>
              <Text color={DEFAULT_THEME.colors.textMuted}> urgent</Text>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};
