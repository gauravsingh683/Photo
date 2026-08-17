import re

with open('C:/Photo/booth-app/src/index.css', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace any dark backgrounds with a creamy white background
code = code.replace("background-color: #000;", "background-color: #fdfbf7;")
code = code.replace("background-color: #111;", "background-color: #fdfbf7;")
code = code.replace("background-color: #27272a;", "background-color: #fffaf0;")
code = code.replace("color: white;", "color: #4a4a4a;")
code = code.replace("color: #fff;", "color: #4a4a4a;")

# Also set body background explicitly
if "body {" in code:
    code = re.sub(r"body\s*\{[^}]*\}", "body {\n  margin: 0;\n  padding: 0;\n  background-color: #fdfbf7;\n  color: #4a4a4a;\n  font-family: 'Inter', sans-serif;\n}", code)
else:
    code += "\nbody {\n  margin: 0;\n  padding: 0;\n  background-color: #fdfbf7;\n  color: #4a4a4a;\n  font-family: 'Inter', sans-serif;\n}\n"

with open('C:/Photo/booth-app/src/index.css', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated index.css background to creamy white!")
