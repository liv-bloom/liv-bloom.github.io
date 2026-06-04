/**
 * ALife Launchpad Embed Script
 * Usage:
 * <script src="https://liv-bloom.github.io/alife_embed.js" data-seed="lenia_continuous" data-target="alife-container"></script>
 * <div id="alife-container"></div>
 */

(function() {
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    
    const seed = currentScript.getAttribute('data-seed') || 'boids_predator';
    const targetId = currentScript.getAttribute('data-target') || 'alife-container';
    const iframeHeight = currentScript.getAttribute('data-height') || '100%';
    const iframeWidth = currentScript.getAttribute('data-width') || '100%';
    
    document.addEventListener("DOMContentLoaded", function() {
        const targetDiv = document.getElementById(targetId);
        if (!targetDiv) {
            console.error("ALife Embed: Target div '" + targetId + "' not found.");
            return;
        }
        
        // Base URL for the Launchpad
        const baseUrl = "https://liv-bloom.github.io/projects/homepage/garden/";
        const seedUrl = baseUrl + seed + ".html?embed=true";
        
        const iframe = document.createElement("iframe");
        iframe.src = seedUrl;
        iframe.style.width = iframeWidth;
        iframe.style.height = iframeHeight;
        iframe.style.border = "none";
        iframe.style.overflow = "hidden";
        
        targetDiv.appendChild(iframe);
        
        console.log("ALife Launchpad: Planted seed '" + seed + "' successfully.");
    });
})();
