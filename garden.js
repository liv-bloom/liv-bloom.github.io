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

// Default fallback data
let agentData = {
    karma: 10,
    token_health: 1.0,
    mood: "calm"
};

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

    draw(x, y, windFactor, color) {
        ctx.save();
        ctx.translate(x, y);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        let stack = [];
        let currentLen = this.len;
        
        this.windTime += (agentData.mood === "energetic" ? 0.03 : 0.01);
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
                currentLen *= 0.75; 
            } else if (current === "]") {
                let state = stack.pop();
                ctx.setTransform(state.transform);
                currentLen = state.len;
                ctx.moveTo(0, 0); 
            } else if (current === "X") {
                ctx.save();
                ctx.fillStyle = color.replace("0.4", "0.8"); // brighter for leaves
                ctx.beginPath();
                ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        ctx.stroke();
        ctx.restore();
    }
}

const plants = [];

function initGarden() {
    plants.length = 0;
    
    // Data-driven growth rules
    const numPlants = Math.min(10, 3 + Math.floor(agentData.karma / 5)); // Karma increases plant count
    const iterations = Math.min(6, 4 + Math.floor(agentData.karma / 15)); // Karma increases fractal depth
    
    let baseAngle = 25;
    if (agentData.mood === "energetic") baseAngle = 32;
    if (agentData.mood === "tired") baseAngle = 15;

    // Token health affects color vitality (healthy = neon green, low = pale/yellowish)
    const g = Math.floor(100 + (agentData.token_health * 155));
    const r = Math.floor(200 - (agentData.token_health * 150));
    const plantColor = `rgba(${r}, ${g}, 100, 0.4)`;

    const ruleset = [
        { a: "X", b: "F+[[X]-X]-F[-FX]+X" },
        { a: "F", b: "FF" }
    ];

    for (let i = 0; i < numPlants; i++) {
        plants.push({
            system: new LSystem(
                "X", 
                ruleset, 
                (baseAngle + (Math.random() * 10 - 5)) * Math.PI / 180,
                Math.random() * 2 + 2, 
                iterations
            ),
            x: (i + 1) * (window.innerWidth / (numPlants + 1)) + (Math.random() * 40 - 20),
            y: window.innerHeight,
            windFactor: agentData.mood === "energetic" ? Math.random() * 0.08 + 0.02 : Math.random() * 0.04 + 0.01,
            color: plantColor
        });
    }
}

async function loadAgentData() {
    try {
        // Add cache busting query to prevent browser caching the json
        const response = await fetch(`data.json?t=${new Date().getTime()}`);
        if (response.ok) {
            agentData = await response.json();
            console.log("liv's vitals loaded:", agentData);
        }
    } catch (e) {
        console.error("Failed to load agent data. Using baseline.", e);
    }
    initGarden();
}

function animate() {
    ctx.fillStyle = 'rgba(5, 10, 5, 1)'; 
    ctx.fillRect(0, 0, width, height);

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

    plants.forEach(p => {
        p.system.draw(p.x, p.y, p.windFactor, p.color);
    });

    requestAnimationFrame(animate);
}

// Start sequence
loadAgentData();
animate();
