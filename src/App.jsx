import React, { useState, useMemo } from 'react'
import Editor from './components/Editor'
import Flowchart from './components/Flowchart'
import { parsePseudocodeToR, buildFlowFromPseudocode } from './components/RGenerator'
import { MotionConfig, motion } from 'framer-motion'
// subtle branding — no decorative icons

export default function App() {
  const [code, setCode] = useState(`// Hello! Write pseudocode here. Examples:\n// IF age >= 18 THEN\n//   print "adult"\n// ELSE\n//   print "minor"\n// ENDIF\n\nFUNCTION greet(name):\n  msg = "Hello, " + name\n  print msg\nEND FUNCTION\n`)

  const rCode = useMemo(() => parsePseudocodeToR(code), [code])
  const flow = useMemo(() => buildFlowFromPseudocode(code), [code])

  return (
    <MotionConfig transition={{ type: 'spring', stiffness: 120 }}>
      <div className="min-h-screen p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold">Pseudocode → <span className="text-purple-500">R</span> + Flowchart</h1>
          <div className="text-sm text-gray-500">Dr Baptiste & Luke Lego</div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-5 card">
            <h2 className="text-xl font-semibold mb-2">Pseudocode Editor</h2>
            <Editor value={code} onChange={setCode} />
          </div>

          <div className="col-span-4 card flex flex-col">
            <h2 className="text-xl font-semibold mb-2">Generated R code</h2>
            <pre className="flex-1 overflow-auto p-3 rounded-lg bg-gradient-to-br from-white to-purple-50 text-sm" style={{whiteSpace:'pre-wrap'}}>
              {rCode}
            </pre>
            <div className="mt-3 flex gap-2">
              <motion.button whileHover={{ scale: 1.02 }} className="px-3 py-1 rounded-full bg-indigo-600 text-white">Copy R</motion.button>
              <motion.button whileHover={{ scale: 1.02 }} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">Save snippet</motion.button>
            </div>
          </div>

          <div className="col-span-3 card">
            <h2 className="text-xl font-semibold mb-2">Flowchart</h2>
            <div style={{height: 420}}>
              <Flowchart nodes={flow.nodes} edges={flow.edges} />
            </div>
          </div>
        </div>

        <footer className="mt-6 text-sm text-gray-600">Designed by Dr Baptiste & Luke Lego — tweak the parser in <code>src/components/RGenerator.js</code></footer>
      </div>
    </MotionConfig>
  )
}
