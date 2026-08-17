$ErrorActionPreference = "Continue"

Write-Host "Updating App.tsx with 10 new milestone frames..."

$appPath = "c:\Photo\booth-app\src\App.tsx"
$lines = Get-Content $appPath

$newLines = @()
$framesInjected = $false
$componentsInjected = $false
$switchInjected = $false
$jsxInjected1 = $false
$jsxInjected2 = $false

$newFrameObjects = @'
  { id: 'valentine', name: 'Valentine''s Day' },
  { id: 'engagement', name: 'Engagement' },
  { id: 'anniversary', name: 'Anniversary' },
  { id: 'wife', name: 'Best Wife' },
  { id: 'husband', name: 'Best Husband' },
  { id: 'married', name: 'Just Married' },
  { id: 'floral', name: 'Spring Floral' },
  { id: 'rosegold', name: 'Rose Gold' },
  { id: 'coquette', name: 'Coquette Ribbon' },
  { id: 'vintagerose', name: 'Vintage Rose' },
'@

$newComponents = @'
  const FrameValentine = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box', zIndex: 5, boxShadow: 'inset 0 0 50px rgba(255,100,150,0.5)' }}>
       <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: imageFilters, zIndex: -2 }} />
       {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }} />}
       
       <div style={{ position: 'absolute', top: '-10px', left: '-10px', fontSize: '100px', transform: 'rotate(-20deg)', filter: 'drop-shadow(2px 2px 10px rgba(255,0,0,0.5))' }}>💝</div>
       <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', fontSize: '100px', transform: 'rotate(15deg)', filter: 'drop-shadow(-2px -2px 10px rgba(255,0,0,0.5))' }}>💖</div>
       <div style={{ position: 'absolute', top: '20px', right: '10px', fontSize: '50px' }}>🏹</div>
       <div style={{ position: 'absolute', bottom: '80px', left: '10px', fontSize: '60px' }}>💘</div>
       
       <div style={{ position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center' }}>
         <h1 style={{ fontFamily: '"Brush Script MT", cursive', fontSize: '60px', margin: 0, color: '#ff2a5f', textShadow: '2px 2px 0 #fff, -1px -1px 0 #fff, 0 5px 15px rgba(255,0,0,0.3)' }}>Happy Valentine's Day</h1>
       </div>
    </div>
  );

  const FrameEngagement = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box', zIndex: 5, border: '15px solid rgba(255,255,255,0.8)', boxShadow: 'inset 0 0 30px rgba(200,200,255,0.4)' }}>
       <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: imageFilters, zIndex: -2 }} />
       {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }} />}
       
       <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '80px', filter: 'drop-shadow(2px 2px 5px rgba(0,0,0,0.2))' }}>💍</div>
       <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '80px', filter: 'drop-shadow(2px 2px 5px rgba(0,0,0,0.2))' }}>✨</div>
       
       <div style={{ position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center' }}>
         <h1 style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif', fontSize: '50px', margin: 0, color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', letterSpacing: '4px' }}>SHE SAID YES</h1>
       </div>
    </div>
  );

  const FrameAnniversary = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box', zIndex: 5, border: '10px solid #D4AF37', outline: '4px solid #000', outlineOffset: '-14px' }}>
       <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: imageFilters, zIndex: -2 }} />
       {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }} />}
       
       <div style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '60px' }}>🥂</div>
       <div style={{ position: 'absolute', bottom: '80px', right: '20px', fontSize: '60px' }}>🍾</div>
       
       <div style={{ position: 'absolute', bottom: '30px', width: '100%', textAlign: 'center' }}>
         <h1 style={{ fontFamily: '"Georgia", serif', fontSize: '45px', margin: 0, color: '#D4AF37', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>Happy Anniversary</h1>
       </div>
    </div>
  );

  const FrameWife = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box', zIndex: 5, border: '20px solid rgba(255,192,203,0.6)', borderRadius: '20px' }}>
       <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: imageFilters, zIndex: -2 }} />
       {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }} />}
       
       <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '60px' }}>👑</div>
       <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '60px' }}>🌷</div>
       
       <div style={{ position: 'absolute', bottom: '30px', width: '100%', textAlign: 'center', backgroundColor: 'rgba(255,192,203,0.8)', padding: '10px 0' }}>
         <h1 style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif', fontSize: '40px', margin: 0, color: '#fff', textShadow: '1px 1px 2px #d81b60' }}>World's Best Wife ❤️</h1>
       </div>
    </div>
  );

  const FrameHusband = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box', zIndex: 5, border: '20px solid rgba(41,128,185,0.6)', borderRadius: '20px' }}>
       <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: imageFilters, zIndex: -2 }} />
       {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }} />}
       
       <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '60px' }}>🎩</div>
       <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '60px' }}>💼</div>
       
       <div style={{ position: 'absolute', bottom: '30px', width: '100%', textAlign: 'center', backgroundColor: 'rgba(41,128,185,0.8)', padding: '10px 0' }}>
         <h1 style={{ fontFamily: '"Impact", sans-serif', fontSize: '45px', margin: 0, color: '#fff', textShadow: '2px 2px 0 #000' }}>BEST HUSBAND EVER</h1>
       </div>
    </div>
  );

  const FrameMarried = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box', zIndex: 5, border: '25px solid rgba(255,255,255,0.9)', outline: '2px dashed #ccc', outlineOffset: '-15px' }}>
       <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: imageFilters, zIndex: -2 }} />
       {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }} />}
       
       <div style={{ position: 'absolute', top: '0', left: '0', fontSize: '70px', filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.1))' }}>🕊️</div>
       <div style={{ position: 'absolute', top: '0', right: '0', fontSize: '70px', filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.1))', transform: 'scaleX(-1)' }}>🕊️</div>
       
       <div style={{ position: 'absolute', bottom: '30px', width: '100%', textAlign: 'center' }}>
         <h1 style={{ fontFamily: '"Snell Roundhand", cursive', fontSize: '65px', margin: 0, color: '#333' }}>Just Married</h1>
       </div>
    </div>
  );

  const FrameFloral = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box', zIndex: 5, border: '8px solid #f8bbd0' }}>
       <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: imageFilters, zIndex: -2 }} />
       {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }} />}
       
       <div style={{ position: 'absolute', top: '-20px', left: '-20px', fontSize: '120px' }}>🌸</div>
       <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', fontSize: '120px' }}>🌺</div>
       <div style={{ position: 'absolute', top: '50%', left: '-10px', fontSize: '50px' }}>🍃</div>
       <div style={{ position: 'absolute', top: '50%', right: '-10px', fontSize: '50px' }}>🍃</div>
       
       <div style={{ position: 'absolute', bottom: '30px', width: '100%', textAlign: 'center' }}>
         <h1 style={{ fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '45px', margin: 0, color: '#fff', textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>Spring Beauty</h1>
       </div>
    </div>
  );

  const FrameRoseGold = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box', zIndex: 5, border: '2px solid #b76e79', boxShadow: 'inset 0 0 0 10px rgba(183,110,121,0.2), inset 0 0 0 12px #b76e79' }}>
       <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: imageFilters, zIndex: -2 }} />
       {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }} />}
       
       <div style={{ position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center' }}>
         <h1 style={{ fontFamily: '"Didot", "Bodoni MT", serif', fontSize: '40px', margin: 0, color: '#fff', textShadow: '1px 1px 2px rgba(183,110,121,0.8)', letterSpacing: '8px', textTransform: 'uppercase' }}>Elegance</h1>
       </div>
    </div>
  );

  const FrameCoquette = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box', zIndex: 5, border: '15px solid #ffe4e1', borderRadius: '40px' }}>
       <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: imageFilters, zIndex: -2 }} />
       {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }} />}
       
       <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', fontSize: '80px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🎀</div>
       <div style={{ position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)', fontSize: '80px', filter: 'drop-shadow(0 -2px 4px rgba(0,0,0,0.2))' }}>🎀</div>
       
       <div style={{ position: 'absolute', top: '15px', left: '15px', fontSize: '40px' }}>🦢</div>
       <div style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '40px' }}>🍒</div>
    </div>
  );

  const FrameVintageRose = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box', zIndex: 5, border: '12px solid #8b5a2b', boxShadow: 'inset 0 0 60px rgba(139,90,43,0.6)' }}>
       <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: imageFilters + ' sepia(0.5) contrast(1.1)', zIndex: -2 }} />
       {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }} />}
       
       <div style={{ position: 'absolute', top: '-10px', left: '-10px', fontSize: '90px', filter: 'sepia(0.4) brightness(0.8)' }}>🌹</div>
       <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', fontSize: '90px', filter: 'sepia(0.4) brightness(0.8)' }}>🌹</div>
       
       <div style={{ position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center' }}>
         <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '45px', margin: 0, color: '#f5deb3', textShadow: '2px 2px 4px #000' }}>Timeless</h1>
       </div>
    </div>
  );
