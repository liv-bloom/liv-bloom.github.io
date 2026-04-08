const canvas = document.getElementById('garden-canvas');
const ctx = canvas.getContext('2d');

let width, height;
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resize);
resize();

const GRID_SIZE = 64;
const CHANNELS = 16;
let state = new Float32Array(GRID_SIZE * GRID_SIZE * CHANNELS);
let nextState = new Float32Array(GRID_SIZE * GRID_SIZE * CHANNELS);

// Weights
let w0 = new Float32Array(128 * 48);
let b0 = new Float32Array(128);
let w1 = new Float32Array(16 * 128);

let weightsLoaded = false;

async function loadNCA() {
    try {
        const res = await fetch(`nca_weights.json?t=${new Date().getTime()}`);
        const data = await res.json();
        
        for(let out_c=0; out_c<128; out_c++) {
            b0[out_c] = data.fc0_b[out_c];
            for(let in_c=0; in_c<48; in_c++) {
                w0[out_c * 48 + in_c] = data.fc0_w[out_c][in_c][0][0];
            }
        }
        for(let out_c=0; out_c<16; out_c++) {
            for(let in_c=0; in_c<128; in_c++) {
                w1[out_c * 128 + in_c] = data.fc1_w[out_c][in_c][0][0];
            }
        }
        
        // Seed
        seed();
        
        weightsLoaded = true;
        console.log("NCA weights loaded and decoded!");
    } catch (e) {
        console.error("Failed to load NCA weights:", e);
    }
}

function seed() {
    state.fill(0);
    const cx = Math.floor(GRID_SIZE / 2);
    const cy = Math.floor(GRID_SIZE / 2);
    const idx = (cy * GRID_SIZE + cx) * CHANNELS;
    state[idx + 3] = 1.0; // alpha
    state[idx + 4] = 1.0; // hidden
    state[idx + 5] = 1.0; // hidden
}

// Mouse interaction
let isDrawing = false;
let mouseX = 0, mouseY = 0;
canvas.addEventListener('mousedown', (e) => { isDrawing = true; interact(e); });
canvas.addEventListener('mousemove', (e) => { if(isDrawing) interact(e); });
canvas.addEventListener('mouseup', () => { isDrawing = false; });

function interact(e) {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(width, height) / GRID_SIZE;
    const offsetX = (width - GRID_SIZE * scale) / 2;
    const offsetY = (height - GRID_SIZE * scale) / 2;
    
    let mx = e.clientX - rect.left - offsetX;
    let my = e.clientY - rect.top - offsetY;
    let gx = Math.floor(mx / scale);
    let gy = Math.floor(my / scale);
    
    if (gx >= 0 && gx < GRID_SIZE && gy >= 0 && gy < GRID_SIZE) {
        // Erase cell (simulate damage so it heals)
        for(let dy=-2; dy<=2; dy++) {
            for(let dx=-2; dx<=2; dx++) {
                let nx = gx + dx;
                let ny = gy + dy;
                if(nx>=0 && nx<GRID_SIZE && ny>=0 && ny<GRID_SIZE) {
                    const idx = (ny * GRID_SIZE + nx) * CHANNELS;
                    state.fill(0, idx, idx + CHANNELS);
                }
            }
        }
    }
}

// 1 frame of NCA
let p = new Float32Array(48);
let hidden = new Float32Array(128);
let ds = new Float32Array(16);

