import re

with open('C:/Photo/booth-app/src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# The Instagram-style filter carousel
new_ui = """
            {appState === 'CAMERA' && (
              <div style={{ 
                position: 'absolute', 
                bottom: '40px', 
                width: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '15px'
              }}>
                <span style={{ 
                  color: 'white', 
                  fontSize: '1rem', 
                  fontWeight: 'bold', 
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '4px 12px',
                  borderRadius: '20px'
                }}>
                  {selectedFilter.name}
                </span>

                <div 
                  className="no-scrollbar"
                  style={{ 
                    width: '100%', 
                    overflowX: 'auto', 
                    display: 'flex', 
                    alignItems: 'center',
                    padding: '0 50%', // allows scrolling to center first/last items
                    boxSizing: 'border-box', 
                    scrollSnapType: 'x mandatory',
                    scrollBehavior: 'smooth'
                  }}
                >
                  <div style={{ display: 'flex', gap: '20px', margin: '0 auto' }}>
                    {FILTERS.map(f => {
                      const isSelected = selectedFilter.id === f.id;
                      return (
                        <div 
                          key={f.id} 
                          onClick={(e) => {
                            if (isSelected) {
                              startCountdown();
                            } else {
                              setSelectedFilter(f);
                              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center' });
                            }
                          }} 
                          style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            cursor: 'pointer',
                            scrollSnapAlign: 'center',
                            flexShrink: 0
                          }}
                        >
                          <div style={{ 
                            width: isSelected ? '85px' : '60px', 
                            height: isSelected ? '85px' : '60px', 
                            borderRadius: '50%', 
                            border: isSelected ? '6px solid rgba(255, 255, 255, 0.4)' : '2px solid rgba(255,255,255,0.8)', 
                            overflow: 'hidden', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            boxShadow: isSelected ? '0 0 0 4px #fff, 0 10px 20px rgba(0,0,0,0.4)' : '0 4px 10px rgba(0,0,0,0.3)', 
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                          }}>
                            {/* Inner circle acts as shutter visually when selected */}
                            <div style={{
                              width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                              border: isSelected ? '2px solid white' : 'none'
                            }}>
                              <img src="/filter_preview.jpg" style={{ filter: f.css, width: '100%', height: '100%', objectFit: 'cover' }} alt={f.name} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
"""

# Extract everything before the first appState === 'CAMERA' block
parts = code.split("{appState === 'CAMERA' && (")
before_camera = parts[0]

# Extract everything after the COUNTDOWN block
after_countdown = "{appState === 'COUNTDOWN' && (" + code.split("{appState === 'COUNTDOWN' && (")[1]

# Combine
new_code = before_camera + new_ui + "\n            " + after_countdown

with open('C:/Photo/booth-app/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(new_code)

print("Redesigned carousel successfully")