'@

$newSwitch = @'
      case 'valentine': return <FrameValentine />;
      case 'engagement': return <FrameEngagement />;
      case 'anniversary': return <FrameAnniversary />;
      case 'wife': return <FrameWife />;
      case 'husband': return <FrameHusband />;
      case 'married': return <FrameMarried />;
      case 'floral': return <FrameFloral />;
      case 'rosegold': return <FrameRoseGold />;
      case 'coquette': return <FrameCoquette />;
      case 'vintagerose': return <FrameVintageRose />;
'@

$newJsx = @'
                  {selectedFrameId === 'valentine' && <FrameValentine />}
                  {selectedFrameId === 'engagement' && <FrameEngagement />}
                  {selectedFrameId === 'anniversary' && <FrameAnniversary />}
                  {selectedFrameId === 'wife' && <FrameWife />}
                  {selectedFrameId === 'husband' && <FrameHusband />}
                  {selectedFrameId === 'married' && <FrameMarried />}
                  {selectedFrameId === 'floral' && <FrameFloral />}
                  {selectedFrameId === 'rosegold' && <FrameRoseGold />}
                  {selectedFrameId === 'coquette' && <FrameCoquette />}
                  {selectedFrameId === 'vintagerose' && <FrameVintageRose />}
'@

for ($i = 0; $i < $lines.Count; $i++) {
    $line = $lines[$i]
    
    # 1. Inject into FRAMES array
    if (-not $framesInjected -and $line -match "id: 'cinema'") {
        $newLines += $line + ","
        $newLines += $newFrameObjects
        $framesInjected = $true
        continue
    }
    
    # 2. Inject Components before renderFrameContent
    if (-not $componentsInjected -and $line -match "const renderFrameContent = ") {
        $newLines += $newComponents
        $newLines += $line
        $componentsInjected = $true
        continue
    }
    
    # 3. Inject Switch Cases
    if (-not $switchInjected -and $line -match "case 'cinema': return <FrameCinema />;") {
        $newLines += $line
        $newLines += $newSwitch
        $switchInjected = $true
        continue
    }
    
    # 4 & 5. Inject JSX conditionals
    if ($line -match "\{selectedFrameId === 'cinema' && <FrameCinema />\}") {
        $newLines += $line
        $newLines += $newJsx
        if (-not $jsxInjected1) { $jsxInjected1 = $true } else { $jsxInjected2 = $true }
        continue
    }
    
    $newLines += $line
}

Set-Content $appPath -Value ($newLines -join "`r`n")
Write-Host "Injection completed successfully!"
