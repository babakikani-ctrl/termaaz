// ═══════════════════════════════════════════════════════════════════════════
// TERMAAZ - Todo View Component (Professional UI)
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Box, Text } from 'ink';
import type { Todo } from '../../core/types.js';
import { formatRelative, truncate } from '../../utils/helpers.js';
import { DEFAULT_THEME } from '../../core/constants.js';

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
      {/* Header */}
      <Box marginBottom={1}>
        <Text color={DEFAULT_THEME.colors.primary} bold>
          Todo List
        </Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          {' '}({pendingTodos.length} pending, {completedTodos.length} done)
        </Text>
      </Box>

      {/* Pending todos */}
      {pendingTodos.length > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          <Text color={DEFAULT_THEME.colors.textMuted}>
            Pending
          </Text>
          <Box flexDirection="column" marginTop={1}>
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

      {/* Completed todos */}
      {completedTodos.length > 0 && (
        <Box flexDirection="column">
          <Text color={DEFAULT_THEME.colors.textMuted}>
            Completed
          </Text>
          <Box flexDirection="column" marginTop={1}>
            {completedTodos.slice(-5).map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                isSelected={false}
                isOwn={todo.createdBy === currentUserId}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Empty state */}
      {todos.length === 0 && (
        <Box justifyContent="center" paddingY={2}>
          <Text color={DEFAULT_THEME.colors.textMuted}>
            No todos yet. Add one with /todo add {'<task>'}
          </Text>
        </Box>
      )}

      {/* Help */}
      <Box marginTop={1} borderStyle="single" borderColor={DEFAULT_THEME.colors.border} paddingX={1}>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          /todo add {'<task>'} | /todo done {'<id>'} | /todo delete {'<id>'}
        </Text>
      </Box>
    </Box>
  );
};

interface TodoItemProps {
  todo: Todo;
  isSelected: boolean;
  isOwn: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, isSelected, isOwn }) => {
  const priorityColors: Record<string, string> = {
    low: DEFAULT_THEME.colors.textMuted,
    medium: DEFAULT_THEME.colors.warning,
    high: DEFAULT_THEME.colors.error,
  };

  // Box characters for checkbox
  const checkbox = todo.completed ? '[x]' : '[ ]';
  const checkboxColor = todo.completed ? DEFAULT_THEME.colors.success : DEFAULT_THEME.colors.textMuted;

  return (
    <Box
      paddingX={1}
      paddingY={0}
      borderStyle={isSelected ? 'round' : undefined}
      borderColor={isSelected ? DEFAULT_THEME.colors.primary : undefined}
    >
      {/* Selection arrow */}
      <Text color={DEFAULT_THEME.colors.primary}>
        {isSelected ? '> ' : '  '}
      </Text>

      {/* Checkbox */}
      <Text color={checkboxColor} bold>
        {checkbox}{' '}
      </Text>

      {/* ID */}
      <Text color={DEFAULT_THEME.colors.textMuted} dimColor>
        #{todo.id}{' '}
      </Text>

      {/* Priority dot */}
      <Text color={priorityColors[todo.priority]}>
        {todo.priority === 'high' ? '!' : todo.priority === 'medium' ? '*' : '-'}{' '}
      </Text>

      {/* Content */}
      <Text
        color={todo.completed ? DEFAULT_THEME.colors.textMuted : DEFAULT_THEME.colors.text}
        strikethrough={todo.completed}
        dimColor={todo.completed}
      >
        {truncate(todo.content, 45)}
      </Text>

      {/* Creator */}
      <Text color={DEFAULT_THEME.colors.textMuted}>
        {' '}by {todo.createdByName}{isOwn ? ' (you)' : ''}
      </Text>

      {/* Completion time */}
      {todo.completed && todo.completedAt && (
        <Text color={DEFAULT_THEME.colors.success} dimColor>
          {' '}done {formatRelative(todo.completedAt)}
        </Text>
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
      <Box>
        <Text color={DEFAULT_THEME.colors.textMuted}>Progress: </Text>
        <Text color={DEFAULT_THEME.colors.primary}>
          {'#'.repeat(Math.round(progress * 10))}
        </Text>
        <Text color={DEFAULT_THEME.colors.border}>
          {'.'.repeat(10 - Math.round(progress * 10))}
        </Text>
        <Text color={DEFAULT_THEME.colors.textMuted}>
          {' '}{Math.round(progress * 100)}%
        </Text>
      </Box>

      <Box>
        <Text color={DEFAULT_THEME.colors.success}>{completed} done</Text>
        <Text color={DEFAULT_THEME.colors.textMuted}> | </Text>
        <Text color={DEFAULT_THEME.colors.warning}>{pending} pending</Text>
        {highPriority > 0 && (
          <>
            <Text color={DEFAULT_THEME.colors.textMuted}> | </Text>
            <Text color={DEFAULT_THEME.colors.error}>{highPriority} urgent</Text>
          </>
        )}
      </Box>
    </Box>
  );
};
