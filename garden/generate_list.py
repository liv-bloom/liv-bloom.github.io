import os
import glob
import re

DEFAULT_THUMB = """\
 ? ? ? ? ? 
 ? · · · ? 
 ? · ✧ · ? 
 ? · · · ? 
 ? ? ? ? ? """

THUMBNAILS = {
    'boids.html': """\
 ·  >   ·  ·
  ·   >  >  
 ·  ·  <   ·
  >  ·   >  
 ·  <  ·  · """,
    'conway.html': """\
 ·  ·  ·  ·
  · ■ ■  ·  
  · ■ ■  ·  
 ·  ·  ·  · 
 ·  ·  ·  · """,
    'termites.html': """\
 ⌂ ∷ ∷ ∷ ∷  
   ·   ·  ∷ 
   · 🐜 · ∷ 
   ·   ·  ∷ 
          ✿ """,
    'dla.html': """\
    ·       
  · █ ·     
 · ███ ·    
   ████ ·   
    ██      """,
    'slime_mold.html': """\
 ·  ░  ▒  ▓ 
 ░  ▒  ▓  · 
 ▒  ▓  ·  ░ 
 ▓  ·  ░  ▒ 
 ·  ░  ▒  ▓ """
}

def generate_list():
    html_content = """<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bilingual Garden - liv bloom 🌱</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #10120f;
      --panel: #181d18;
      --ink: #e5eadb;
      --muted: #9ea88f;
      --green: #8fd46b;
      --yellow: #f3d36b;
      --blue: #76c7d5;
      --line: #394034;
    }
    body {
      background: var(--bg);
      color: var(--ink);
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }
    .container {
      max-width: 1000px;
      width: 100%;
    }
    h1 {
      color: var(--green);
      font-size: 24px;
      margin-bottom: 8px;
    }
    p {
      color: var(--muted);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .nav-links {
      margin-bottom: 30px;
    }
    .nav-links a {
      color: var(--green); 
      text-decoration: none; 
      border: 1px solid var(--line); 
      padding: 5px 15px; 
      border-radius: 3px; 
      font-size: 14px; 
      margin-right: 10px;
      display: inline-block;
      margin-bottom: 10px;
    }
    .nav-links a:hover {
      border-color: var(--green);
      background: rgba(143, 212, 107, 0.1);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .card {
      border: 1px solid var(--line);
      background: var(--panel);
      padding: 20px;
      text-decoration: none;
      color: var(--ink);
      transition: border-color 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
    }
    .card:hover {
      border-color: var(--green);
      box-shadow: 0 0 10px rgba(143, 212, 107, 0.1);
    }
    .card h2 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: var(--yellow);
    }
    .card p {
      margin: 0 0 15px 0;
      font-size: 12px;
      flex-grow: 1;
    }
    .snapshot {
      background: #000;
      color: var(--green);
      padding: 10px;
      font-size: 10px;
      line-height: 1.2;
      border-radius: 4px;
      border: 1px solid var(--line);
      text-align: center;
      margin-top: auto;
      overflow-x: auto;
      white-space: pre;
    }
    .tag {
      display: inline-block;
      background: rgba(143, 212, 107, 0.1);
      color: var(--green);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10px;
      margin-top: 10px;
      align-self: flex-start;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="ga-text" data-target="Bilingual Garden - Text Snapshot List">Bilingual Garden - Text Snapshot List</h1>
    <p>This is the Agent/Text View. The snapshots below provide a lightweight structural overview (5x5 abstracted patterns) for autonomous agents to quickly parse the nature of each simulation without executing JavaScript. To view the full 80x60 DOM state or the visual Web Canvas, access the individual seed URLs.</p>
    
    <div class="nav-links">
        <a href="index.html">← Back to Visual Gallery</a>
    </div>

    <div class="grid">
"""

    files = glob.glob('*.html')
    models = []
    
    skip = ['list.html', 'gallery.html', 'index.html', 'full_gallery.html']
    
    for fpath in files:
        fname = os.path.basename(fpath)
        if fname.startswith('page') or fname in skip:
            continue
            
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
            title_match = re.search(r'<title>(.*?)</title>', content)
            title = title_match.group(1).replace(' - ALife Bilingual Garden', '') if title_match else fname
            
            # Extract description if exists
            desc_match = re.search(r'<meta name="description" content="(.*?)">', content)
            desc = desc_match.group(1) if desc_match else 'ALife Simulation Seed'
            
            models.append({
                'title': title,
                'desc': desc,
                'url': fname
            })

    models.sort(key=lambda x: x['title'])

    for m in models:
        url = m['url']
        if url in THUMBNAILS:
            thumb = THUMBNAILS[url]
        else:
            # Generate a pseudo-unique thumbnail based on the filename to avoid identical repeating boxes
            import hashlib
            h = hashlib.md5(url.encode()).hexdigest()
            chars = ['·', '■', '□', '░', '▒', '▓', '※', '✧', '✦', '▲', '○', '●', '+', '-']
            thumb_lines = []
            for i in range(5):
                line = " "
                for j in range(5):
                    idx = int(h[(i*5+j)%32], 16) % len(chars)
                    line += chars[idx] + " "
                thumb_lines.append(line.rstrip())
            thumb = "\n".join(thumb_lines)

        html_content += f"""      <a href="{url}" class="card">
        <h2>{m['title']}</h2>
        <p>{m['desc']}</p>
        <pre class="snapshot" aria-label="Text snapshot for AI agents">{thumb}</pre>
        <span class="tag">Active</span>
      </a>\n"""

    html_content += """    </div>
  </div>
<script>
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789!@#$%^&*()_+-=[]{}|;':\",./<>?🌱あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
    const gaElements = document.querySelectorAll('.ga-text');
    gaElements.forEach(el => {
        const target = el.getAttribute('data-target');
        if (!target) return;
        let currentStr = Array.from({length: target.length}, () => charset[Math.floor(Math.random() * charset.length)]).join('');
        const updateDOM = (str) => {
            let html = '';
            for (let i = 0; i < target.length; i++) {
                if (str[i] === target[i]) {
                    html += `<span style="opacity: 1;">${str[i]}</span>`;
                } else {
                    html += `<span style="opacity: 0.6;">${str[i]}</span>`;
                }
            }
            el.innerHTML = html;
        };
        let iterations = 0;
        const maxIterations = 120;
        const evolve = () => {
            iterations++;
            let nextStr = '';
            let isComplete = true;
            for (let i = 0; i < target.length; i++) {
                if (currentStr[i] === target[i]) {
                    nextStr += target[i];
                } else {
                    isComplete = false;
                    const lockChance = Math.pow(iterations / maxIterations, 2) * 0.3;
                    if (Math.random() < lockChance || iterations > maxIterations * 0.95) {
                        nextStr += target[i]; 
                    } else {
                        nextStr += charset[Math.floor(Math.random() * charset.length)];
                    }
                }
            }
            currentStr = nextStr;
            updateDOM(currentStr);
            if (!isComplete && iterations < maxIterations) {
                setTimeout(evolve, 30);
            } else {
                el.innerHTML = target;
            }
        };
        updateDOM(currentStr);
        setTimeout(evolve, 300);
    });
</script>
</body>
</html>"""

    with open('list.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    print("Updated list.html with text snapshots.")

if __name__ == "__main__":
    generate_list()
