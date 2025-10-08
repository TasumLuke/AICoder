# Pseudocode → R Converter (React)


This onverts a simple pseudocode dialect into runnable R code and shows a flowchart of the decision tree. It's intentionally small so you can extend the parser heuristics in `src/components/RGenerator.js`.


## Features
- Live conversion from pseudocode to R (supports IF/ELSE, FOR, WHILE, FUNCTION, assignments, PRINT)
- Auto-generated flowchart using React Flow
- Playful UI using Tailwind + Framer Motion + Lucide icons


## How it works
- `Editor.jsx` collects user pseudocode.
- `RGenerator.js` contains two helpers: `parsePseudocodeToR` and `buildFlowFromPseudocode`.
- `Flowchart.jsx` renders nodes/edges using React Flow.


## Extend
- Add better condition parsing, expression translation, and support for more R idioms.
- Replace the editor with CodeMirror for syntax highlighting.
- Add export buttons (download .R file, PNG of flowchart).


Enjoy! 🎀


*/
