import os
import glob
import re

def main():
    files = glob.glob('projects/alife_web/*.html')
    models = []
    
    # skip index and gallery themselves
    skip = ['index.html', 'gallery.html', 'full_gallery.html']
    
    for fpath in files:
        fname = os.path.basename(fpath)
        if fname in skip:
            continue
        
        title = fname
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'<h1>(.*?)</h1>', content)
            if match:
                title = match.group(1).replace('<span class="tag">', '').replace('</span>', '')
            
        models.append({"url": fname, "title": title})
    
    html_content = f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bilingual Garden - Full Gallery</title>
  <style>
    :root {{
      color-scheme: dark;
      --bg: #10120f;
      --panel: #181d18;
      --ink: #e5eadb;
      --green: #8fd46b;
      --line: #394034;
    }}
    body {{
      background: var(--bg);
      color: var(--ink);
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      margin: 0;
      padding: 20px;
    }}
    h1 {{
      color: var(--green);
      font-size: 24px;
      text-align: center;
      margin-bottom: 20px;
    }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 15px;
      max-width: 1400px;
      margin: 0 auto;
    }}
    .frame-container {{
      border: 1px solid var(--line);
      background: var(--panel);
      position: relative;
      padding-top: 75%;
      overflow: hidden;
      border-radius: 4px;
    }}
    iframe {{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      transform: scale(0.85);
      transform-origin: 0 0;
      width: 117.6%;
      height: 117.6%;
      pointer-events: none;
    }}
    .overlay {{
      position: absolute;
      bottom: 0; left: 0; right: 0;
      background: rgba(16, 18, 15, 0.8);
      padding: 5px 10px;
      font-size: 12px;
      color: var(--green);
      backdrop-filter: blur(2px);
    }}
    .nav {{
      text-align: center;
      margin-bottom: 20px;
    }}
    .nav a {{
      color: var(--ink);
      text-decoration: none;
      border: 1px solid var(--line);
      padding: 5px 15px;
      border-radius: 3px;
      font-size: 14px;
      margin: 0 5px;
    }}
    .nav a:hover {{
      border-color: var(--green);
    }}
  </style>
</head>
<body>
  <h1>Bilingual Garden - Full Gallery ({len(models)} Seeds)</h1>
  <div class="nav">
    <a href="index.html">← Back to Index</a>
    <a href="gallery.html">Top 9 Gallery</a>
  </div>
  <p style="text-align:center; font-size:12px; color:var(--green);">Warning: Loading {len(models)} simulations simultaneously may be CPU intensive. iframes are set to loading="lazy".</p>
  <div class="grid" id="gallery">
"""
    for m in models:
        html_content += f"""    <div class="frame-container">
      <iframe src="{m['url']}" loading="lazy"></iframe>
      <div class="overlay">{m['title']}</div>
    </div>\n"""

    html_content += """  </div>
</body>
</html>
"""
    
    with open('projects/alife_web/full_gallery.html', 'w', encoding='utf-8') as f:
        f.write(html_content)

if __name__ == '__main__':
    main()
