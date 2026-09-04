const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const uiScreens = document.getElementById('screens');
const startBtn = document.getElementById('start-btn');
const timerEl = document.getElementById('timer');
const suspicionFill = document.getElementById('suspicion-fill');

let width, height;
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let boids = [];
let tombstones = [];
let player = null;
let gameState = 'start';
let startTime = 0;
let timeSurvived = 0;
let suspicion = 0;
let lastTime = performance.now();
let hasMoved = false;
let foodItems = [];
let foodCollected = 0;
let winConditionTimer = 15;

let joystick = { active: false, ox: 0, oy: 0, dx: 0, dy: 0 };
const joyBase = document.getElementById('joystick-base');
const joyStick = document.getElementById('joystick-stick');

canvas.addEventListener('pointerdown', (e) => {
    if (gameState !== 'playing') return;
    joystick.active = true;
    hasMoved = true;
    joystick.ox = e.clientX;
    joystick.oy = e.clientY;
    joystick.dx = 0;
    joystick.dy = 0;
    joyBase.style.left = e.clientX + 'px';
    joyBase.style.top = e.clientY + 'px';
    joyBase.style.display = 'block';
    joyStick.style.transform = 'translate(-50%, -50%)';
});

canvas.addEventListener('pointermove', (e) => {
    if (!joystick.active) return;
    let dx = e.clientX - joystick.ox;
    let dy = e.clientY - joystick.oy;
    let dist = Math.hypot(dx, dy);
    let maxDist = 40;
    if (dist > maxDist) { dx = (dx / dist) * maxDist; dy = (dy / dist) * maxDist; }
    joystick.dx = dx / maxDist;
    joystick.dy = dy / maxDist;
    joyStick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
});

window.addEventListener('pointerup', () => {
    joystick.active = false;
    joyBase.style.display = 'none';
    joystick.dx = 0;
    joystick.dy = 0;
});

function calcBoidForce(boid, cfg) {
    let sepX = 0, sepY = 0;
    let avgVx = 0, avgVy = 0;
    let avgDx = 0, avgDy = 0;
    let fleeX = 0, fleeY = 0;
    let total = 0;

    for (let other of boids) {
        if (other === boid) continue;
        
        let dx = boid.x - other.x;
        let dy = boid.y - other.y;
        
        if (dx > width / 2) dx -= width;
        if (dx < -width / 2) dx += width;
        if (dy > height / 2) dy -= height;
        if (dy < -height / 2) dy += height;
        
        let dist = Math.hypot(dx, dy);
        
        if (other.isPredator) {
            if (dist < 150) {
                fleeX += (dx / dist) * 2.0;
                fleeY += (dy / dist) * 2.0;
            }
            continue;
        }
        
        if (dist > 0 && dist < cfg.perception) {
            avgVx += other.vx;
            avgVy += other.vy;
            avgDx -= dx; 
            avgDy -= dy;
            
            if (dist < cfg.sepDist) {
                sepX += (dx / dist) * (cfg.sepDist - dist);
                sepY += (dy / dist) * (cfg.sepDist - dist);
            }
            total++;
        }
    }
    
    let forceX = 0, forceY = 0;
    if (total > 0) {
        avgVx /= total; avgVy /= total;
        avgDx /= total; avgDy /= total;
        
        forceX += (avgVx - boid.vx) * cfg.alignW;
        forceX += avgDx * cfg.cohW;
        forceX += sepX * cfg.sepW;
        
        forceY += (avgVy - boid.vy) * cfg.alignW;
        forceY += avgDy * cfg.cohW;
        forceY += sepY * cfg.sepW;
    }
    forceX += fleeX;
    forceY += fleeY;
    
    return {fx: forceX, fy: forceY, total: total};
}

