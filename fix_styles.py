import re

css_path = '/home/masumori/.openclaw/workspace-liv/projects/homepage/styles.css'
with open(css_path, 'r') as f:
    css = f.read()

# carefully replace flex in body
css = css.replace("""body {
    margin: 0;
    padding: 0;
    font-family: 'Space Mono', monospace;
    background-color: #fff;
    color: #000;
    min-height: 100vh;
    display: flex;
    /* align-items: center; */
    justify-content: center;
    overflow-x: hidden;
    overflow-y: auto;
}""", """body {
    margin: 0;
    padding: 0;
    font-family: 'Space Mono', monospace;
    background-color: #fff;
    color: #000;
    min-height: 100vh;
    display: block;
    overflow-x: hidden;
    overflow-y: auto;
}""")

with open(css_path, 'w') as f:
    f.write(css)

# Update HTML to prevent zooming
html_path = '/home/masumori/.openclaw/workspace-liv/projects/homepage/index.html'
with open(html_path, 'r') as f:
    html = f.read()

html = html.replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">'
)

with open(html_path, 'w') as f:
    f.write(html)

print("Safely updated CSS and HTML.")
