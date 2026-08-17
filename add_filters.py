import re

with open('C:/Photo/booth-app/src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

filters_const = """
const FILTERS = [
  { id: 'normal', name: 'Normal', css: 'none' },
  { id: 'beauty', name: 'Beauty ✨', css: 'brightness(1.15) contrast(0.95) saturate(1.2)' },
  { id: 'glow', name: 'Glow 💖', css: 'brightness(1.1) contrast(1.1) sepia(0.15) hue-rotate(-10deg)' },
  { id: 'vintage', name: 'Vintage 🎞️', css: 'sepia(0.5) contrast(1.1) brightness(0.9)' },
  { id: 'film', name: 'Film 📸', css: 'grayscale(0.2) contrast(1.3) sepia(0.2)' },
  { id: 'bw', name: 'B&W 🖤', css: 'grayscale(1) contrast(1.2)' }
];
"""

# Insert FILTERS constant
if "const FILTERS =" not in code:
    code = code.replace("function App() {", filters_const + "\nfunction App() {")

# Insert selectedFilter state
if "const [selectedFilter," not in code:
    code = code.replace("const [appState, setAppState] = useState<BoothState>('WELCOME');", 
                        "const [appState, setAppState] = useState<BoothState>('WELCOME');\n  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);")

# Apply filter to webcam
code = code.replace("style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}", 
                    "style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', filter: selectedFilter.css }}")

# Apply filter to preview images
code = code.replace("style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=\"Captured\"", 
                    "style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', filter: selectedFilter.css }} alt=\"Captured\"")
code = code.replace("style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=\"Final\"", 
                    "style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', filter: selectedFilter.css }} alt=\"Final\"")

# Add filter selection UI
filter_ui = """
            {appState === 'CAMERA' && (
              <div style={{ position: 'absolute', bottom: '160px', width: '100%', overflowX: 'auto', display: 'flex', gap: '15px', padding: '10px 20px', boxSizing: 'border-box', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }} className="no-scrollbar">
                {FILTERS.map(f => (
                  <div key={f.id} onClick={() => setSelectedFilter(f)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: selectedFilter.id === f.id ? '3px solid #ffb6c1' : '2px solid white', overflow: 'hidden', backgroundColor: '#fff0f5', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', boxShadow: selectedFilter.id === f.id ? '0 0 15px rgba(255, 182, 193, 0.8)' : '0 4px 10px rgba(0,0,0,0.3)', transition: 'all 0.2s' }}>
                      <span style={{ filter: f.css, width: '100%', height: '100%', background: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', display: 'block' }}></span>
                    </div>
                    <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: selectedFilter.id === f.id ? 'bold' : 'normal', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{f.name}</span>
                  </div>
                ))}
              </div>
            )}
"""

if "bottom: '160px'" not in code:
    code = code.replace("{appState === 'CAMERA' && (", filter_ui + "\n            {appState === 'CAMERA' && (")

with open('C:/Photo/booth-app/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Beauty filters added to App.tsx")
