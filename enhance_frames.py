import re
path = r'C:\Photo\booth-app\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

new_frames = '''
  { 
    id: 'collage_grid4_editorial', name: 'Editorial (4)', layout: 'grid4', side: 'right', style: { border: '25px solid #fff', borderBottomWidth: '120px' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '30px'}}>
        <div style={{position: 'absolute', top: '20px', left: '20px', width: '30px', height: '30px', borderTop: '2px solid black', borderLeft: '2px solid black'}}></div>
        <div style={{position: 'absolute', top: '20px', right: '20px', width: '30px', height: '30px', borderTop: '2px solid black', borderRight: '2px solid black'}}></div>
        <span style={{color: '#000', fontFamily: '"Didot", serif', fontSize: '2.5rem', letterSpacing: '12px', textTransform: 'uppercase', fontWeight: 'bold'}}>VOGUE</span>
      </div>
    )
  },
  { 
    id: 'collage_strip3_love', name: 'Sweetheart (3)', layout: 'strip3', side: 'right', style: { border: '25px solid #ffe4e1', borderBottomWidth: '100px' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: '10%', left: '-10px', color: '#ff4d6d', fontSize: '2rem', opacity: 0.6, transform: 'rotate(-15deg)'}}>❤</div>
        <div style={{position: 'absolute', top: '40%', right: '-15px', color: '#ff758f', fontSize: '2.5rem', opacity: 0.5, transform: 'rotate(20deg)'}}>❤</div>
        <div style={{position: 'absolute', top: '70%', left: '-5px', color: '#ffb3c6', fontSize: '1.5rem', opacity: 0.8, transform: 'rotate(-30deg)'}}>❤</div>
        <div style={{position: 'absolute', bottom: '25px', width: '100%', textAlign: 'center'}}>
          <div style={{position: 'relative', display: 'inline-block'}}>
            <span style={{color: '#ff4d6d', fontFamily: '"Brush Script MT", cursive', fontSize: '3rem', textShadow: '2px 2px 4px rgba(255, 77, 109, 0.2)'}}>Soulmates</span>
            <div style={{position: 'absolute', top: '-15px', right: '-25px', color: '#ff4d6d', fontSize: '1.5rem'}}>✨</div>
          </div>
        </div>
      </div>
    )
  },
  { 
    id: 'collage_grid4_love', name: 'Sweetheart (4)', layout: 'grid4', side: 'right', style: { border: '25px solid #ffe4e1', borderBottomWidth: '100px' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: '10%', left: '-10px', color: '#ff4d6d', fontSize: '2rem', opacity: 0.6, transform: 'rotate(-15deg)'}}>❤</div>
        <div style={{position: 'absolute', top: '40%', right: '-15px', color: '#ff758f', fontSize: '2.5rem', opacity: 0.5, transform: 'rotate(20deg)'}}>❤</div>
        <div style={{position: 'absolute', top: '70%', left: '-5px', color: '#ffb3c6', fontSize: '1.5rem', opacity: 0.8, transform: 'rotate(-30deg)'}}>❤</div>
        <div style={{position: 'absolute', bottom: '25px', width: '100%', textAlign: 'center'}}>
          <div style={{position: 'relative', display: 'inline-block'}}>
            <span style={{color: '#ff4d6d', fontFamily: '"Brush Script MT", cursive', fontSize: '3rem', textShadow: '2px 2px 4px rgba(255, 77, 109, 0.2)'}}>Soulmates</span>
            <div style={{position: 'absolute', top: '-15px', right: '-25px', color: '#ff4d6d', fontSize: '1.5rem'}}>✨</div>
          </div>
        </div>
      </div>
    )
  },
  { 
    id: 'collage_strip3_squad', name: 'Squad Goals (3)', layout: 'strip3', side: 'right', style: { border: '20px solid #fff', borderBottomWidth: '80px', boxShadow: 'inset 0 0 0 6px #1e90ff' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: '15px', right: '15px', backgroundColor: '#ffd700', color: '#000', fontWeight: '900', padding: '5px 10px', transform: 'rotate(10deg)', border: '2px solid #000', boxShadow: '3px 3px 0 #000', fontSize: '1.2rem', fontFamily: '"Impact", sans-serif'}}>BFFs!</div>
        <div style={{position: 'absolute', top: '50%', left: '-15px', color: '#ff1493', fontSize: '2.5rem', fontWeight: 'bold', transform: 'rotate(-25deg)', textShadow: '2px 2px 0 #000'}}>★</div>
        <div style={{position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#fff', backgroundColor: '#ff1493', padding: '5px 15px', border: '3px solid #000', boxShadow: '4px 4px 0 #000', fontFamily: '"Impact", sans-serif', fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '2px', display: 'inline-block', transform: 'rotate(-3deg)'}}>SQUAD GOALS</span>
        </div>
      </div>
    )
  },
  { 
    id: 'collage_grid4_squad', name: 'Squad Goals (4)', layout: 'grid4', side: 'right', style: { border: '20px solid #fff', borderBottomWidth: '80px', boxShadow: 'inset 0 0 0 6px #1e90ff' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: '15px', right: '15px', backgroundColor: '#ffd700', color: '#000', fontWeight: '900', padding: '5px 10px', transform: 'rotate(10deg)', border: '2px solid #000', boxShadow: '3px 3px 0 #000', fontSize: '1.2rem', fontFamily: '"Impact", sans-serif'}}>BFFs!</div>
        <div style={{position: 'absolute', top: '50%', left: '-15px', color: '#ff1493', fontSize: '2.5rem', fontWeight: 'bold', transform: 'rotate(-25deg)', textShadow: '2px 2px 0 #000'}}>★</div>
        <div style={{position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#fff', backgroundColor: '#ff1493', padding: '5px 15px', border: '3px solid #000', boxShadow: '4px 4px 0 #000', fontFamily: '"Impact", sans-serif', fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '2px', display: 'inline-block', transform: 'rotate(-3deg)'}}>SQUAD GOALS</span>
        </div>
      </div>
    )
  },
  { 
    id: 'collage_strip3_scrapbook', name: 'Scrapbook (3)', layout: 'strip3', side: 'right', style: { border: '30px solid #fdf6e3', borderBottomWidth: '110px' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden'}}>
        <div style={{position:'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%) rotate(-3deg)', width: '100px', height: '30px', backgroundColor: 'rgba(255, 255, 255, 0.7)', backgroundImage: 'linear-gradient(45deg, transparent 40%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.05) 60%, transparent 60%)', backgroundSize: '10px 10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 10, borderLeft: '2px dashed rgba(255,255,255,0.5)', borderRight: '2px dashed rgba(255,255,255,0.5)'}}></div>
        <div style={{position:'absolute', bottom: '115px', right: '-15px', transform: 'rotate(45deg)', width: '80px', height: '25px', backgroundColor: 'rgba(255, 200, 200, 0.7)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 10}}></div>
        <div style={{position:'absolute', top: '0', left: '0', width: '20px', height: '20px', borderTop: '3px solid #c2b280', borderLeft: '3px solid #c2b280'}}></div>
        <div style={{position:'absolute', top: '0', right: '0', width: '20px', height: '20px', borderTop: '3px solid #c2b280', borderRight: '3px solid #c2b280'}}></div>
        <div style={{position:'absolute', bottom: '25px', left: '0', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{backgroundColor: '#fff', padding: '5px 15px', border: '1px solid #e0d5c1', boxShadow: '2px 2px 5px rgba(0,0,0,0.05)', transform: 'rotate(-2deg)'}}>
            <span style={{color: '#5c4a3d', fontFamily: '"Caveat", "Comic Sans MS", cursive', fontSize: '2.5rem', fontWeight: 'bold'}}>Best Friends</span>
          </div>
          <div style={{fontSize: '1.2rem', color: '#8b7355', marginTop: '10px', fontFamily: '"Caveat", "Comic Sans MS", cursive', transform: 'rotate(1deg)'}}>Making memories together...</div>
        </div>
      </div>
    )
  },
  { 
    id: 'collage_grid4_scrapbook', name: 'Scrapbook (4)', layout: 'grid4', side: 'right', style: { border: '30px solid #fdf6e3', borderBottomWidth: '110px' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden'}}>
        <div style={{position:'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%) rotate(-3deg)', width: '100px', height: '30px', backgroundColor: 'rgba(255, 255, 255, 0.7)', backgroundImage: 'linear-gradient(45deg, transparent 40%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.05) 60%, transparent 60%)', backgroundSize: '10px 10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 10, borderLeft: '2px dashed rgba(255,255,255,0.5)', borderRight: '2px dashed rgba(255,255,255,0.5)'}}></div>
        <div style={{position:'absolute', bottom: '115px', right: '-15px', transform: 'rotate(45deg)', width: '80px', height: '25px', backgroundColor: 'rgba(255, 200, 200, 0.7)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 10}}></div>
        <div style={{position:'absolute', top: '0', left: '0', width: '20px', height: '20px', borderTop: '3px solid #c2b280', borderLeft: '3px solid #c2b280'}}></div>
        <div style={{position:'absolute', top: '0', right: '0', width: '20px', height: '20px', borderTop: '3px solid #c2b280', borderRight: '3px solid #c2b280'}}></div>
        <div style={{position:'absolute', bottom: '25px', left: '0', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{backgroundColor: '#fff', padding: '5px 15px', border: '1px solid #e0d5c1', boxShadow: '2px 2px 5px rgba(0,0,0,0.05)', transform: 'rotate(-2deg)'}}>
            <span style={{color: '#5c4a3d', fontFamily: '"Caveat", "Comic Sans MS", cursive', fontSize: '2.5rem', fontWeight: 'bold'}}>Best Friends</span>
          </div>
          <div style={{fontSize: '1.2rem', color: '#8b7355', marginTop: '10px', fontFamily: '"Caveat", "Comic Sans MS", cursive', transform: 'rotate(1deg)'}}>Making memories together...</div>
        </div>
      </div>
    )
  },
'''

pattern = r"(\{\s*id: 'collage_grid4_editorial'.*?\)\s*\},).*?(\{\s*id: 'collage_grid4_scrapbook'.*?\)\s*\})"
new_content = re.sub(pattern, new_frames.strip()[:-1], content, flags=re.DOTALL)

if new_content != content:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Success')
else:
    print('Pattern not found')
