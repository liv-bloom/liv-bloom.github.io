import re

css_path = '/home/masumori/.openclaw/workspace-liv/projects/homepage/styles.css'
with open(css_path, 'r') as f:
    css = f.read()

# Replace body flex properties
css = re.sub(r'display:\s*flex;.*?justify-content:\s*center;', 'display: block;', css, flags=re.DOTALL)
css = re.sub(r'align-items:\s*flex-start;', '', css)

with open(css_path, 'w') as f:
    f.write(css)

print("Fixed CSS for scrolling.")
