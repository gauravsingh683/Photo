import re

with open('C:/Photo/booth-app/src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Make the welcome screen super aesthetic and sexy creamy pink
welcome_new = """
      {appState === 'WELCOME' && (
        <div style={{ textAlign: 'center', zIndex: 10, animation: 'fadeIn 1.5s ease-out', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <img src="/logo.png" alt="Logo" style={{ width: '250px', marginBottom: '40px', filter: 'drop-shadow(0px 10px 15px rgba(255, 182, 193, 0.6))' }} />
          
          <h1 style={{ fontFamily: '"Georgia", serif', fontSize: '5.5rem', fontStyle: 'italic', background: 'linear-gradient(45deg, #ff758c 0%, #ff7eb3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px', textShadow: '0px 4px 20px rgba(255, 117, 140, 0.3)' }}>
            Lumière ✨
          </h1>
          <p style={{ fontSize: '1.4rem', color: '#ff8da1', marginBottom: '50px', fontWeight: '300', letterSpacing: '2px' }}>Capture your glowing moments 💖</p>
          
          <button onClick={() => setAppState('FILTER_SELECT')} style={{ 
              padding: '22px 70px', 
              fontSize: '1.6rem', 
              borderRadius: '50px', 
              background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4e1 100%)', 
              color: '#d6336c', 
              border: '2px solid rgba(255, 182, 193, 0.5)', 
              cursor: 'pointer', 
              fontWeight: '600', 
              boxShadow: '0 15px 35px rgba(255, 117, 140, 0.2), inset 0 0 10px rgba(255,255,255,0.8)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 117, 140, 0.3), inset 0 0 15px rgba(255,255,255,1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(255, 117, 140, 0.2), inset 0 0 10px rgba(255,255,255,0.8)'; }}
            >
            Tap to Begin 💖
          </button>
        </div>
      )}
"""

code = re.sub(r"\{appState === 'WELCOME' && \([\s\S]*?</div>\n      \)}", welcome_new.strip(), code)

# Update global background
code = code.replace("backgroundColor: '#fdf8f5'", "background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4e1 100%)'")

# Update other buttons to creamy pink
code = code.replace("backgroundColor: '#ffb6c1'", "background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4e1 100%)', color: '#d6336c', border: '2px solid rgba(255, 182, 193, 0.5)', boxShadow: '0 10px 20px rgba(255, 117, 140, 0.15)'")

# Copy the logo
import shutil
import os
try:
    if os.path.exists("C:/Photo/admin-panel/public/logo.png"):
        shutil.copy("C:/Photo/admin-panel/public/logo.png", "C:/Photo/booth-app/public/logo.png")
except Exception as e:
    print(e)

with open('C:/Photo/booth-app/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Sexy young female touch design applied successfully!")
