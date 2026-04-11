import { Todo } from '../types/todo'
import TodoItem from './TodoItem'

interface Props {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export default function TodoList({ todos, onToggle, onDelete }: Props) {
  return (
    <ul data-testid="todo-list" style={{ listStyle: 'none' }}>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  )
}
