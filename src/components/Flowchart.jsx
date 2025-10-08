import React from 'react'
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'


export default function Flowchart({ nodes = [], edges = [] }) {
// reactflow expects nodes to have type and position. Our builder added them.
const safeNodes = nodes.map(n => ({ ...n, type: 'default' }))
return (
<div className="rounded-lg overflow-hidden" style={{height: '100%'}}>
<ReactFlowProvider>
<ReactFlow nodes={safeNodes} edges={edges} fitView>
<Background gap={12} />
<MiniMap />
<Controls />
</ReactFlow>
</ReactFlowProvider>
</div>
)
}
