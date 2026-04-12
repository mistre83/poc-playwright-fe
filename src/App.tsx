import { useState } from 'react'
import { Todo } from './types/todo'
import TodoInput from './components/TodoInput'
import TodoList from './components/TodoList'

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])

  function addTodo(text: string) {
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setTodos(prev => [...prev, { id, text, completed: false }])
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
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.75rem' }}>Todo List</h1>
      <TodoInput onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
    </main>
  )
}
