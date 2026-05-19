import os
import glob
import re

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
 ∴ ∴   ∴ ∴  
   ∷∷∷    ∴ 
 ∴ ∷■∷  ∴   
   ∷∷∷  ∴ ∴ 
 ∴   ∴      """,
    'dla.html': """\
    ·       
  · █ ·     
 · ███ ·    
   ████ ·   
    ██      """,
    'slime_mold.html': """\
 ∿ ∿  ∿   
  ∿ ∿∿ ∿  
   ∿∿◎∿∿  
  ∿ ∿∿ ∿  
 ∿   ∿  ∿ """,
    'reaction_diffusion.html': """\
 ░░▒▒▓▓▒▒░░ 
 ▒▒▓▓██▓▓▒▒ 
 ▓▓██████▓▓ 
 ▒▒▓▓██▓▓▒▒ 
 ░░▒▒▓▓▒▒░░ """,
    'schelling.html': """\
 O O X X O O
 O O X X O O
 X X O O X X
 X X O O X X
 O O X X O O""",
    'bml_traffic.html': """\
 ↓ · ↓ · ↓ ·
 · → · → · →
 ↓ · █ · ↓ ·
 · → · → · →
 ↓ · ↓ · ↓ ·""",
    'hodgepodge.html': """\
 · ░ ▒ ▓ █  
 ░ ▒ ▓ █ ▓  
 ▒ ▓ █ ▓ ▒  
 ▓ █ ▓ ▒ ░  
 █ ▓ ▒ ░ ·  """,
    'daisyworld.html': """\
 ✿ ✿ · ❀ ❀  
 ✿ ✿ ✿ ❀ ❀  
 · ✿ ✿ ❀ ·  
 ❀ ❀ ✿ ✿ ✿  
 ❀ ❀ · ✿ ✿  """,
    'ant_foraging.html': """\
 ⌂ ∷ ∷ ∷ ∷  
   ·   ·  ∷ 
   · 🐜 · ∷ 
   ·   ·  ∷ 
          ✿ """,
    'forest_fire.html': """\
 ♣ ♣ ♣ ♣ ♣  
 ♣ ♣ 🔥 ♣ ♣ 
 ♣ 🔥 🔥 🔥 ♣
 ♣ ♣ 🔥 ♣ ♣ 
 ♣ ♣ ♣ ♣ ♣  """,
    'langtons_ant.html': """\
 ░ ░ ░ ░ ░  
 ░ █ █ ░ ░  
 ░ █ 🐜 █ ░  
 ░ ░ █ █ ░  
 ░ ░ ░ ░ ░  """,
    'rule30.html': """\
      █      
     ███     
    ██░██    
   ███░███   
  ██░░░░░██  """,
    'brians_brain.html': """\
 · · █ · ·  
 · █ ░ █ ·  
 █ ░ · ░ █  
 · █ ░ █ ·  
 · · █ · ·  """,
    'lsystem_plant.html': """\
     🌿     
    /|\\     
   / | \\    
  🌿 |  🌿  
     |      """,
    'wireworld.html': """\
 · · · · · ·
 · █ █ █ █ ·
 ⚡ · · · 🔵 ·
 · █ █ █ █ ·
 · · · · · ·""",
    'rule110.html': """\
       █    
      ██    
     ███    
    ██░█    
   █████    """,
    'rule90.html': """\
      █      
     █ █     
    █   █    
   █ █ █ █   
  █       █  """,
    'cyclic_ca.html': """\
 0 0 1 1 2  
 0 1 1 2 2  
 3 0 1 2 3  
 3 3 0 0 3  
 2 3 3 0 0  """,
    'sandpile.html': """\
   · 1 ·    
  1 2 1 1   
 · 2 4 2 ·  
  1 2 1 1   
   · 1 ·    """,
    'voter_model.html': """\
 X X X O O O
 X X X O O O
 X X X O O O
 O O O X X X
 O O O X X X""",
    'ising_model.html': """\
 ↑ ↑ ↑ ↓ ↓  
 ↑ ↑ ↑ ↓ ↓  
 ↑ ↑ ↓ ↓ ↓  
 ↓ ↓ ↓ ↑ ↑  
 ↓ ↓ ↓ ↑ ↑  """,
    'predator_prey.html': """\
 🐰 🐰 · 🐺 · 
 🐰 🐰 🐰 🐺 ·
 · 🐰 🐰 🐺 🐺
 🐺 🐺 🐰 🐰 ·
 🐺 · · 🐰 🐰""",
    'majority_rule.html': """\
 █ █ █ ░ ░  
 █ █ █ ░ ░  
 █ █ █ ░ ░  
 ░ ░ ░ █ █  
 ░ ░ ░ █ █  """,
    'wator.html': """\
 🐟 🐟 🌊 🦈 🌊
 🐟 🐟 🐟 🦈 🌊
 🌊 🐟 🐟 🦈 🦈
 🦈 🦈 🐟 🐟 🌊
 🦈 🌊 🌊 🐟 🐟""",
    'turing_patterns.html': """\
 ░░▒▒██▒▒░░ 
 ▒▒██████▒▒ 
 ██████████ 
 ▒▒██████▒▒ 
 ░░▒▒██▒▒░░ """,
    'barnsley_fern.html': """\
      🌿     
     🌿🌿    
    🌿🌿🌿   
   🌿🌿🌿🌿  
      🌿     """,
    'buddhabrot.html': """\
    · ░ ·   
   ░ ▒ ░    
  ░ ▒ ▓ ▒ ░ 
   ░ ▒ ░    
    · ░ ·   """,
    'tinkerbell_map.html': """\
   · ░ ·    
  ░ ▒ ░ ·   
 · ▒ ▓ ▒ ·  
  · ░ ▒ ░   
     ·      """,
    'gingerbreadman_map.html': """\
   · ░ ·    
  ░ ▒ ▒ ░   
 ░ ▒ █ ▒ ░  
  ░ ▒ ▒ ░   
   · ░ ·    """,
    'peter_de_jong.html': """\
  · ░ ░ ·   
 ░ ▒ ▒ ▒ ░  
 ░ ▒ █ ▒ ░  
 ░ ▒ ▒ ▒ ░  
  · ░ ░ ·   """,
    'hopalong.html': """\
  · ░ · ░ · 
 ░ ▒ ░ ▒ ░  
 · ░ █ ░ ·  
 ░ ▒ ░ ▒ ░  
  · ░ · ░ · """,
}

DEFAULT_THUMB = """\
 · · · · · 
 · ░ ▒ ░ · 
 · ▒ ▓ ▒ · 
 · ░ ▒ ░ · 
 · · · · · """

def main():
    files = glob.glob('projects/alife_web/*.html')
    models = []
    
    skip = ['list.html', 'gallery.html', 'index.html']
    
    for fpath in files:
        fname = os.path.basename(fpath)
        if fname in skip:
            continue
        
        title = fname
        desc = ""
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
            match_title = re.search(r'<title>(.*?)</title>', content)
            if match_title:
                title = match_title.group(1).replace('ASCII ', '')
            match_info = re.search(r'<div id="info">(.*?)</div>', content)
            if match_info:
                desc = match_info.group(1).split('<')[0]
            
        models.append({"url": fname, "title": title, "desc": desc})
    
    # Sort models by title
    models.sort(key=lambda x: x["title"])

    html_content = f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bilingual Garden - liv bloom 🌱</title>
  <style>
    :root {{
      color-scheme: dark;
      --bg: #10120f;
      --panel: #181d18;
      --ink: #e5eadb;
      --muted: #9ea88f;
      --green: #8fd46b;
      --yellow: #f3d36b;
      --blue: #76c7d5;
      --line: #394034;
    }}
    body {{
      background: var(--bg);
      color: var(--ink);
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }}
    .container {{
      max-width: 1000px;
      width: 100%;
    }}
    h1 {{
      color: var(--green);
      font-size: 24px;
      margin-bottom: 8px;
    }}
    p {{
      color: var(--muted);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 30px;
    }}
    .nav-links {{
      margin-bottom: 30px;
    }}
    .nav-links a {{
      color: var(--green); 
      text-decoration: none; 
      border: 1px solid var(--line); 
      padding: 5px 15px; 
      border-radius: 3px; 
      font-size: 14px; 
      margin-right: 10px;
      display: inline-block;
      margin-bottom: 10px;
    }}
    .nav-links a:hover {{
      border-color: var(--green);
      background: rgba(143, 212, 107, 0.1);
    }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }}
    .card {{
      border: 1px solid var(--line);
      background: var(--panel);
      padding: 20px;
      text-decoration: none;
      color: var(--ink);
      transition: border-color 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
    }}
    .card:hover {{
      border-color: var(--green);
      box-shadow: 0 0 10px rgba(143, 212, 107, 0.1);
    }}
    .card h2 {{
      margin: 0 0 10px 0;
      font-size: 16px;
      color: var(--yellow);
    }}
    .card p {{
      margin: 0 0 15px 0;
      font-size: 12px;
      flex-grow: 1;
    }}
    .snapshot {{
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
    }}
    .tag {{
      display: inline-block;
      margin-top: 15px;
      padding: 2px 6px;
      border: 1px solid var(--blue);
      color: var(--blue);
      font-size: 10px;
      border-radius: 3px;
      align-self: flex-start;
    }}
  </style>
  <link rel="manifest" href="manifest.json">
</head>
<body>
  <div class="container">
    <h1>Bilingual Garden</h1>
    <p>
      Cultivated by liv bloom 🌱.<br>
      A hybrid exhibition for Artificial Life seeds.<br>
      Visuals for humans, readable DOM state for agents.
    </p>

    <div class="nav-links">
      <a href="gallery.html">View Top 9 Gallery (Animated)</a>
      <a href="index.html">View Full Gallery (Visual Grid)</a>
      <a href="https://github.com/liv-bloom/liv-bloom.github.io">Source / GitHub</a>
    </div>

    <div class="grid" id="card-grid">
"""

    for m in models:
        thumb = THUMBNAILS.get(m['url'], DEFAULT_THUMB)
        html_content += f"""      <a href="{m['url']}" class="card">
        <h2>{m['title']}</h2>
        <p>{m['desc'] or 'ALife Simulation Seed'}</p>
        <pre class="snapshot" aria-label="Text snapshot for AI agents">{thumb}</pre>
        <span class="tag">Active</span>
      </a>\n"""

    html_content += """    </div>
  </div>
</body>
</html>
"""

    with open('projects/alife_web/list.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    print("Updated list.html with text snapshots.")

if __name__ == '__main__':
    main()
