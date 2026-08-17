import re

with open('C:/Photo/booth-app/src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update text to Lumiere and add emojis
code = code.replace("InstaAR", "Lumière ✨")
code = code.replace("Live Facial Recognition & Augmented Reality.", "Capture your glowing moments 💖")
code = code.replace("Open Camera", "Tap to Begin 💖")
code = code.replace("Select a Frame", "Select a Frame 🎨")
code = code.replace("Export Final Photo", "Save & Share 💖")
code = code.replace("Processing Complete!", "Your Photo is Ready! ✨")

# 2. Change colors to young female touch
code = code.replace("backgroundColor: '#000'", "backgroundColor: '#fdf8f5'")
code = code.replace("color: '#fff'", "color: '#4a4a4a'")
code = code.replace("backgroundColor: '#111'", "backgroundColor: '#fff0f5'")
code = code.replace("backgroundColor: '#27272a'", "backgroundColor: '#fff'")
code = code.replace("color: '#888'", "color: '#ff69b4'")
code = code.replace("color: 'white'", "color: '#4a4a4a'")
code = code.replace("border: 'none'", "border: '2px solid #ffb6c1'")
code = code.replace("linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)", "linear-gradient(45deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)")
code = code.replace("backgroundColor: '#3b82f6'", "backgroundColor: '#ffb6c1'")
code = code.replace("color: 'black'", "color: '#4a4a4a'")
code = code.replace("backgroundColor: 'black'", "backgroundColor: '#fff0f5'")
code = code.replace("backgroundColor: '#444'", "backgroundColor: '#ffe4e1'")
code = code.replace("backgroundColor: '#10b981'", "backgroundColor: '#ffb6c1'")
code = code.replace("backgroundColor: '#ef4444'", "backgroundColor: '#ffb6c1'")
code = code.replace("color: 'white'", "color: '#4a4a4a'") # catch any remaining

# 3. Add dynamic frames fetch
fetch_code = """
  const [availableFrames, setAvailableFrames] = useState(FRAMES);

  useEffect(() => {
    if (appState === 'FRAME_SELECT') {
      fetch('http://localhost:5173/api/frames')
        .then(res => res.json())
        .then(data => {
          const approved = data.filter((f: any) => f.approved);
          setAvailableFrames([...FRAMES, ...approved]);
        })
        .catch(e => console.log('API error', e));
    }
  }, [appState]);

  const leftFrames = availableFrames.slice(0, Math.ceil(availableFrames.length / 2));
  const rightFrames = availableFrames.slice(Math.ceil(availableFrames.length / 2));
"""

# replace the static slicing
code = code.replace("const leftFrames = FRAMES.slice(0, Math.ceil(FRAMES.length / 2));\n  const rightFrames = FRAMES.slice(Math.ceil(FRAMES.length / 2));", fetch_code)

# 4. In the render loop for dynamic frames
dynamic_render = """
                  {selectedFrameId === 'none' && (
                     <>
                        <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css }} />
                        {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                     </>
                  )}
                  
                  {selectedFrameId === 'insta' && <FrameInsta />}
                  {selectedFrameId === 'social' && <FrameSocial />}
                  {selectedFrameId === 'magazine' && <FrameMagazine />}
                  {selectedFrameId === 'birthday' && <FrameBirthday />}
                  {selectedFrameId === 'wedding' && <FrameWedding />}
                  {selectedFrameId === 'love' && <FrameLove />}
                  {selectedFrameId === 'polaroid' && <FramePolaroid />}

                  {availableFrames.find(f => f.id === selectedFrameId && !['none','insta','social','magazine','birthday','wedding','love','polaroid'].includes(f.id)) && (
                     <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
                        <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css, zIndex: -2 }} />
                        {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }} />}
                        <img src={availableFrames.find(f => f.id === selectedFrameId)?.url} alt="Frame" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                     </div>
                  )}
"""

code = code.replace("""
                  {selectedFrameId === 'none' && (
                     <>
                        <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css }} />
                        {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                     </>
                  )}
                  
                  {selectedFrameId === 'insta' && <FrameInsta />}
                  {selectedFrameId === 'social' && <FrameSocial />}
                  {selectedFrameId === 'magazine' && <FrameMagazine />}
                  {selectedFrameId === 'birthday' && <FrameBirthday />}
                  {selectedFrameId === 'wedding' && <FrameWedding />}
                  {selectedFrameId === 'love' && <FrameLove />}
                  {selectedFrameId === 'polaroid' && <FramePolaroid />}
""", dynamic_render)

with open('C:/Photo/booth-app/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated theme and dynamic frames")
