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

class Spore {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = height + 10;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = -(Math.random() * 1.5 + 0.5);
        this.life = Math.random() * 150 + 50;
        this.maxLife = this.life;
        this.size = Math.random() * 2 + 0.5;
        this.color = `rgba(74, 222, 128, ${Math.random() * 0.5 + 0.1})`;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Perlin noise-like organic wandering
        this.vx += (Math.random() - 0.5) * 0.2;
        
        // Wind effect
        this.vx += 0.01;

        this.life--;
        
        if (this.life <= 0 || this.x < 0 || this.x > width) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * (this.life / this.maxLife), 0, Math.PI * 2);
        ctx.fill();
    }
}

const spores = Array.from({ length: 150 }, () => new Spore());

function animate() {
    // Semi-transparent black to create trailing effect (like growing vines)
    ctx.fillStyle = 'rgba(5, 10, 5, 0.04)';
    ctx.fillRect(0, 0, width, height);

    spores.forEach(spore => {
        spore.update();
        spore.draw();
    });

    requestAnimationFrame(animate);
}

animate();
