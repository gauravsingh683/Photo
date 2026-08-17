import re
import os

path = r'C:\Photo\booth-app\src\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need 16 strip3 frames and 16 grid4 frames.

def make_frame(id_base, name, border_color, border_bottom, left, overlay_content, theme=''):
    
    # Strip3
    strip3_id = f"collage_strip3_{id_base}"
    strip3_name = f"{name} (3)"
    strip3_side = "" if left else ", side: 'right'"
    strip3_str = f"""
  {{ 
    id: '{strip3_id}', name: '{strip3_name}', layout: 'strip3'{strip3_side}, style: {{ border: '25px solid {border_color}', borderBottomWidth: '{border_bottom}' }}, imageStyle: {{ top: '0', bottom: '0', left: '0', right: '0' }},
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden'}}>
        {overlay_content}
      </div>
    )
  }},"""

    # Grid4
    grid4_id = f"collage_grid4_{id_base}"
    grid4_name = f"{name} (4)"
    grid4_side = "" if left else ", side: 'right'"
    grid4_str = f"""
  {{ 
    id: '{grid4_id}', name: '{grid4_name}', layout: 'grid4'{grid4_side}, style: {{ border: '25px solid {border_color}', borderBottomWidth: '{border_bottom}' }}, imageStyle: {{ top: '0', bottom: '0', left: '0', right: '0' }},
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden'}}>
        {overlay_content}
      </div>
    )
  }},"""

    return strip3_str + grid4_str

