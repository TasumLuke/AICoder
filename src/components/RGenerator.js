let uid = 1
const nextId = () => `n${uid++}`

export function parsePseudocodeToR(text) {
  uid = 1
  const lines = text.split('\n').map(l => l.replace(/\t/g, '    '))
  const out = []
  const stack = [] // track control structures

  function indent() { return '  '.repeat(stack.length) }

  for (let raw of lines) {
    const line = raw.trim()
    if (!line) continue
    // comments
    if (line.startsWith('//')) { out.push(`${indent()}# ${line.slice(2).trim()}`); continue }

    const IF = line.match(/^IF\s+(.+)\s+THEN$/i)
    const ELSE = /^ELSE$/i.test(line)
    const ENDIF = /^END(IF)?$/i.test(line) && /ENDIF|END IF|END IF/i.test(line) || /^ENDIF$/i.test(line) || /^END IF$/i.test(line)
    const WHILE = line.match(/^WHILE\s+(.+)\s+DO$/i)
    const ENDWHILE = /^ENDWHILE$/i.test(line) || /^END WHILE$/i.test(line)
    const FOR = line.match(/^FOR\s+(\w+)\s*=\s*(.+)\s+TO\s+(.+)$/i)
    const ENDFOR = /^ENDFOR$/i.test(line) || /^END FOR$/i.test(line)
    const FUNC = line.match(/^FUNCTION\s+(\w+)\s*\(([^)]*)\):?$/i)
    const ENDFUNC = /^END\s*FUNCTION$/i.test(line) || /^END FUNCTION$/i.test(line)
    const PRINT = line.match(/^PRINT\s+(.+)$/i)
    const ASSIGN = line.match(/^(\w+)\s*=\s*(.+)$/)

    if (IF) {
      out.push(`${indent()}if (${IF[1]}) {`)
      stack.push('if')
    } else if (ELSE) {
      if (stack.length && stack[stack.length-1] === 'if') {
        out.push(`${indent().slice(0,-2)}} else {`)
      } else {
        out.push(`${indent()}# ELSE (unmatched)`)
      }
    } else if (ENDIF) {
      if (stack.length && stack[stack.length-1] === 'if') {
        stack.pop()
        out.push(`${indent()}}`)
      } else {
        out.push(`${indent()}# ENDIF (unmatched)`)
      }
    } else if (WHILE) {
      out.push(`${indent()}while (${WHILE[1]}) {`)
      stack.push('while')
    } else if (ENDWHILE) {
      if (stack.length && stack[stack.length-1] === 'while') {
        stack.pop()
        out.push(`${indent()}}`)
      } else {
        out.push(`${indent()}# ENDWHILE (unmatched)`)
      }
    } else if (FOR) {
      const v = FOR[1]
      const start = FOR[2]
      const end = FOR[3]
      out.push(`${indent()}for (${v} in seq(${start}, ${end})) {`)
      stack.push('for')
    } else if (ENDFOR) {
      if (stack.length && stack[stack.length-1] === 'for') {
        stack.pop()
        out.push(`${indent()}}`)
      } else {
        out.push(`${indent()}# ENDFOR (unmatched)`)
      }
    } else if (FUNC) {
      const name = FUNC[1]
      const params = FUNC[2].trim()
      out.push(`${indent()}${name} <- function(${params}) {`)
      stack.push('func')
    } else if (ENDFUNC) {
      if (stack.length && stack[stack.length-1] === 'func') {
        stack.pop()
        out.push(`${indent()}}`)
      } else {
        out.push(`${indent()}# END FUNCTION (unmatched)`)
      }
    } else if (PRINT) {
      out.push(`${indent()}print(${PRINT[1]})`)
    } else if (ASSIGN) {
      out.push(`${indent()}${ASSIGN[1]} <- ${ASSIGN[2]}`)
    } else {
      out.push(`${indent()}# Unrecognized: ${line}`)
    }
  }

  // close any unclosed blocks
  while (stack.length) {
    stack.pop()
    out.push('}')
  }

  return out.join('\n')
}