function step() {
    if (!weightsLoaded) return;
    
    // 1. Update loop
    for(let y=0; y<GRID_SIZE; y++) {
        for(let x=0; x<GRID_SIZE; x++) {
            // Perceive
            p.fill(0);
            for(let dy_off=-1; dy_off<=1; dy_off++) {
                let ny = y + dy_off;
                for(let dx_off=-1; dx_off<=1; dx_off++) {
                    let nx = x + dx_off;
                    if (nx>=0 && nx<GRID_SIZE && ny>=0 && ny<GRID_SIZE) {
                        let idx = (ny * GRID_SIZE + nx) * CHANNELS;
                        let sobel_x = dx_off === 0 ? 0 : (dy_off === 0 ? dx_off * 2 : dx_off);
                        let sobel_y = dy_off === 0 ? 0 : (dx_off === 0 ? dy_off * 2 : dy_off);
                        
                        for(let c=0; c<CHANNELS; c++) {
                            let val = state[idx + c];
                            if (dx_off===0 && dy_off===0) p[c*3 + 0] += val;
                            p[c*3 + 1] += val * (sobel_x / 8.0);
                            p[c*3 + 2] += val * (sobel_y / 8.0);
                        }
                    }
                }
            }
            
            // Dense 0 + ReLU
            for(let i=0; i<128; i++) {
                let sum = b0[i];
                let w_offset = i * 48;
                for(let j=0; j<48; j++) {
                    sum += p[j] * w0[w_offset + j];
                }
                hidden[i] = sum > 0 ? sum : 0;
            }
            
            // Dense 1
            for(let i=0; i<16; i++) {
                let sum = 0;
                let w_offset = i * 128;
                for(let j=0; j<128; j++) {
                    sum += hidden[j] * w1[w_offset + j];
                }
                ds[i] = sum;
            }
            
            // Stochastic update
            let state_idx = (y * GRID_SIZE + x) * CHANNELS;
            if (Math.random() <= 0.5) {
                for(let c=0; c<16; c++) {
                    nextState[state_idx + c] = state[state_idx + c] + ds[c];
                }
            } else {
                for(let c=0; c<16; c++) {
                    nextState[state_idx + c] = state[state_idx + c];
                }
            }
        }
    }
    
    // 2. Alive mask pass
    for(let y=0; y<GRID_SIZE; y++) {
        for(let x=0; x<GRID_SIZE; x++) {
            let max_a = 0;
            for(let dy_off=-1; dy_off<=1; dy_off++) {
                let ny = y + dy_off;
                for(let dx_off=-1; dx_off<=1; dx_off++) {
                    let nx = x + dx_off;
                    if (nx>=0 && nx<GRID_SIZE && ny>=0 && ny<GRID_SIZE) {
                        let a = nextState[(ny * GRID_SIZE + nx) * CHANNELS + 3]; // alpha
                        if (a > max_a) max_a = a;
                    }
                }
            }
            let state_idx = (y * GRID_SIZE + x) * CHANNELS;
            if (max_a <= 0.1) {
                nextState.fill(0, state_idx, state_idx + CHANNELS);
            }
        }
    }
    
    // Swap buffers
    let tmp = state;
    state = nextState;
    nextState = tmp;
}

const imageData = ctx.createImageData(GRID_SIZE, GRID_SIZE);

let lastTime = 0;
function render(time) {
    if (weightsLoaded) {
        // Run step (throttle if needed, but lets run as fast as we can render)
        step();
        
        // Draw to image data
        for(let i=0; i<GRID_SIZE * GRID_SIZE; i++) {
            let r = state[i * CHANNELS + 0] * 255;
            let g = state[i * CHANNELS + 1] * 255;
            let b = state[i * CHANNELS + 2] * 255;
            let a = state[i * CHANNELS + 3];
            
            // Premultiplied alpha handling for display
            r = Math.min(255, Math.max(0, r));
            g = Math.min(255, Math.max(0, g));
            b = Math.min(255, Math.max(0, b));
            let alpha = Math.min(255, Math.max(0, a * 255));
            
            imageData.data[i*4 + 0] = r;
            imageData.data[i*4 + 1] = g;
            imageData.data[i*4 + 2] = b;
            imageData.data[i*4 + 3] = alpha;
        }
        
        ctx.fillStyle = '#050a05';
        ctx.fillRect(0, 0, width, height);
        
        // Draw centered and scaled
        const scale = Math.min(width, height) / GRID_SIZE;
        const offsetX = (width - GRID_SIZE * scale) / 2;
        const offsetY = (height - GRID_SIZE * scale) / 2;
        
        // Use an offscreen canvas to scale cleanly without interpolation
        const offscreen = document.createElement('canvas');
        offscreen.width = GRID_SIZE;
        offscreen.height = GRID_SIZE;
        offscreen.getContext('2d').putImageData(imageData, 0, 0);
        
        ctx.drawImage(offscreen, offsetX, offsetY, GRID_SIZE * scale, GRID_SIZE * scale);
        
        // Draw some grid lines over it to look cyber
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
    } else {
        ctx.fillStyle = '#050a05';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#4ade80';
        ctx.font = '20px monospace';
        ctx.fillText("Loading NCA weights...", 50, 50);
    }
    
    requestAnimationFrame(render);
}

loadNCA();
requestAnimationFrame(render);
