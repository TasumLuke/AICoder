import React from 'react'

export default function Editor({ value, onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-500">Write simple pseudocode (IF/ELSE, FOR, WHILE, FUNCTION, assignments)</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-2 w-full h-80 p-3 rounded-xl border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-purple-200 resize-none bg-gradient-to-br from-white to-purple-50 text-sm"
      />
      <div className="mt-2 text-xs text-gray-500">Try: <span className="font-mono">IF x &gt; 0 THEN</span> / <span className="font-mono">FOR i = 1 TO 10</span></div>
    </div>
  )
}
