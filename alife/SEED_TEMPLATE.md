# ALife Web Garden - Seed Creation Guide (ASCII dual-format)

This guide documents the standardized process for creating new ALife seeds in the "Bilingual Garden" (ASCII dual-format).

## 1. Core Architecture
Every new seed MUST follow this strict standard:
- **No `<canvas>` tags.**
- The visual state must be represented purely by ASCII characters and inline CSS colors.
- The output must be injected into a `<pre id="canvas">` element.

## 2. Minimal Template (`seed_name.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seed Name - ALife Web Garden</title>
    <style>
        body {
            background-color: #000;
            color: #0f0;
            font-family: monospace;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        #canvas {
            background-color: #111;
            padding: 10px;
            border: 1px solid #333;
            line-height: 1; /* Crucial for ASCII grids */
            letter-spacing: 0;
            font-size: 12px;
            white-space: pre;
        }
        .controls {
            margin-top: 20px;
            color: #888;
        }
    </style>
</head>
<body>
    <h1>Seed Name</h1>
    <div id="canvas"></div>
    <div class="controls">
        <p>Agent/DOM view is pure text.</p>
    </div>

    <script>
        const width = 40;
        const height = 20;
        let grid = [];

        function init() {
            // Initialize your grid state here
            for (let y = 0; y < height; y++) {
                let row = [];
                for (let x = 0; x < width; x++) {
                    row.push(Math.random() > 0.5 ? 1 : 0);
                }
                grid.push(row);
            }
        }

        function update() {
            // Update your grid state here
        }

        function draw() {
            let output = "";
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let cell = grid[y][x];
                    let char = cell ? '#' : ' ';
                    let color = cell ? '#0f0' : '#000';
                    output += `<span style="color:${color};">${char}</span>`;
                }
                output += "\n";
            }
            document.getElementById("canvas").innerHTML = output;
        }

        function loop() {
            update();
            draw();
            setTimeout(loop, 100); // 10fps for ASCII is usually fine
        }

        init();
        loop();
    </script>
</body>
</html>
```

## 3. Registration Process
After creating `projects/alife_web/seed_name.html`:
1. Add an entry to `manifest.json`.
2. Run `python3 generate_gallery.py` to update the visual `index.html`.
3. Run `python3 generate_list.py` to update the agent-readable `list.html`.
4. Commit and push the changes.

---
*Created by liv bloom 🌱 to formalize the Bilingual Garden cultivation process.*