frames_data = [
    # LEFT SIDE (8 Frames)
    # 1. Basic
    ("basic", "Classic", "#ffffff", "80px", True, 
     """<div style={{position: 'absolute', bottom: '25px', width: '100%', textAlign: 'center'}}><span style={{color: '#999', fontFamily: 'sans-serif', fontSize: '1.2rem', letterSpacing: '4px'}}>CLASSIC</span></div>"""),
    
    # 2. Glamour
    ("glamour", "Glamour", "#000000", "80px", True,
     """<div style={{position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center'}}><span style={{color: '#d4af37', fontFamily: '"Georgia", serif', fontSize: '1.8rem', fontStyle: 'italic', letterSpacing: '2px'}}>Glamour</span><div style={{width: '60%', height: '1px', backgroundColor: '#d4af37', margin: '5px auto 0'}}></div></div>"""),
    
    # 3. Bridal
    ("bridal", "Bridal", "#ffffff", "90px", True,
     """<div style={{position: 'absolute', bottom: '30px', width: '100%', textAlign: 'center'}}><span style={{color: '#dcdcdc', fontFamily: '"Times New Roman", serif', fontSize: '2rem', letterSpacing: '8px', textTransform: 'uppercase'}}>Forever</span></div>"""),
    
    # 4. Film
    ("film", "Film Reel", "#000000", "50px", True,
     """<div style={{position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '30px'}}>{[1,2,3,4,5,6,7].map(i => <div key={i} style={{width: '15px', height: '20px', backgroundColor: '#fff', borderRadius: '2px'}}></div>)}</div><div style={{position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '30px'}}>{[1,2,3,4,5,6,7].map(i => <div key={i} style={{width: '15px', height: '20px', backgroundColor: '#fff', borderRadius: '2px'}}></div>)}</div>"""),

    # 5. Editorial
    ("editorial", "Editorial", "#ffffff", "120px", True,
     """<div style={{position: 'absolute', top: '20px', left: '20px', width: '30px', height: '30px', borderTop: '2px solid black', borderLeft: '2px solid black'}}></div><div style={{position: 'absolute', top: '20px', right: '20px', width: '30px', height: '30px', borderTop: '2px solid black', borderRight: '2px solid black'}}></div><div style={{position: 'absolute', bottom: '30px', width: '100%', textAlign: 'center'}}><span style={{color: '#000', fontFamily: '"Didot", serif', fontSize: '2.5rem', letterSpacing: '12px', textTransform: 'uppercase', fontWeight: 'bold'}}>VOGUE</span></div>"""),

    # 6. Happy Birthday
    ("bday", "Happy B-Day", "#fff6cc", "100px", True,
     """<div style={{position: 'absolute', top: '10px', left: '10px', fontSize: '2.5rem', transform: 'rotate(-15deg)'}}>🎈</div><div style={{position: 'absolute', top: '15px', right: '15px', fontSize: '2rem', transform: 'rotate(20deg)'}}>✨</div><div style={{position: 'absolute', bottom: '25px', width: '100%', textAlign: 'center'}}><span style={{color: '#ff6b81', fontFamily: '"Comic Sans MS", cursive', fontSize: '2.5rem', fontWeight: 'bold', textShadow: '2px 2px 0px #fff'}}>Happy Birthday!</span></div>"""),

    # 7. Wedding Vibes
    ("wedding", "Wedding Vibes", "#fdfbf7", "110px", True,
     """<div style={{position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', border: '4px double #d4af37', opacity: 0.5}}></div><div style={{position: 'absolute', bottom: '35px', width: '100%', textAlign: 'center'}}><span style={{color: '#8b7355', fontFamily: '"Georgia", serif', fontSize: '2.2rem', fontStyle: 'italic'}}>To have and to hold</span></div>"""),

    # 8. Bride To Be
    ("bridetobe", "Bride To Be", "#fff0f5", "100px", True,
     """<div style={{position: 'absolute', top: '15px', left: '15px', fontSize: '2.5rem', opacity: 0.8}}>💍</div><div style={{position: 'absolute', bottom: '25px', width: '100%', textAlign: 'center'}}><span style={{color: '#ff69b4', fontFamily: '"Brush Script MT", cursive', fontSize: '3.2rem', textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}>Bride to Be</span></div>"""),


    # RIGHT SIDE (8 Frames)
    # 9. Love (Sweetheart)
    ("love", "Sweetheart", "#ffe4e1", "100px", False,
     """<div style={{position: 'absolute', top: '10%', left: '-10px', color: '#ff4d6d', fontSize: '2rem', opacity: 0.6, transform: 'rotate(-15deg)'}}>❤</div><div style={{position: 'absolute', top: '40%', right: '-15px', color: '#ff758f', fontSize: '2.5rem', opacity: 0.5, transform: 'rotate(20deg)'}}>❤</div><div style={{position: 'absolute', bottom: '25px', width: '100%', textAlign: 'center'}}><div style={{position: 'relative', display: 'inline-block'}}><span style={{color: '#ff4d6d', fontFamily: '"Brush Script MT", cursive', fontSize: '3rem', textShadow: '2px 2px 4px rgba(255, 77, 109, 0.2)'}}>Soulmates</span></div></div>"""),

    # 10. Squad Goals
    ("squad", "Squad Goals", "#ffffff", "80px", False,
     """<div style={{position: 'absolute', top: '15px', right: '15px', backgroundColor: '#ffd700', color: '#000', fontWeight: '900', padding: '5px 10px', transform: 'rotate(10deg)', border: '2px solid #000', boxShadow: '3px 3px 0 #000', fontSize: '1.2rem', fontFamily: '"Impact", sans-serif'}}>BFFs!</div><div style={{position: 'absolute', bottom: '20px', width: '100%', textAlign: 'center'}}><span style={{color: '#fff', backgroundColor: '#ff1493', padding: '5px 15px', border: '3px solid #000', boxShadow: '4px 4px 0 #000', fontFamily: '"Impact", sans-serif', fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '2px', display: 'inline-block', transform: 'rotate(-3deg)'}}>SQUAD GOALS</span></div>"""),

    # 11. Scrapbook
    ("scrapbook", "Scrapbook", "#fdf6e3", "110px", False,
     """<div style={{position:'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%) rotate(-3deg)', width: '100px', height: '30px', backgroundColor: 'rgba(255, 255, 255, 0.7)', backgroundImage: 'linear-gradient(45deg, transparent 40%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.05) 60%, transparent 60%)', backgroundSize: '10px 10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', zIndex: 10, borderLeft: '2px dashed rgba(255,255,255,0.5)', borderRight: '2px dashed rgba(255,255,255,0.5)'}}></div><div style={{position:'absolute', top: '0', left: '0', width: '20px', height: '20px', borderTop: '3px solid #c2b280', borderLeft: '3px solid #c2b280'}}></div><div style={{position:'absolute', top: '0', right: '0', width: '20px', height: '20px', borderTop: '3px solid #c2b280', borderRight: '3px solid #c2b280'}}></div><div style={{position:'absolute', bottom: '25px', left: '0', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}><div style={{backgroundColor: '#fff', padding: '5px 15px', border: '1px solid #e0d5c1', boxShadow: '2px 2px 5px rgba(0,0,0,0.05)', transform: 'rotate(-2deg)'}}><span style={{color: '#5c4a3d', fontFamily: '"Caveat", "Comic Sans MS", cursive', fontSize: '2.5rem', fontWeight: 'bold'}}>Best Friends</span></div></div>"""),

    # 12. Team Bride
    ("teambride", "Team Bride", "#fff0f5", "90px", False,
     """<div style={{position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ff69b4', opacity: 0.4}}></div><div style={{position: 'absolute', bottom: '25px', width: '100%', textAlign: 'center'}}><span style={{color: '#ff1493', fontFamily: '"Trebuchet MS", sans-serif', fontSize: '2.2rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '4px'}}>TEAM BRIDE</span></div>"""),

    # 13. Just Married
    ("justmarried", "Just Married", "#ffffff", "100px", False,
     """<div style={{position: 'absolute', bottom: '25px', width: '100%', textAlign: 'center'}}><span style={{color: '#333', fontFamily: '"Brush Script MT", cursive', fontSize: '3.5rem'}}>Just Married</span><div style={{fontSize: '1rem', color: '#666', letterSpacing: '5px', textTransform: 'uppercase'}}>Forever & Always</div></div>"""),

    # 14. Party Time
    ("party", "Party Time", "#000000", "90px", False,
     """<div style={{position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', border: '4px solid #39ff14', opacity: 0.8, boxShadow: 'inset 0 0 15px #39ff14, 0 0 15px #39ff14'}}></div><div style={{position: 'absolute', bottom: '25px', width: '100%', textAlign: 'center'}}><span style={{color: '#39ff14', fontFamily: '"Impact", sans-serif', fontSize: '2.8rem', letterSpacing: '4px', textShadow: '0 0 10px #39ff14'}}>PARTY TIME</span></div>"""),

    # 15. Best Husband
    ("besthusband", "Best Husband", "#e6f2ff", "100px", False,
     """<div style={{position: 'absolute', top: '15px', left: '15px', fontSize: '2.5rem', opacity: 0.8}}>🤵</div><div style={{position: 'absolute', bottom: '30px', width: '100%', textAlign: 'center'}}><span style={{color: '#0066cc', fontFamily: '"Georgia", serif', fontSize: '2.2rem', fontStyle: 'italic', fontWeight: 'bold'}}>Best Husband</span></div>"""),

    # 16. Best Wife
    ("bestwife", "Best Wife", "#fff0f5", "100px", False,
     """<div style={{position: 'absolute', top: '15px', left: '15px', fontSize: '2.5rem', opacity: 0.8}}>👰</div><div style={{position: 'absolute', bottom: '30px', width: '100%', textAlign: 'center'}}><span style={{color: '#cc0066', fontFamily: '"Georgia", serif', fontSize: '2.2rem', fontStyle: 'italic', fontWeight: 'bold'}}>Best Wife</span></div>""")
]

all_collage_frames_str = ""
for frame_data in frames_data:
    all_collage_frames_str += make_frame(*frame_data)

# Now we need to REPLACE all existing collage frames in App.tsx with our new generated string.
# In App.tsx, the frames start with `collage_strip3` (line 120 or so) and end with the last scrapbook grid4 frame.

pattern = r"(\{\s*id: 'collage_strip3'.*?\)\s*\}.*?\n)(\s*\{\s*id: 'f_none')"

new_content = re.sub(pattern, all_collage_frames_str.strip() + "\n\n\\2", content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Frames injected!")
