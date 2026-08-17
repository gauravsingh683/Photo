import os, re
path = r'C:\Photo\booth-app\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

missing_frames = '''    { 
      id: 'collage_grid4_love', name: 'Sweetheart (4)', layout: 'grid4', side: 'right', style: { border: '25px solid #ffe4e1', borderBottomWidth: '80px', backgroundColor: '#ffe4e1' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0', backgroundColor: '#ffe4e1' },
      overlay: (
        <div style={{position:'absolute', bottom: '20px', left: '0', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#ff6b81', fontFamily: '"Brush Script MT", cursive', fontSize: '2.5rem'}}>Soulmates</span>
          <div style={{position: 'absolute', top: '-10px', left: '20px', color: '#ff4757', fontSize: '2rem'}}>❤</div>
          <div style={{position: 'absolute', top: '10px', right: '25px', color: '#ff4757', fontSize: '1.5rem'}}>❤</div>
        </div>
      )
    },
    { 
      id: 'collage_strip3_squad', name: 'Squad Goals (3)', layout: 'strip3', side: 'right', style: { border: '20px solid #fff', borderBottomWidth: '70px', backgroundColor: '#fff', boxShadow: 'inset 0 0 0 5px #1e90ff' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0', backgroundColor: '#fff' },
      overlay: (
        <div style={{position:'absolute', bottom: '15px', left: '0', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#ff1493', fontFamily: '"Impact", sans-serif', fontSize: '2.2rem', textTransform: 'uppercase', letterSpacing: '3px', textShadow: '2px 2px 0px #ffd700'}}>SQUAD GOALS</span>
        </div>
      )
    },
    { 
      id: 'collage_grid4_squad', name: 'Squad Goals (4)', layout: 'grid4', side: 'right', style: { border: '20px solid #fff', borderBottomWidth: '70px', backgroundColor: '#fff', boxShadow: 'inset 0 0 0 5px #1e90ff' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0', backgroundColor: '#fff' },
      overlay: (
        <div style={{position:'absolute', bottom: '15px', left: '0', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#ff1493', fontFamily: '"Impact", sans-serif', fontSize: '2.2rem', textTransform: 'uppercase', letterSpacing: '3px', textShadow: '2px 2px 0px #ffd700'}}>SQUAD GOALS</span>
        </div>
      )
    },
    { 
      id: 'collage_strip3_scrapbook', name: 'Scrapbook (3)', layout: 'strip3', side: 'right', style: { border: '30px solid #f4ecd8', borderBottomWidth: '90px', backgroundColor: '#f4ecd8' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0', backgroundColor: '#f4ecd8' },
      overlay: (
        <>
          <div style={{position:'absolute', top: '5px', left: '50%', transform: 'translateX(-50%)', width: '60px', height: '20px', backgroundColor: 'rgba(255,255,255,0.6)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', zIndex: 10, rotate: '-2deg'}}></div>
          <div style={{position:'absolute', bottom: '25px', left: '0', width: '100%', textAlign: 'center'}}>
            <span style={{color: '#5c4a3d', fontFamily: '"Courier New", monospace', fontSize: '1.6rem', fontWeight: 'bold'}}>Best Friends</span>
            <div style={{fontSize: '0.9rem', color: '#8b7355', marginTop: '5px', fontFamily: 'sans-serif'}}>Making memories together</div>
          </div>
        </>
      )
    },
    { 
      id: 'collage_grid4_scrapbook', name: 'Scrapbook (4)', layout: 'grid4', side: 'right', style: { border: '30px solid #f4ecd8', borderBottomWidth: '90px', backgroundColor: '#f4ecd8' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0', backgroundColor: '#f4ecd8' },
      overlay: (
        <>
          <div style={{position:'absolute', top: '5px', left: '50%', transform: 'translateX(-50%)', width: '60px', height: '20px', backgroundColor: 'rgba(255,255,255,0.6)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', zIndex: 10, rotate: '-2deg'}}></div>
          <div style={{position:'absolute', bottom: '25px', left: '0', width: '100%', textAlign: 'center'}}>
            <span style={{color: '#5c4a3d', fontFamily: '"Courier New", monospace', fontSize: '1.6rem', fontWeight: 'bold'}}>Best Friends</span>
            <div style={{fontSize: '0.9rem', color: '#8b7355', marginTop: '5px', fontFamily: 'sans-serif'}}>Making memories together</div>
          </div>
        </>
      )
    },'''

# Insert missing_frames after collage_strip3_love
pattern = r"(id: 'collage_strip3_love'.*?\)\s*\n\s*\},)"
new_content = re.sub(pattern, r'\1\n' + missing_frames, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)
