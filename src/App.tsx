import { useState } from 'react'
import { Todo } from './types/todo'
import TodoInput from './components/TodoInput'
import TodoList from './components/TodoList'

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])

  function addTodo(text: string) {
    setTodos(prev => [...prev, { id: crypto.randomUUID(), text, completed: false }])
  }

  function toggleTodo(id: string) {
    setTodos(prev =>
      prev.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo)
    )
  }

  function deleteTodo(id: string) {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  return (
    <main>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>Todo List Smoke</h1>
      <TodoInput onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </main>
  )
}
