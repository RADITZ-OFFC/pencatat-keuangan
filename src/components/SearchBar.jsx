import React, { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({ onSearch, placeholder = 'Cari pengeluaran...' }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  const handleChange = (e) => {
    setQuery(e.target.value)
    onSearch(e.target.value)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
    inputRef.current?.focus()
  }

  return (
    <div
      className={`flex items-center gap-3 glass rounded-2xl px-4 py-3 transition-all duration-200 ${
        focused ? 'ring-2 ring-violet-500/50' : ''
      }`}
    >
      <Search className={`w-4 h-4 flex-shrink-0 transition-colors ${focused ? 'text-violet-400' : 'text-gray-500'}`} />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
        style={{ fontSize: '16px' }}
      />
      {query && (
        <button onClick={handleClear} className="text-gray-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