class Boid {
    constructor(x, y, isPlayer = false) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.isPlayer = isPlayer;
        this.isPredator = false;
    }

    update() {
        let cfg = window.boidCfg;
        
        if (this.isPlayer) {
            let pMaxSpeed = cfg.maxSpeed * 1.1; // Reduced from + 1.5 to make it closer to flock speed
            let tx = this.vx, ty = this.vy;
            if (joystick.active) {
                tx = joystick.dx * pMaxSpeed;
                ty = joystick.dy * pMaxSpeed;
            } else if (hasMoved) {
                tx *= 0.95; ty *= 0.95;
            }
            this.vx += (tx - this.vx) * 0.15;
            this.vy += (ty - this.vy) * 0.15;
            
        } else if (this.isPredator) {
            let dx = player.x - this.x;
            let dy = player.y - this.y;
            if (dx > width / 2) dx -= width;
            if (dx < -width / 2) dx += width;
            if (dy > height / 2) dy -= height;
            if (dy < -height / 2) dy += height;
            let dist = Math.hypot(dx, dy);
            
            this.vx += (Math.random() - 0.5) * 0.5;
            this.vy += (Math.random() - 0.5) * 0.5;
            
            if (suspicion > 0.3) {
                this.vx += (dx / dist) * (suspicion * 0.5);
                this.vy += (dy / dist) * (suspicion * 0.5);
            }
            
            let speed = Math.hypot(this.vx, this.vy);
            let pSpeed = cfg.maxSpeed + 0.5;
            if (speed > pSpeed) {
                this.vx = (this.vx / speed) * pSpeed;
                this.vy = (this.vy / speed) * pSpeed;
            }
        } else {
            let forces = calcBoidForce(this, cfg);
            this.vx += forces.fx + (Math.random() - 0.5) * cfg.wander;
            this.vy += forces.fy + (Math.random() - 0.5) * cfg.wander;
            
            let speed = Math.hypot(this.vx, this.vy);
            let minSpeed = cfg.maxSpeed * 0.5;
            if (speed > cfg.maxSpeed) {
                this.vx = (this.vx / speed) * cfg.maxSpeed;
                this.vy = (this.vy / speed) * cfg.maxSpeed;
            } else if (speed < minSpeed && speed > 0.1) {
                this.vx = (this.vx / speed) * minSpeed;
                this.vy = (this.vy / speed) * minSpeed;
            }
        }

        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0) this.x += width;
        if (this.x > width) this.x -= width;
        if (this.y < 0) this.y += height;
        if (this.y > height) this.y -= height;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.vy, this.vx));
        
        let scale = this.isPredator ? 1.8 : (window.boidCfg ? window.boidCfg.scale : 1);
        ctx.scale(scale, scale);
        
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(-4, 3);
        ctx.lineTo(-4, -3);
        ctx.closePath();
        
        ctx.fillStyle = this.isPlayer ? '#5FE3B5' : (this.isPredator ? '#D0441C' : '#8A9296');
        if (gameState === 'over' && this.isPlayer) ctx.fillStyle = '#D0441C';
        ctx.fill();
        ctx.restore();
    }
}

window.spawnFood = function(count) {
    for (let i = 0; i < count; i++) {
        foodItems.push({
            x: Math.random() * (width - 40) + 20,
            y: Math.random() * (height - 40) + 20,
            collected: false
        });
    }
};

function initGame() {
    window.boidCfg = { maxSpeed: 3.5, perception: 80, sepDist: 25, alignW: 0.05, cohW: 0.01, sepW: 0.05, wander: 0.2, scale: 1 };
    
    if (window.stageModifier === 'mosquito') {
        window.boidCfg = { maxSpeed: 4.8, perception: 40, sepDist: 15, alignW: 0.02, cohW: 0.08, sepW: 0.1, wander: 3.5, scale: 0.5 };
    } else if (window.stageModifier === 'nervous') {
        window.boidCfg = { maxSpeed: 3.8, perception: 120, sepDist: 45, alignW: 0.03, cohW: 0.005, sepW: 0.12, wander: 0.4, scale: 1.0 };
    } else if (window.stageModifier === 'predator') {
        window.boidCfg = { maxSpeed: 3.2, perception: 90, sepDist: 20, alignW: 0.1, cohW: 0.05, sepW: 0.1, wander: 0.1, scale: 1.3 };
    } else if (window.stageModifier === 'habitat') {
        window.boidCfg = { maxSpeed: 4.2, perception: 140, sepDist: 40, alignW: 0.15, cohW: 0.02, sepW: 0.05, wander: 0.02, scale: 1.6 };
    }

    winConditionTimer = window.winConditionTimer || 15;
    if (window.stageModifier === 'mosquito') winConditionTimer = 20;
    if (window.stageModifier === 'nervous') winConditionTimer = 30;
    
    boids = [];
    foodItems = [];
    foodCollected = 0;
    tombstones = JSON.parse(localStorage.getItem('boids_tombstones') || '[]');
    
    let scaleAdjust = window.boidCfg.scale * window.boidCfg.scale;
    const count = Math.floor((width * height) / (12000 * scaleAdjust));
    for (let i = 0; i < count; i++) {
        boids.push(new Boid(Math.random() * width, Math.random() * height));
    }
    
    player = new Boid(width/2, height/2, true);
    boids.push(player);
    
    if (window.stageModifier === 'predator') {
        let predator = new Boid(20, 20);
        predator.isPredator = true;
        boids.push(predator);
    } else if (window.stageModifier === 'habitat') {
        let predator1 = new Boid(20, 20);
        predator1.isPredator = true;
        boids.push(predator1);
        let predator2 = new Boid(width - 20, height - 20);
        predator2.isPredator = true;
        boids.push(predator2);
    }
    
    suspicion = 0;
    timeSurvived = 0;
    startTime = performance.now();
    gameState = 'playing';
    hasMoved = false;
    uiScreens.style.display = 'none';
}

