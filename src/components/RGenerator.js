let uid = 1
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
