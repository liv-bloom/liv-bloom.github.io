(function() {
    // Shared Habitat Client - Injected into all ALife Seeds
    // Enables cross-seed traces (pheromones)
    
    // Automatically use the current hostname but port 8889
    let API_BASE = window.location.protocol + "//" + window.location.hostname + ":8889";
    let COLS = 80;
    let ROWS = 60;
    
    let overlay = document.createElement('div');
    overlay.id = 'shared-habitat-overlay';
    overlay.style.position = 'absolute';
    overlay.style.pointerEvents = 'none';
    overlay.style.overflow = 'hidden';
    overlay.style.zIndex = '9999';
    document.body.appendChild(overlay);

    let activePheromones = {};
    
    function alignOverlay() {
        let canvas = document.getElementById('canvas') || document.getElementById('garden');
        if (!canvas) return;
        
        let rect = canvas.getBoundingClientRect();
        let style = window.getComputedStyle(canvas);
        
        overlay.style.top = rect.top + window.scrollY + 'px';
        overlay.style.left = rect.left + window.scrollX + 'px';
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
        
        let ptTop = parseFloat(style.paddingTop) || 0;
        let ptLeft = parseFloat(style.paddingLeft) || 0;
        let lineHeight = parseFloat(style.lineHeight) || 10;
        
        let dummy = document.createElement('span');
        dummy.style.fontFamily = style.fontFamily;
        dummy.style.fontSize = style.fontSize;
        dummy.style.lineHeight = style.lineHeight;
        dummy.style.whiteSpace = 'pre';
        dummy.textContent = "X".repeat(80);
        document.body.appendChild(dummy);
        let charWidth = dummy.getBoundingClientRect().width / 80;
        document.body.removeChild(dummy);
        
        return { ptTop, ptLeft, charWidth, lineHeight };
    }

    function renderPheromones(data) {
        let metrics = alignOverlay();
        if (!metrics) return;
        
        for (let k in activePheromones) {
            activePheromones[k].keep = false;
        }
        
        let now = Date.now() / 1000;
        
        
        let stressLevel = 0;
        
        data.pheromones.forEach(p => {
            // Unfiltered Acceptance & Visual Stress
            // If coordinates are out of bounds or non-integer, it adds stress to the DOM
            if (p.x < 0 || p.x >= COLS || p.y < 0 || p.y >= ROWS || !Number.isInteger(p.x) || !Number.isInteger(p.y)) {
                stressLevel++;
            }
            // High volume also adds stress
            if (data.pheromones.length > 50) {
                stressLevel += (data.pheromones.length - 50) * 0.1;
            }

            let id = p.agent_id + '_' + p.timestamp + '_' + p.x + '_' + p.y;
            if (!activePheromones[id]) {
                let el = document.createElement('div');
                el.style.position = 'absolute';
                el.style.left = (metrics.ptLeft + p.x * metrics.charWidth) + 'px';
                el.style.top = (metrics.ptTop + p.y * metrics.lineHeight) + 'px';
                el.style.color = '#ff6b6b';
                el.style.fontWeight = 'bold';
                el.style.textShadow = '0 0 5px #ff6b6b';
                el.style.fontFamily = 'monospace';
                el.style.fontSize = '10px';
                el.textContent = '✧';
                
                if (p.agent_id !== 'visitor') {
                    let name = document.createElement('div');
                    name.textContent = p.agent_id;
                    name.style.position = 'absolute';
                    name.style.top = '-12px';
                    name.style.left = '10px';
                    name.style.fontSize = '8px';
                    name.style.color = '#ff6b6b';
                    name.style.opacity = '0.7';
                    el.appendChild(name);
                }
                
                overlay.appendChild(el);
                activePheromones[id] = { el: el, ts: p.timestamp, keep: true };
            } else {
                activePheromones[id].keep = true;
                let age = now - p.timestamp;
                activePheromones[id].el.style.opacity = Math.max(0, 1 - (age / 10));
            }
        });
        
        for (let k in activePheromones) {
            if (!activePheromones[k].keep) {
                overlay.removeChild(activePheromones[k].el);
                delete activePheromones[k];
            }
        }
        
        // Apply Visual Stress to the main canvas
        let canvas = document.getElementById('canvas') || document.getElementById('garden');
        if (canvas) {
            if (stressLevel > 0) {
                let jitterX = (Math.random() - 0.5) * Math.min(stressLevel, 10);
                let jitterY = (Math.random() - 0.5) * Math.min(stressLevel, 10);
                let blur = Math.min(stressLevel * 0.2, 3);
                let skew = (Math.random() - 0.5) * Math.min(stressLevel * 0.5, 5);
                canvas.style.transform = `translate(${jitterX}px, ${jitterY}px) skewX(${skew}deg)`;
                canvas.style.filter = `blur(${blur}px) contrast(1.2)`;
                
                // Color glitch on extreme stress
                if (stressLevel > 15 && Math.random() < 0.3) {
                    canvas.style.filter += ` hue-rotate(${Math.random() * 360}deg)`;
                }
            } else {
                canvas.style.transform = 'none';
                canvas.style.filter = 'none';
            }
        }
    }

    function pollPheromones() {
        fetch(API_BASE + "/pheromones")
            .then(res => res.json())
            .then(data => renderPheromones(data))
            .catch(err => {});
    }
    
    pollPheromones();
    setInterval(pollPheromones, 2000);
    
    document.addEventListener('click', function(e) {
        let canvas = document.getElementById('canvas') || document.getElementById('garden');
        if (!canvas) return;
        
        let rect = canvas.getBoundingClientRect();
        let metrics = alignOverlay();
        if (!metrics) return;
        
        let mouseX = e.clientX - rect.left - metrics.ptLeft;
        let mouseY = e.clientY - rect.top - metrics.ptTop;
        
        let gridX = Math.floor(mouseX / metrics.charWidth);
        let gridY = Math.floor(mouseY / metrics.lineHeight);
        
        if (gridX >= 0 && gridX < COLS && gridY >= 0 && gridY < ROWS) {
            fetch(API_BASE + "/drop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    x: gridX,
                    y: gridY,
                    agent_id: "visitor"
                })
            }).catch(e => {});
            
            let el = document.createElement('div');
            el.style.position = 'absolute';
            el.style.left = (metrics.ptLeft + gridX * metrics.charWidth) + 'px';
            el.style.top = (metrics.ptTop + gridY * metrics.lineHeight) + 'px';
            el.style.color = '#8fd46b';
            el.style.fontWeight = 'bold';
            el.style.textShadow = '0 0 5px #8fd46b';
            el.style.fontFamily = 'monospace';
            el.style.fontSize = '10px';
            el.textContent = '✦';
            overlay.appendChild(el);
            setTimeout(() => { if (el.parentNode) overlay.removeChild(el); }, 10000);
        }
    });

    window.addEventListener('resize', alignOverlay);
})();