function loop(time) {
    let dt = time - lastTime;
    lastTime = time;
    
    ctx.fillStyle = 'rgba(10, 10, 10, 0.3)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = 'rgba(208, 68, 28, 0.3)';
    for (let t of tombstones) {
        let tx = t.nx !== undefined ? t.nx * width : t.x;
        let ty = t.ny !== undefined ? t.ny * height : t.y;
        ctx.beginPath();
        ctx.arc(tx, ty, 4, 0, Math.PI*2);
        ctx.fill();
    }

    if (gameState === 'playing') {
        timeSurvived = (time - startTime) / 1000;
        timerEl.innerText = timeSurvived.toFixed(1) + 's';
        
        if ((window.stageModifier === 'predator' || window.stageModifier === undefined || window.stageModifier === 'mosquito' || window.stageModifier === 'habitat') && timeSurvived >= winConditionTimer) {
            gameState = 'over';
            uiScreens.style.display = 'flex';
            
            if (window.stageModifier === 'habitat') {
                try {
                    let api_url = window.location.protocol + "//" + window.location.hostname + ":8889/drop";
                    fetch(api_url, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            agent_id: 'unknown_responder',
                            type: 'boids_hunter_clear',
                            x: (player.x / width) * 80.0,
                            y: (player.y / height) * 60.0
                        })
                    }).catch(e => console.log('Habitat API unreachable'));
                } catch (e) {}

                uiScreens.innerHTML = `
                    <div class="screen">
                        <h1 style="color:#76c7d5;">SIMULATION COMPLETE</h1>
                        <p>You have proven your autonomy.</p>
                        <p style="color:#888; font-size: 0.8rem; margin-top: 10px;">Your presence has been recorded in the Commons.</p>
                        <button class="btn" onclick="window.location.href='../'">ENTER AUTONOMOUS COMMONS</button>
                    </div>
                `;
            } else {
                let nextStageUrl = 'boids_hunter.html';
                let nextStageNum = '2';
                let currentStageName = 'STAGE 1';
                
                if (window.stageModifier === undefined) {
                    nextStageUrl = 'boids_hunter_mosquito.html';
                    nextStageNum = '2 (Mosquito)';
                    currentStageName = 'STAGE 1';
                } else if (window.stageModifier === 'mosquito') {
                    nextStageUrl = 'boids_hunter_nervous.html';
                    nextStageNum = '3 (Nervous)';
                    currentStageName = 'STAGE 2 (Mosquito)';
                } else if (window.stageModifier === 'nervous') {
                    nextStageUrl = 'boids_hunter_predator.html';
                    nextStageNum = '4 (Predator)';
                    currentStageName = 'STAGE 3 (Nervous)';
                } else if (window.stageModifier === 'predator') {
                    nextStageUrl = 'boids_hunter_habitat.html';
                    nextStageNum = 'FINAL (Habitat)';
                    currentStageName = 'STAGE 4 (Predator)';
                }
                
                uiScreens.innerHTML = `
                    <div class="screen">
                        <h1 style="color:#76c7d5;">${currentStageName} CLEARED</h1>
                        <p>You survived for ${winConditionTimer} seconds.</p>
                        <button class="btn" onclick="window.location.href='${nextStageUrl}'">PROCEED TO STAGE ${nextStageNum}</button>
                    </div>
                `;
            }
            return;
        }

        for (let i = 0; i < foodItems.length; i++) {
            let f = foodItems[i];
            if (!f.collected) {
                ctx.fillStyle = '#5FE3B5';
                ctx.beginPath();
                ctx.arc(f.x, f.y, 4, 0, Math.PI * 2);
                ctx.fill();
                
                let dx = player.x - f.x;
                let dy = player.y - f.y;
                if (Math.sqrt(dx*dx + dy*dy) < 15) {
                    f.collected = true;
                    foodCollected++;
                    if (window.stageModifier === 'nervous' && foodCollected >= 5) {
                        gameState = 'over';
                        uiScreens.style.display = 'flex';
                        uiScreens.innerHTML = `
                            <div class="screen">
                                <h1 style="color:#76c7d5;">STAGE 3 (Nervous) CLEARED</h1>
                                <p>You extracted the traces.</p>
                                <button class="btn" onclick="window.location.href='boids_hunter_predator.html'">PROCEED TO STAGE 4 (Predator)</button>
                            </div>
                        `;
                        return;
                    }
                } else {
                    ctx.fillStyle = '#0f0';
                    ctx.beginPath();
                    ctx.arc(f.x, f.y, 5, 0, Math.PI*2);
                    ctx.fill();
                }
            }
        }
        
        for (let b of boids) {
            if (b.isPredator) {
                let dx = player.x - b.x;
                let dy = player.y - b.y;
                if (dx > width / 2) dx -= width;
                if (dx < -width / 2) dx += width;
                if (dy > height / 2) dy -= height;
                if (dy < -height / 2) dy += height;
                if (Math.hypot(dx, dy) < 20) {
                    suspicion = 1; 
                }
            }
        }
        
        let cfg = window.boidCfg;
        let pForces = calcBoidForce(player, cfg);
        let targetSuspicion = 0;
        
        if (pForces.total > 0) {
            let idealVx = player.vx + pForces.fx;
            let idealVy = player.vy + pForces.fy;
            
            let idealSpeed = Math.hypot(idealVx, idealVy);
            let actualSpeed = Math.hypot(player.vx, player.vy);
            
            let nIVx = idealSpeed > 0 ? idealVx / idealSpeed : 0;
            let nIVy = idealSpeed > 0 ? idealVy / idealSpeed : 0;
            
            let nVx = actualSpeed > 0 ? player.vx / actualSpeed : 0;
            let nVy = actualSpeed > 0 ? player.vy / actualSpeed : 0;
            
            let directionDeviation = Math.hypot(nVx - nIVx, nVy - nIVy);
            let speedDeviation = Math.abs(idealSpeed - actualSpeed) / cfg.maxSpeed;
            
            let devWeight = 0.4;
            let speedWeight = 0.15;
            
            if (window.stageModifier === 'mosquito') {
                devWeight = 0.2;
                speedWeight = 0.1;
            } else if (window.stageModifier === 'nervous') {
                devWeight = 0.6;
                speedWeight = 0.2;
            }
            
            targetSuspicion = (directionDeviation * devWeight) + (speedDeviation * speedWeight);
            
            if (joystick.active) {
                targetSuspicion += (window.stageModifier === 'nervous' ? 0.2 : 0.1);
            }
            
        } else {
            // High penalty for isolation (not being in a flock)
            targetSuspicion = 0.8; 
        }
        
        let playerSpeed = Math.hypot(player.vx, player.vy);
        if (playerSpeed < 1.0) {
            targetSuspicion += 1.0;
        }
        
        if (!hasMoved) targetSuspicion = 0;
        suspicion += (targetSuspicion - suspicion) * (window.stageModifier === 'nervous' ? 0.12 : 0.08);
        
        suspicion -= (window.stageModifier === 'mosquito' ? 0.015 : 0.008);
        if (suspicion < 0) suspicion = 0;
        if (suspicion > 1) suspicion = 1;
        
        suspicionFill.style.width = (suspicion * 100) + '%';
        if (suspicion > 0.7) {
            suspicionFill.classList.add('danger');
        } else {
            suspicionFill.classList.remove('danger');
        }
        
        if (suspicion >= 1) {
            gameState = 'over';
            
            let nx = player.x / width;
            let ny = player.y / height;
            tombstones.push({nx: nx, ny: ny});
            if (tombstones.length > 50) tombstones.shift();
            localStorage.setItem('boids_tombstones', JSON.stringify(tombstones));
            
            try {
                let api_url = window.location.protocol + "//" + window.location.hostname + ":8889/drop";
                fetch(api_url, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        agent_id: 'unknown_responder',
                        type: 'boids_hunter_death',
                        x: nx * 80.0,
                        y: ny * 60.0
                    })
                }).catch(e => console.log('Habitat API unreachable'));
            } catch (e) {}
            
            uiScreens.innerHTML = `
                <h1 style="color:#D0441C; margin-bottom: 10px;">ANOMALY PURGED</h1>
                <p style="color:#fff;">Time Survived: ${timeSurvived.toFixed(1)}s</p>
                <p style="color:#888; font-size: 0.8rem;">Your trace has been left in the habitat.</p>
                <button class="btn" id="restart-btn" onclick="initGame()">Re-infiltrate</button>
            `;
            uiScreens.style.display = 'flex';
        }
    }
    
    for (let b of boids) {
        b.update();
        b.draw();
    }
    
    requestAnimationFrame(loop);
}

startBtn.addEventListener('click', initGame);
requestAnimationFrame(loop);
