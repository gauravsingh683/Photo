import re

with open('C:/Photo/booth-app/src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace all common dark background colors with creamy white
code = code.replace("backgroundColor: '#000'", "backgroundColor: '#fdfbf7'")
code = code.replace("backgroundColor: '#111'", "backgroundColor: '#fdfbf7'")
code = code.replace("backgroundColor: '#27272a'", "backgroundColor: '#fffaf0'")
code = code.replace("backgroundColor: '#444'", "backgroundColor: '#f0e6e6'")

# Update text colors if any are still white
code = code.replace("color: '#fff'", "color: '#4a4a4a'")
code = code.replace("color: 'white'", "color: '#4a4a4a'")

# Ensure the main container has creamy white background instead of black
code = code.replace("backgroundColor: '#000', color: '#fff'", "backgroundColor: '#fdfbf7', color: '#4a4a4a'")

# For the CAMERA/FILTER_SELECT background (was linear-gradient to black)
code = code.replace("background: 'linear-gradient(to top, rgba(0,0,0,0.8) 20%, transparent)'", "background: 'linear-gradient(to top, rgba(253,251,247,0.9) 20%, transparent)'")

# Fix countdown background (was rgba(0,0,0,0.4))
code = code.replace("backgroundColor: 'rgba(0,0,0,0.4)'", "backgroundColor: 'rgba(255,255,255,0.7)'")

# Fix the shadow of buttons (was white, now should be pink/gray)
code = code.replace("border: '5px solid white'", "border: '5px solid #ffb6c1'")
code = code.replace("border: '4px solid white'", "border: '4px solid #ffb6c1'")
code = code.replace("border: '3px solid white'", "border: '3px solid #ffb6c1'")
code = code.replace("border: '2px solid white'", "border: '2px solid #ffb6c1'")

with open('C:/Photo/booth-app/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated backgrounds to creamy white!")