export function buildFlowFromPseudocode(text) {
  // Very small flow builder: turns IF/ELSE/ENDIF into branching nodes, linear nodes otherwise.
  // Output compatible with reactflow: { nodes: [...], edges: [...] }
  uid = 1
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  const nodes = []
  const edges = []

  const stack = [] // for if blocks: {id, trueExitId, falseExitId, afterId}
  let prevId = null

  function addNode(label) {
    const id = nextId()
    nodes.push({ id, data: { label }, position: { x: 40 + nodes.length*10, y: 40 + nodes.length*60 } , style: { borderRadius: 14, padding: 8, border: '2px solid #ddd', background: 'linear-gradient(135deg,#fff,#f8f0ff)'}})
    if (prevId) edges.push({ id: `e${prevId}-${id}`, source: prevId, target: id, animated: true })
    prevId = id
    return id
  }

  for (let raw of lines) {
    if (raw.startsWith('//')) continue
    const IF = raw.match(/^IF\s+(.+)\s+THEN$/i)
    const ELSE = /^ELSE$/i.test(raw)
    const ENDIF = /^ENDIF$/i.test(raw) || /^END IF$/i.test(raw) || /^END(IF)?$/i.test(raw)
    const WHILE = raw.match(/^WHILE\s+(.+)\s+DO$/i)
    const FOR = raw.match(/^FOR\s+(\w+)\s*=\s*(.+)\s+TO\s+(.+)$/i)
    const FUNC = raw.match(/^FUNCTION\s+(\w+)/i)
    const PRINT = raw.match(/^PRINT\s+(.+)$/i)
    const ASSIGN = raw.match(/^(\w+)\s*=\s*(.+)$/)

    if (IF) {
      const cond = IF[1]
      const id = addNode(`IF ${cond}?`)
      // make placeholders for true/false chains
      stack.push({ type: 'if', id, truePrev: null, falsePrev: null, after: null, state: 'then' })
      prevId = id
    } else if (ELSE) {
      const top = stack[stack.length-1]
      if (top && top.type === 'if') {
        // switch branch: record where THEN branch ended
        top.truePrev = prevId
        prevId = top.id // connect from condition to start of ELSE branch
        top.state = 'else'
      } else {
        addNode('ELSE (unmatched)')
      }
    } else if (ENDIF) {
      const top = stack.pop()
      if (top && top.type === 'if') {
        // record last node of current branch
        if (top.state === 'then') top.truePrev = prevId
        else top.falsePrev = prevId
        // create merge node
        const afterId = nextId()
        nodes.push({ id: afterId, data: { label: '⭑ Continue' }, position: { x: 60 + nodes.length*6, y: 30 + nodes.length*40 }, style: { borderRadius: 12, padding: 6, background: 'linear-gradient(135deg,#fff7f9,#f0f9ff)'}})
        // connect truePrev and falsePrev to afterId
        if (top.truePrev) edges.push({ id: `e${top.truePrev}-${afterId}`, source: top.truePrev, target: afterId })
        if (top.falsePrev) edges.push({ id: `e${top.falsePrev}-${afterId}`, source: top.falsePrev, target: afterId })
        // connect condition node to true branch start (if it exists)
        // We approximated linear flow; for clarity, add edges from condition to top.truePrev and top.falsePrev when present
        if (top.truePrev) edges.push({ id: `e${top.id}-t-${top.truePrev}`, source: top.id, target: top.truePrev, label: 'yes' })
        if (top.falsePrev) edges.push({ id: `e${top.id}-f-${top.falsePrev}`, source: top.id, target: top.falsePrev, label: 'no' })
        prevId = afterId
      } else {
        addNode('ENDIF (unmatched)')
      }
    } else if (WHILE) {
      const id = addNode(`WHILE ${WHILE[1]}`)
      // simplistic: create a loop back after the body
      prevId = id
    } else if (FOR) {
      const id = addNode(`FOR ${FOR[1]} in ${FOR[2]}..${FOR[3]}`)
      prevId = id
    } else if (FUNC) {
      const id = addNode(`FUNC ${FUNC[1]}()`)
      prevId = id
    } else if (PRINT) {
      addNode(`print(${PRINT[1]})`)
    } else if (ASSIGN) {
      addNode(`${ASSIGN[1]} <- ${ASSIGN[2]}`)
    } else {
      addNode(raw)
    }
  }

  return { nodes, edges }
}
