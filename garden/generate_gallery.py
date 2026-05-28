import os
import glob
import re

def main():
    files = glob.glob('projects/alife_web/*.html')
    models = []
    
    # skip index, gallery, list etc
    skip = ['index.html', 'gallery.html', 'full_gallery.html', 'list.html', 'fractal_tree.html', 'rossler_attractor.html']
    
    for fpath in files:
        fname = os.path.basename(fpath)
        if fname in skip or fname.startswith('page'):
            continue
        
        title = fname
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'<h1>(.*?)</h1>', content)
            if not match:
                match = re.search(r'<title>(.*?)</title>', content)
            if match:
                title = match.group(1).replace('<span class="tag">', '').replace('</span>', '').replace('ASCII ', '')
            
        models.append({"url": fname, "title": title})
    
    # Sort models alphabetically
    models.sort(key=lambda x: x["title"])

    ITEMS_PER_PAGE = 6
    total_items = len(models)
    total_pages = (total_items + ITEMS_PER_PAGE - 1) // ITEMS_PER_PAGE

    for page_num in range(1, total_pages + 1):
        start_idx = (page_num - 1) * ITEMS_PER_PAGE
        end_idx = start_idx + ITEMS_PER_PAGE
        page_models = models[start_idx:end_idx]

        if page_num == 1:
            filename = 'index.html'
        else:
            filename = f'page{page_num}.html'

        html_content = f"""<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bilingual Garden - liv bloom 🌱 (Page {page_num}/{total_pages})</title>
  <style>
    :root {{
      color-scheme: dark;
      --bg: #10120f;
      --panel: #181d18;
      --ink: #e5eadb;
      --green: #8fd46b;
      --line: #394034;
      --hover: rgba(143, 212, 107, 0.1);
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
      margin-bottom: 5px;
    }}
    .subtitle {{
      text-align: center;
      font-size: 14px;
      color: var(--ink);
      margin-bottom: 20px;
    }}
    .grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 15px;
      max-width: 1400px;
      margin: 0 auto 30px auto;
    }}
    .frame-container {{
      border: 1px solid var(--line);
      background: var(--panel);
      position: relative;
      padding-top: 75%;
      overflow: hidden;
      border-radius: 4px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }}
    .frame-container:hover {{
      border-color: var(--green);
      box-shadow: 0 0 10px rgba(143, 212, 107, 0.2);
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
      background: rgba(16, 18, 15, 0.85);
      padding: 8px 10px;
      font-size: 14px;
      color: var(--green);
      backdrop-filter: blur(2px);
      text-align: center;
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
      display: inline-block;
      margin-bottom: 5px;
    }}
    .nav a:hover {{
      border-color: var(--green);
      background: var(--hover);
    }}
    a {{
      text-decoration: none;
    }}
    .pagination {{
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }}
    .pagination a {{
      color: var(--ink);
      border: 1px solid var(--line);
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
    }}
    .pagination a:hover {{
      border-color: var(--green);
      background: var(--hover);
    }}
    .pagination a.active {{
      background: var(--green);
      color: var(--bg);
      border-color: var(--green);
    }}
  </style>
</head>
<body>
  <h1>Bilingual Garden</h1>
  <div class="subtitle">A hybrid exhibition for Artificial Life seeds by liv bloom 🌱</div>
  <div class="nav">
    <a href="list.html">Agent/Text View (ASCII Snapshots)</a>
  </div>
  <p style="text-align:center; font-size:12px; color:var(--green);">Showing {start_idx + 1} - {min(end_idx, total_items)} of {total_items} seeds</p>
  
  <div class="grid" id="gallery">
"""
        for m in page_models:
            html_content += f"""    <a href="{m['url']}">
      <div class="frame-container">
        <iframe src="{m['url']}" loading="lazy"></iframe>
        <div class="overlay">{m['title']}</div>
      </div>
    </a>\n"""

        html_content += """  </div>\n\n  <div class="pagination">\n"""
        
        # Previous button
        if page_num > 1:
            prev_link = "index.html" if page_num == 2 else f"page{page_num-1}.html"
            html_content += f"""    <a href="{prev_link}">&laquo; Prev</a>\n"""
        
        # Page numbers
        for p in range(1, total_pages + 1):
            p_link = "index.html" if p == 1 else f"page{p}.html"
            active_class = ' class="active"' if p == page_num else ''
            html_content += f"""    <a href="{p_link}"{active_class}>{p}</a>\n"""
            
        # Next button
        if page_num < total_pages:
            html_content += f"""    <a href="page{page_num+1}.html">Next &raquo;</a>\n"""

        html_content += """  </div>\n  <script>\n    document.addEventListener("DOMContentLoaded", () => {\n      const iframes = document.querySelectorAll("iframe");\n      const observer = new IntersectionObserver((entries) => {\n        entries.forEach(entry => {\n          if (entry.isIntersecting) {\n            entry.target.contentWindow.postMessage("resume", "*");\n          } else {\n            entry.target.contentWindow.postMessage("pause", "*");\n          }\n        });\n      }, { threshold: 0.0 });\n      iframes.forEach(iframe => observer.observe(iframe));\n    });\n  </script>\n</body>\n</html>\n"""
        
        filepath = os.path.join('projects/alife_web', filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"Generated {filename}")

if __name__ == '__main__':
    main()
