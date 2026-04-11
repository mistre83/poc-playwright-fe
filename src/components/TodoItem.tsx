import { Todo } from '../types/todo'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <li
      data-testid="todo-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.6rem 0.75rem',
        marginBottom: '0.4rem',
        background: '#fff',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
      }}
    >
      <input
        data-testid="todo-checkbox"
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
      />
      <span
        style={{
          flex: 1,
          textDecoration: todo.completed ? 'line-through' : 'none',
          color: todo.completed ? '#888' : '#111',
        }}
      >
        {todo.text}
      </span>
      <button
        data-testid="delete-button"
        onClick={() => onDelete(todo.id)}
        style={{
          padding: '0.2rem 0.5rem',
          background: 'transparent',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
          color: '#c00',
          fontSize: '0.85rem',
        }}
      >
        Elimina
      </button>
    </li>
  )
}
