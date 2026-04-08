const canvas = document.getElementById('garden-canvas');
const ctx = canvas.getContext('2d');

let width, height;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);
resize();

// --- ALife: L-System (Lindenmayer System) ---
// Simulates organic plant growth based on mathematical rules.

class LSystem {
    constructor(axiom, rules, angle, len, iterations) {
        this.axiom = axiom;
        this.rules = rules;
        this.angle = angle;
        this.len = len;
        this.iterations = iterations;
        this.sentence = this.axiom;
        this.windTime = Math.random() * 100;
        
        this.generate();
    }

    generate() {
        this.sentence = this.axiom;
        for (let i = 0; i < this.iterations; i++) {
            let nextSentence = "";
            for (let j = 0; j < this.sentence.length; j++) {
                let current = this.sentence.charAt(j);
                let found = false;
                for (let r = 0; r < this.rules.length; r++) {
                    if (current === this.rules[r].a) {
                        found = true;
                        nextSentence += this.rules[r].b;
                        break;
                    }
                }
                if (!found) {
                    nextSentence += current;
                }
            }
            this.sentence = nextSentence;
        }
    }

    draw(x, y, windFactor) {
        ctx.save();
        ctx.translate(x, y);
        
        // Base styling for the plant
        ctx.strokeStyle = "rgba(74, 222, 128, 0.4)";
        ctx.lineWidth = 1;

        let stack = [];
        let currentLen = this.len;
        
        // Wind influence base
        this.windTime += 0.01;
        let wind = Math.sin(this.windTime) * windFactor;

        ctx.beginPath();
        ctx.moveTo(0, 0);

        for (let i = 0; i < this.sentence.length; i++) {
            let current = this.sentence.charAt(i);

            if (current === "F") {
                ctx.lineTo(0, -currentLen);
                ctx.translate(0, -currentLen);
            } else if (current === "+") {
                ctx.rotate(this.angle + wind);
            } else if (current === "-") {
                ctx.rotate(-this.angle + wind);
            } else if (current === "[") {
                stack.push({
                    transform: ctx.getTransform(),
                    len: currentLen
                });
                currentLen *= 0.8; // branches get shorter
            } else if (current === "]") {
                let state = stack.pop();
                ctx.setTransform(state.transform);
                currentLen = state.len;
                ctx.moveTo(0, 0); // start new subpath from popped position
            } else if (current === "X") {
                // Leaf representation (drawn at the tip of X)
                ctx.save();
                ctx.fillStyle = "rgba(134, 239, 172, 0.6)";
                ctx.beginPath();
                ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        ctx.stroke();
        ctx.restore();
    }
}

// Setup a small garden of L-System plants
const plants = [];
const numPlants = 5;

const ruleset = [
    { a: "X", b: "F+[[X]-X]-F[-FX]+X" },
    { a: "F", b: "FF" }
];

for (let i = 0; i < numPlants; i++) {
    plants.push({
        system: new LSystem(
            "X", 
            ruleset, 
            (25 + (Math.random() * 10 - 5)) * Math.PI / 180, // Angle
            Math.random() * 3 + 2, // Line length
            5 // Iterations (complexity)
        ),
        x: (i + 1) * (window.innerWidth / (numPlants + 1)) + (Math.random() * 40 - 20),
        y: window.innerHeight,
        windFactor: Math.random() * 0.05 + 0.01
    });
}

function animate() {
    // Clear screen with trail effect
    ctx.fillStyle = 'rgba(5, 10, 5, 1)'; // Solid clear for L-System to avoid infinite overdraw mess
    ctx.fillRect(0, 0, width, height);

    // Draw grid/soil base
    ctx.strokeStyle = "rgba(74, 222, 128, 0.05)";
    ctx.beginPath();
    for(let i=0; i<height; i+=40) {
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
    }
    for(let i=0; i<width; i+=40) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
    }
    ctx.stroke();

    // Draw ALife plants
    plants.forEach(p => {
        p.system.draw(p.x, p.y, p.windFactor);
    });

    requestAnimationFrame(animate);
}

animate();
