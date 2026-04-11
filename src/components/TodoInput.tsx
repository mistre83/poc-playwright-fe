import { useState } from 'react'

interface Props {
  onAdd: (text: string) => void
}

export default function TodoInput({ onAdd }: Props) {
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setValue('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}
    >
      <input
        data-testid="todo-input"
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Aggiungi un todo..."
        style={{
          flex: 1,
          padding: '0.5rem 0.75rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '1rem',
        }}
      />
      <button
        data-testid="add-button"
        type="submit"
        style={{
          padding: '0.5rem 1rem',
          background: '#0066cc',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        Aggiungi
      </button>
    </form>
  )
}
