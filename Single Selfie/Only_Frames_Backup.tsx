const FRAMES = [

    { 
      id: 'collage_strip3_classic', name: 'CLASSIC', layout: 'strip3', side: 'left', style: { border: '15px solid #fff', borderBottomWidth: '50px', backgroundColor: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0' },
      overlay: (
        <div style={{position:'absolute', bottom: '15px', left: '0', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#888', fontFamily: 'sans-serif', letterSpacing: '4px', textTransform: 'uppercase'}}>CLASSIC</span>
        </div>
      )
    },
    { 
      id: 'collage_grid4_classic', name: 'CLASSIC', layout: 'grid4', side: 'left', style: { border: '15px solid #fff', borderBottomWidth: '50px', backgroundColor: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0' },
      overlay: (
        <div style={{position:'absolute', bottom: '15px', left: '0', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#888', fontFamily: 'sans-serif', letterSpacing: '4px', textTransform: 'uppercase'}}>CLASSIC</span>
        </div>
      )
    },
    { 
      id: 'collage_strip3_glamour', name: 'Glamour', layout: 'strip3', side: 'left', style: { border: '15px solid #000', borderBottomWidth: '60px', backgroundColor: '#000' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0' },
      overlay: (
        <div style={{position:'absolute', bottom: '15px', left: '0', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#d4af37', fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '1.2rem', letterSpacing: '2px'}}>Glamour</span>
        </div>
      )
    },
    { 
      id: 'collage_grid4_glamour', name: 'Glamour', layout: 'grid4', side: 'left', style: { border: '15px solid #000', borderBottomWidth: '60px', backgroundColor: '#000' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0' },
      overlay: (
        <div style={{position:'absolute', bottom: '15px', left: '0', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#d4af37', fontFamily: '"Georgia", serif', fontStyle: 'italic', fontSize: '1.2rem', letterSpacing: '2px'}}>Glamour</span>
        </div>
      )
    },
    { 
      id: 'collage_strip3_forever', name: 'FOREVER', layout: 'strip3', side: 'left', style: { border: '20px solid #fff', borderBottomWidth: '80px', backgroundColor: '#fff', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0' },
      overlay: (
        <div style={{position:'absolute', bottom: '25px', left: '0', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#ccc', fontFamily: '"Georgia", serif', fontSize: '1.1rem', letterSpacing: '4px'}}>FOREVER</span>
        </div>
      )
    },
    { 
      id: 'collage_grid4_forever', name: 'FOREVER', layout: 'grid4', side: 'left', style: { border: '20px solid #fff', borderBottomWidth: '80px', backgroundColor: '#fff', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0' },
      overlay: (
        <div style={{position:'absolute', bottom: '25px', left: '0', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#ccc', fontFamily: '"Georgia", serif', fontSize: '1.1rem', letterSpacing: '4px'}}>FOREVER</span>
        </div>
      )
    },
    { 
      id: 'collage_strip3_love', name: 'Soulmates', layout: 'strip3', side: 'right', style: { border: '25px solid #ffe4e1', borderBottomWidth: '80px', backgroundColor: '#ffe4e1' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0', backgroundColor: '#ffe4e1' },
      overlay: (
        <div style={{position:'absolute', bottom: '20px', left: '0', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#ff6b81', fontFamily: '"Brush Script MT", cursive', fontSize: '2.5rem'}}>Soulmates</span>
          <div style={{position: 'absolute', top: '-10px', left: '20px', color: '#ff4757', fontSize: '2rem'}}>❤</div>
          <div style={{position: 'absolute', top: '10px', right: '25px', color: '#ff4757', fontSize: '1.5rem'}}>❤</div>
        </div>
      )
    },
    { 
      id: 'collage_grid4_love', name: 'Soulmates', layout: 'grid4', side: 'right', style: { border: '25px solid #ffe4e1', borderBottomWidth: '80px', backgroundColor: '#ffe4e1' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0', backgroundColor: '#ffe4e1' },
      overlay: (
        <div style={{position:'absolute', bottom: '20px', left: '0', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#ff6b81', fontFamily: '"Brush Script MT", cursive', fontSize: '2.5rem'}}>Soulmates</span>
          <div style={{position: 'absolute', top: '-10px', left: '20px', color: '#ff4757', fontSize: '2rem'}}>❤</div>
          <div style={{position: 'absolute', top: '10px', right: '25px', color: '#ff4757', fontSize: '1.5rem'}}>❤</div>
        </div>
      )
    },
    { 
      id: 'collage_strip3_squad', name: 'SQUAD GOALS', layout: 'strip3', side: 'right', style: { border: '20px solid #fff', borderBottomWidth: '70px', backgroundColor: '#fff', boxShadow: 'inset 0 0 0 5px #1e90ff' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0', backgroundColor: '#fff' },
      overlay: (
        <div style={{position:'absolute', bottom: '15px', left: '0', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#ff1493', fontFamily: '"Impact", sans-serif', fontSize: '2.2rem', textTransform: 'uppercase', letterSpacing: '3px', textShadow: '2px 2px 0px #ffd700'}}>SQUAD GOALS</span>
        </div>
      )
    },
    { 
      id: 'collage_grid4_squad', name: 'SQUAD GOALS', layout: 'grid4', side: 'right', style: { border: '20px solid #fff', borderBottomWidth: '70px', backgroundColor: '#fff', boxShadow: 'inset 0 0 0 5px #1e90ff' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0', backgroundColor: '#fff' },
      overlay: (
        <div style={{position:'absolute', bottom: '15px', left: '0', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#ff1493', fontFamily: '"Impact", sans-serif', fontSize: '2.2rem', textTransform: 'uppercase', letterSpacing: '3px', textShadow: '2px 2px 0px #ffd700'}}>SQUAD GOALS</span>
        </div>
      )
    },
    { 
      id: 'collage_strip3_scrapbook', name: 'Best Friends', layout: 'strip3', side: 'right', style: { border: '30px solid #f4ecd8', borderBottomWidth: '90px', backgroundColor: '#f4ecd8' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0', backgroundColor: '#f4ecd8' },
      overlay: (
        <>
          <div style={{position:'absolute', top: '5px', left: '50%', transform: 'translateX(-50%)', width: '60px', height: '20px', backgroundColor: 'rgba(255,255,255,0.6)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', zIndex: 10, rotate: '-2deg'}}></div>
          <div style={{position:'absolute', bottom: '25px', left: '0', width: '100%', textAlign: 'center'}}>
            <span style={{color: '#5c4a3d', fontFamily: '"Courier New", monospace', fontSize: '1.6rem', fontWeight: 'bold'}}>Best Friends</span>
          </div>
        </>
      )
    },
    { 
      id: 'collage_grid4_scrapbook', name: 'Best Friends', layout: 'grid4', side: 'right', style: { border: '30px solid #f4ecd8', borderBottomWidth: '90px', backgroundColor: '#f4ecd8' }, imageStyle: { top: '0', bottom: '0', left: '0', right: '0', backgroundColor: '#f4ecd8' },
      overlay: (
        <>
          <div style={{position:'absolute', top: '5px', left: '50%', transform: 'translateX(-50%)', width: '60px', height: '20px', backgroundColor: 'rgba(255,255,255,0.6)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', zIndex: 10, rotate: '-2deg'}}></div>
          <div style={{position:'absolute', bottom: '25px', left: '0', width: '100%', textAlign: 'center'}}>
            <span style={{color: '#5c4a3d', fontFamily: '"Courier New", monospace', fontSize: '1.6rem', fontWeight: 'bold'}}>Best Friends</span>
          </div>
        </>
      )
    },  { 
    id: 'f_none', name: 'No Frame', style: { border: '0px' }, imageStyle: { top: 0, bottom: 0, left: 0, right: 0 },
    overlay: null
  },
  {
      id: 'f1', name: 'Instagram', style: { border: '15px solid white', borderBottomWidth: '120px', borderTopWidth: '70px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }, imageStyle: { top: '70px', bottom: '120px', left: '15px', right: '15px' },
      overlay: (
        <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
          {/* Header */}
          <div style={{position:'absolute', top: '-55px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <div style={{width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                 <div style={{width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <img src="/logo.png" style={{width:'28px', height:'28px', borderRadius:'50%', objectFit:'cover'}} />
                 </div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <span style={{fontWeight: '600', fontSize: '0.95rem', color: '#262626', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'}}>wcs_photobooth</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#3897f0"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z"/></svg>
                </div>
                <span style={{fontSize: '0.75rem', color: '#8e8e8e', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'}}>Your City, USA</span>
              </div>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#262626"><circle cx="12" cy="12" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>
          </div>
          
          {/* Footer */}
          <div style={{position:'absolute', bottom: '-105px', left: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{display: 'flex', gap: '16px'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'}}>
              <span style={{fontWeight: '600', fontSize: '0.9rem', color: '#262626', display: 'block', marginBottom: '4px'}}>1,452 likes</span>
              <span style={{fontWeight: '600', fontSize: '0.9rem', color: '#262626'}}>wcs_photobooth </span>
              <span style={{fontSize: '0.9rem', color: '#262626'}}>Having the best time! ✨📸 #photobooth #memories</span>
            </div>
          </div>
        </div>
      )
    },
  {
      id: 'f2', name: 'Facebook', style: { border: '15px solid white', borderTopWidth: '70px', borderBottomWidth: '100px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }, imageStyle: { top: '70px', bottom: '100px', left: '15px', right: '15px' },
      overlay: (
        <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
          {/* Header */}
          <div style={{position:'absolute', top: '-60px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <div style={{width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #ddd'}}>
                <img src="/logo.png" style={{width:'100%', height:'100%', objectFit:'cover'}} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <span style={{fontWeight: 'bold', fontSize: '0.95rem', color: '#050505', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif'}}>WCS Events</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z"/></svg>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <span style={{fontSize: '0.8rem', color: '#65676B', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif'}}>2h • </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#65676B"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                </div>
              </div>
            </div>
            <div style={{display: 'flex', gap: '15px'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#65676B"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#65676B" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
          </div>

          {/* Footer */}
          <div style={{position:'absolute', bottom: '-90px', left: '10px', right: '10px', display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #CED0D4', paddingBottom: '8px', marginBottom: '8px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                 <div style={{width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M23 10h-8.5l1.3-6.5c.1-.4-.1-.8-.4-1.1-.3-.3-.8-.4-1.1-.2L4 12v10h14c1 0 1.9-.7 2.1-1.6l1.9-8.5v-.4c0-.8-.7-1.5-1.5-1.5H23zM2 12h3v10H2z"/></svg>
                 </div>
                 <div style={{width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#F02849', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '-6px', border: '1px solid white'}}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                 </div>
                 <span style={{fontSize: '0.9rem', color: '#65676B', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif', marginLeft: '4px'}}>2.4K</span>
              </div>
              <div style={{display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#65676B', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif'}}>
                <span>124 comments</span>
                <span>45 shares</span>
              </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#65676B', fontWeight: '600', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                Like
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#65676B', fontWeight: '600', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                Comment
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#65676B', fontWeight: '600', fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 14v5s0 3-4 3c-4 0-4-3-4-3v-5H2L12 2l10 12h-3v5s0 3-4 3c-4 0-4-3-4-3v-5h-2z"/></svg>
                Share
              </div>
            </div>
          </div>
        </div>
      )
    }

  ,{
      id: 'f3_youtube', name: 'YouTube', style: { border: '15px solid white', borderTopWidth: '60px', borderBottomWidth: '150px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }, imageStyle: { top: '60px', bottom: '150px', left: '15px', right: '15px' },
      overlay: (
        <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
          {/* Header */}
          <div style={{position:'absolute', top: '-45px', left: '10px', right: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
              <div style={{width: '32px', height: '22px', backgroundColor: '#FF0000', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                 <div style={{width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid white', marginLeft: '3px'}}></div>
              </div>
              <span style={{fontWeight: '700', fontSize: '1.2rem', letterSpacing: '-1px', color: '#000', fontFamily: 'Roboto, Arial, sans-serif'}}>YouTube</span>
            </div>
            <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <div style={{width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#eee', border: '1px solid #ccc', overflow: 'hidden'}}>
                 <img src="/logo.png" style={{width:'100%', height:'100%', objectFit:'cover'}} />
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div style={{position:'absolute', bottom: '-135px', left: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <div>
              <h3 style={{margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: '500', color: '#0F0F0F', fontFamily: 'Roboto, Arial, sans-serif', lineHeight: '1.2'}}>Ultimate Photobooth Experience! 📸✨</h3>
              <p style={{margin: 0, fontSize: '0.85rem', color: '#606060', fontFamily: 'Roboto, Arial, sans-serif'}}>1.2M views • 2 days ago</p>
            </div>
            
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <div style={{width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#eee', overflow: 'hidden'}}>
                  <img src="/logo.png" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                </div>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <span style={{fontWeight: '500', fontSize: '0.9rem', color: '#0F0F0F', fontFamily: 'Roboto, Arial, sans-serif'}}>WCS Events</span>
                  <span style={{fontSize: '0.75rem', color: '#606060', fontFamily: 'Roboto, Arial, sans-serif'}}>105K subscribers</span>
                </div>
              </div>
              <button style={{backgroundColor: '#0F0F0F', color: 'white', border: 'none', borderRadius: '20px', padding: '6px 12px', fontWeight: '500', fontSize: '0.85rem', fontFamily: 'Roboto, Arial, sans-serif'}}>Subscribe</button>
            </div>

            <div style={{display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px', whiteSpace: 'nowrap'}} className="no-scrollbar">
              <div style={{display: 'flex', alignItems: 'center', backgroundColor: '#F2F2F2', borderRadius: '20px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRight: '1px solid #D9D9D9'}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="1.5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                  <span style={{fontWeight: '500', fontSize: '0.85rem', fontFamily: 'Roboto, Arial, sans-serif'}}>125K</span>
                </div>
                <div style={{padding: '6px 12px'}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="1.5" style={{transform: 'rotate(180deg)'}}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F2F2F2', borderRadius: '20px', padding: '6px 12px'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="1.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                <span style={{fontWeight: '500', fontSize: '0.85rem', fontFamily: 'Roboto, Arial, sans-serif'}}>Share</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F2F2F2', borderRadius: '20px', padding: '6px 12px'}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span style={{fontWeight: '500', fontSize: '0.85rem', fontFamily: 'Roboto, Arial, sans-serif'}}>Download</span>
              </div>
            </div>
          </div>
        </div>
      )
    }

  ,{ 
    id: 'f4_birthday', name: 'Birthday', style: { border: '15px solid #F2C1D1', borderBottomWidth: '100px', borderTopWidth: '80px' }, imageStyle: { top: '80px', bottom: '100px', left: '15px', right: '15px' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
        
        {/* Top Header */}
        <div style={{position:'absolute', top: '15px', left: '15px', right: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50px'}}>
           <div style={{fontFamily: "'Great Vibes', cursive, 'Brush Script MT', serif", fontSize: '3rem', color: '#333', textShadow: '2px 2px 4px rgba(0,0,0,0.2)', letterSpacing: '2px'}}>Happy Birthday</div>
           <div style={{position: 'absolute', left: '10px', fontSize: '2rem'}}>🎈</div>
           <div style={{position: 'absolute', right: '10px', fontSize: '2rem'}}>🎉</div>
        </div>
        
        {/* Bottom Details */}
        <div style={{position:'absolute', bottom: '15px', left: '15px', right: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70px'}}>
           <div style={{fontSize: '1.8rem', fontWeight: 'bold', color: '#333', textTransform: 'uppercase', letterSpacing: '4px'}}>Let's Celebrate!</div>
           <div style={{fontSize: '1.5rem', marginTop: '5px'}}>🎂 🎁 🍾</div>
        </div>
      </div>
    )
  }
  ,{ 
    id: 'f5_baby_bday', name: 'Baby Bday', style: { border: '20px solid #FFB5A7', borderBottomWidth: '110px', borderTopWidth: '90px', borderRadius: '30px' }, imageStyle: { top: '90px', bottom: '110px', left: '20px', right: '20px', borderRadius: '10px' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
        
        {/* Decorative clouds/shapes */}
        <div style={{position:'absolute', top: '-80px', left: '30px', fontSize: '2.5rem', opacity: 0.8}}>☁️</div>
        <div style={{position:'absolute', top: '-65px', right: '30px', fontSize: '2rem', opacity: 0.8}}>☁️</div>
        
        {/* Top Header */}
        <div style={{position:'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50px'}}>
           <div style={{fontFamily: "'Comic Sans MS', 'Chalkboard SE', sans-serif", fontSize: '2.2rem', color: '#FFFFFF', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.2)'}}>Happy Birthday!</div>
        </div>
        
        {/* Bottom Details */}
        <div style={{position:'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70px'}}>
           <div style={{display: 'flex', gap: '25px', fontSize: '2.5rem'}}>
             <span>🧸</span>
             <span>🍼</span>
             <span>🦄</span>
           </div>
           <div style={{fontFamily: "'Comic Sans MS', 'Chalkboard SE', sans-serif", fontSize: '1.2rem', color: '#A0C4FF', fontWeight: 'bold', marginTop: '10px', letterSpacing: '2px'}}>Our Little Miracle</div>
        </div>
      </div>
    )
  }

  ,{ 
    id: 'f6_team_bride', name: 'Team Bride', style: { border: '0px' }, imageStyle: { top: '100px', bottom: '120px', left: '25px', right: '25px', borderRadius: '4px', boxShadow: '0 0 15px rgba(212,175,55,0.2)' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', borderRadius: '10px', overflow: 'hidden'}}>
        
        {/* Ivory/Champagne Gradient Borders */}
        <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100px', background: 'linear-gradient(to right, #FDF5E6, #FFFAF0, #FDF5E6)', borderBottom: '1px solid #D4AF37', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'}}></div>
        <div style={{position:'absolute', bottom: 0, left: 0, width: '100%', height: '120px', background: 'linear-gradient(to right, #FDF5E6, #FFFAF0, #FDF5E6)', borderTop: '1px solid #D4AF37', boxShadow: '0 -2px 8px rgba(0,0,0,0.03)'}}></div>
        <div style={{position:'absolute', top: '100px', bottom: '120px', left: 0, width: '25px', background: '#FDF5E6', borderRight: '1px solid #D4AF37'}}></div>
        <div style={{position:'absolute', top: '100px', bottom: '120px', right: 0, width: '25px', background: '#FDF5E6', borderLeft: '1px solid #D4AF37'}}></div>

        {/* Elegant Gold Inner Double Border */}
        <div style={{position:'absolute', top: '94px', bottom: '114px', left: '19px', right: '19px', border: '1px solid rgba(212,175,55,0.5)', borderRadius: '6px'}}></div>

        {/* Delicate Corner Accents */}
        <div style={{position:'absolute', top: '20px', left: '20px', fontSize: '1.5rem', opacity: 0.7}}>🕊️</div>
        <div style={{position:'absolute', top: '20px', right: '20px', fontSize: '1.5rem', opacity: 0.7}}>🕊️</div>
        <div style={{position:'absolute', bottom: '25px', left: '25px', fontSize: '2rem'}}>🤍</div>
        <div style={{position:'absolute', bottom: '25px', right: '25px', fontSize: '2rem'}}>🤍</div>

        {/* Top Header */}
        <div style={{position:'absolute', top: '25px', left: '20px', right: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50px'}}>
           <div style={{fontFamily: "'Great Vibes', cursive, 'Brush Script MT', serif", fontSize: '3.6rem', color: '#B8860B', textShadow: '1px 1px 0px #FFF, 2px 2px 5px rgba(212,175,55,0.3)', letterSpacing: '2px'}}>Team Bride 💍</div>
        </div>
        
        {/* Bottom Details */}
        <div style={{position:'absolute', bottom: '30px', left: '20px', right: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60px'}}>
           <div style={{fontFamily: "'Playfair Display', 'Times New Roman', serif", fontSize: '1.2rem', color: '#555', letterSpacing: '6px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '10px'}}>Bachelorette</div>
           <div style={{display: 'flex', gap: '35px', fontSize: '1.8rem'}}>
             <span style={{filter: 'drop-shadow(1px 1px 2px rgba(212,175,55,0.3))'}}>✨</span>
             <span style={{filter: 'drop-shadow(1px 1px 2px rgba(212,175,55,0.3))'}}>🥂</span>
             <span style={{filter: 'drop-shadow(1px 1px 2px rgba(212,175,55,0.3))'}}>✨</span>
           </div>
        </div>
      </div>
    )
  }
  ,{ 
    id: 'f7_wedding_vibes', name: 'Wedding Vibes', style: { border: '0px' }, imageStyle: { top: '80px', bottom: '110px', left: '20px', right: '20px', borderRadius: '4px', boxShadow: '0 0 15px rgba(212,175,55,0.2)' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', borderRadius: '10px', overflow: 'hidden'}}>
        
        {/* Ivory/Champagne Gradient Borders */}
        <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '80px', background: 'linear-gradient(to right, #FDF5E6, #FFFAF0, #FDF5E6)', borderBottom: '1px solid #D4AF37', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'}}></div>
        <div style={{position:'absolute', bottom: 0, left: 0, width: '100%', height: '110px', background: 'linear-gradient(to right, #FDF5E6, #FFFAF0, #FDF5E6)', borderTop: '1px solid #D4AF37', boxShadow: '0 -2px 8px rgba(0,0,0,0.03)'}}></div>
        <div style={{position:'absolute', top: '80px', bottom: '110px', left: 0, width: '20px', background: '#FDF5E6', borderRight: '1px solid #D4AF37'}}></div>
        <div style={{position:'absolute', top: '80px', bottom: '110px', right: 0, width: '20px', background: '#FDF5E6', borderLeft: '1px solid #D4AF37'}}></div>

        {/* Elegant Gold Inner Double Border */}
        <div style={{position:'absolute', top: '74px', bottom: '104px', left: '14px', right: '14px', border: '1px solid rgba(212,175,55,0.5)', borderRadius: '6px'}}></div>

        {/* Minimalist Accents */}
        <div style={{position:'absolute', top: '15px', left: '25px', fontSize: '1.2rem', opacity: 0.8}}>✨</div>
        <div style={{position:'absolute', top: '15px', right: '25px', fontSize: '1.2rem', opacity: 0.8}}>✨</div>

        {/* Top Header */}
        <div style={{position:'absolute', top: '15px', left: '20px', right: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50px'}}>
           <div style={{fontFamily: "'Playfair Display', 'Times New Roman', serif", fontSize: '2.4rem', color: '#333', fontWeight: 'bold', fontStyle: 'italic', textShadow: '1px 1px 0px #FFF, 2px 2px 4px rgba(0,0,0,0.1)'}}>Best Day Ever</div>
        </div>
        
        {/* Bottom Details */}
        <div style={{position:'absolute', bottom: '25px', left: '20px', right: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60px'}}>
           <div style={{fontFamily: "'Playfair Display', 'Times New Roman', serif", fontSize: '1.6rem', color: '#222', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '5px'}}>Mr. & Mrs.</div>
           <div style={{fontFamily: "'Helvetica Neue', sans-serif", fontSize: '1rem', color: '#666', letterSpacing: '2px', textTransform: 'uppercase'}}>Celebrating Love 🕊️ 2026</div>
        </div>
      </div>
    )
  }

  ,{ 
    id: 'f8_coquette', name: 'Coquette', style: { border: '20px solid #FFF0F5', borderBottomWidth: '80px', borderTopWidth: '60px', borderRadius: '15px' }, imageStyle: { top: '60px', bottom: '80px', left: '20px', right: '20px', borderRadius: '5px' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
        <div style={{position:'absolute', top: '-50px', left: '20px', right: '20px', textAlign: 'center'}}>
           <div style={{fontFamily: "'Great Vibes', cursive", fontSize: '2.5rem', color: '#FFB6C1'}}>🎀 Coquette 🎀</div>
        </div>
        <div style={{position:'absolute', bottom: '-65px', left: '20px', right: '20px', textAlign: 'center'}}>
           <div style={{fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#FF69B4', fontStyle: 'italic'}}>sweet & lovely</div>
        </div>
        <div style={{position:'absolute', top: '50px', left: '10px', fontSize: '2rem'}}>🩰</div>
        <div style={{position:'absolute', top: '50px', right: '10px', fontSize: '2rem'}}>🩰</div>
        <div style={{position:'absolute', bottom: '70px', left: '10px', fontSize: '2rem'}}>🦢</div>
        <div style={{position:'absolute', bottom: '70px', right: '10px', fontSize: '2rem'}}>🦢</div>
      </div>
    )
  }
  ,{ 
    id: 'f10_y2k', name: 'Y2K', style: { border: '0px' }, imageStyle: { top: '50px', bottom: '50px', left: '25px', right: '25px', borderRadius: '50px' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
        <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '50px', background: 'linear-gradient(to bottom, #DDA0DD, #8A2BE2)'}}></div>
        <div style={{position:'absolute', bottom: 0, left: 0, width: '100%', height: '50px', background: 'linear-gradient(to top, #DDA0DD, #8A2BE2)'}}></div>
        <div style={{position:'absolute', top: '50px', bottom: '50px', left: 0, width: '25px', background: '#8A2BE2'}}></div>
        <div style={{position:'absolute', top: '50px', bottom: '50px', right: 0, width: '25px', background: '#8A2BE2'}}></div>
        
        <div style={{position:'absolute', top: '15px', width: '100%', textAlign: 'center'}}>
           <div style={{fontFamily: "'Courier New', monospace", fontSize: '2rem', color: '#FFF', textShadow: '0 0 10px #00FFFF'}}>*~ CYBER GLAM ~*</div>
        </div>
        <div style={{position:'absolute', bottom: '15px', width: '100%', textAlign: 'center', fontSize: '2rem'}}>
           💿 🦋 💖
        </div>
        <div style={{position:'absolute', top: '50px', bottom: '50px', left: '25px', right: '25px', borderRadius: '50px', border: '3px solid #00FFFF', boxShadow: 'inset 0 0 15px #FF00FF, 0 0 15px #FF00FF'}}></div>
      </div>
    )
  }
  ,{ 
    id: 'f12_film', name: 'Film Strip', style: { border: '30px solid #111', borderTopWidth: '30px', borderBottomWidth: '30px' }, imageStyle: { top: '30px', bottom: '30px', left: '30px', right: '30px' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
        {/* Left film holes */}
        <div style={{position:'absolute', top: 0, bottom: 0, left: '5px', width: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center'}}>
           {[...Array(12)].map((_, i) => <div key={'l'+i} style={{width: '12px', height: '18px', backgroundColor: '#FFF', borderRadius: '2px'}}></div>)}
        </div>
        {/* Right film holes */}
        <div style={{position:'absolute', top: 0, bottom: 0, right: '5px', width: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center'}}>
           {[...Array(12)].map((_, i) => <div key={'r'+i} style={{width: '12px', height: '18px', backgroundColor: '#FFF', borderRadius: '2px'}}></div>)}
        </div>
        
        <div style={{position:'absolute', bottom: '5px', left: '35px', color: '#FFCC00', fontSize: '10px', fontFamily: 'monospace'}}>KODAK PORTRA 400</div>
        <div style={{position:'absolute', top: '5px', right: '35px', color: '#FFCC00', fontSize: '10px', fontFamily: 'monospace', transform: 'rotate(180deg)'}}>KODAK PORTRA 400</div>
      </div>
    )
  }

  ,{ 
    id: 'f_wedding_right', name: 'Happy Wedding', side: 'right', style: { border: '25px solid #FFFAF0', borderBottomWidth: '140px', borderTopWidth: '90px', borderRadius: '15px' }, imageStyle: { top: '90px', bottom: '140px', left: '25px', right: '25px', borderRadius: '15px', border: '4px double #EEDD82' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box'}}>

        {/* Ethereal Glow at the bottom (opacity over border, NOT over selfie) */}
        <div style={{position:'absolute', bottom: '0px', left: '0px', right: '0px', height: '100px', background: 'linear-gradient(to top, rgba(212,175,55,0.1), transparent)', borderRadius: '0 0 15px 15px'}}></div>

        {/* Delicate Corner Filigree using SVG */}
        <svg style={{position:'absolute', top: '20px', left: '20px', opacity: 0.8}} width="50" height="50" viewBox="0 0 100 100">
           <path d="M0,0 C50,0 100,50 100,100 L95,100 C95,55 55,15 10,15 L10,100 L0,100 Z" fill="#D4AF37" />
           <circle cx="20" cy="20" r="4" fill="#D4AF37" />
           <circle cx="35" cy="15" r="3" fill="#D4AF37" />
           <circle cx="15" cy="35" r="3" fill="#D4AF37" />
        </svg>
        <svg style={{position:'absolute', top: '20px', right: '20px', opacity: 0.8, transform: 'scaleX(-1)'}} width="50" height="50" viewBox="0 0 100 100">
           <path d="M0,0 C50,0 100,50 100,100 L95,100 C95,55 55,15 10,15 L10,100 L0,100 Z" fill="#D4AF37" />
           <circle cx="20" cy="20" r="4" fill="#D4AF37" />
           <circle cx="35" cy="15" r="3" fill="#D4AF37" />
           <circle cx="15" cy="35" r="3" fill="#D4AF37" />
        </svg>

        {/* Interlocking Wedding Rings Top Center */}
        <svg style={{position:'absolute', top: '25px', left: '50%', transform: 'translateX(-50%)', opacity: 0.9, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'}} width="80" height="45" viewBox="0 0 100 60">
           <circle cx="40" cy="30" r="18" fill="none" stroke="#D4AF37" strokeWidth="4" />
           <circle cx="60" cy="30" r="18" fill="none" stroke="#D4AF37" strokeWidth="4" />
           <circle cx="45" cy="20" r="3" fill="#FFF" stroke="#D4AF37" strokeWidth="1" />
        </svg>
        
        {/* Subtle Magical Sparkles */}
        <div style={{position:'absolute', top: '100px', left: '10px', fontSize: '1.2rem', opacity: 0.6}}>✨</div>
        <div style={{position:'absolute', top: '150px', right: '10px', fontSize: '1.5rem', opacity: 0.5}}>✨</div>
        <div style={{position:'absolute', bottom: '160px', left: '15px', fontSize: '1.5rem', opacity: 0.4}}>✨</div>
        <div style={{position:'absolute', bottom: '180px', right: '12px', fontSize: '1.2rem', opacity: 0.6}}>✨</div>

        {/* Delicate Pearl Accents on inner border */}
        <div style={{position:'absolute', top: '83px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '30px'}}>
           {[...Array(5)].map((_, i) => (
             <div key={`pt_${i}`} style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFF', boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.15)'}}></div>
           ))}
        </div>
        <div style={{position:'absolute', bottom: '143px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '30px'}}>
           {[...Array(5)].map((_, i) => (
             <div key={`pb_${i}`} style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFF', boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.15)'}}></div>
           ))}
        </div>

        <div style={{position:'absolute', bottom: '60px', width: '100%', textAlign: 'center'}}>
           <div style={{fontFamily: "'Great Vibes', cursive", fontSize: '4.2rem', color: '#D4AF37', textShadow: '1px 1px 4px rgba(0,0,0,0.15)', lineHeight: '1'}}>Happy Wedding</div>
        </div>
        
        <div style={{position:'absolute', bottom: '25px', width: '100%', textAlign: 'center'}}>
           <div style={{fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#8B7355', letterSpacing: '8px', textTransform: 'uppercase', fontStyle: 'italic'}}>Bride & Groom</div>
        </div>
      </div>
    )
  }
  ,{ 
    id: 'f_best_husband', name: 'Best Husband', side: 'right', style: { border: '20px solid #111', borderBottomWidth: '100px', borderTopWidth: '40px', borderRadius: '10px' }, imageStyle: { top: '40px', bottom: '100px', left: '20px', right: '20px', borderRadius: '5px', border: '3px solid #D4AF37' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box'}}>
        <div style={{position:'absolute', bottom: '45px', width: '100%', textAlign: 'center'}}>
           <div style={{fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#FFF', letterSpacing: '8px', textTransform: 'uppercase'}}>Best Husband</div>
        </div>
        <div style={{position:'absolute', bottom: '20px', width: '100%', textAlign: 'center'}}>
           <div style={{fontFamily: "'Playfair Display', serif", fontSize: '0.9rem', color: '#D4AF37', letterSpacing: '4px', textTransform: 'uppercase', fontStyle: 'italic'}}>To have and to hold</div>
        </div>
        {/* Sleek gold corner lines */}
        <div style={{position:'absolute', top: '15px', left: '15px', width: '30px', height: '30px', borderTop: '2px solid #D4AF37', borderLeft: '2px solid #D4AF37'}}></div>
        <div style={{position:'absolute', top: '15px', right: '15px', width: '30px', height: '30px', borderTop: '2px solid #D4AF37', borderRight: '2px solid #D4AF37'}}></div>
      </div>
    )
  }
  ,{ 
    id: 'f_best_wife', name: 'Best Wife', side: 'right', style: { border: '25px solid #FFF5EE', borderBottomWidth: '120px', borderTopWidth: '70px', borderRadius: '15px' }, imageStyle: { top: '70px', bottom: '120px', left: '25px', right: '25px', borderRadius: '10px', border: '6px dotted #D4AF37' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box'}}>
        <div style={{position:'absolute', bottom: '55px', width: '100%', textAlign: 'center'}}>
           <div style={{fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', color: '#D4AF37', letterSpacing: '8px', textTransform: 'uppercase'}}>Best Wife</div>
        </div>
        <div style={{position:'absolute', bottom: '25px', width: '100%', textAlign: 'center'}}>
           <div style={{fontFamily: "'Great Vibes', cursive", fontSize: '1.8rem', color: '#CD5C5C'}}>Forever Yours</div>
        </div>
        {/* Soft Sparkles */}
        <div style={{position:'absolute', top: '25px', left: '25px', fontSize: '1.2rem'}}>✨</div>
        <div style={{position:'absolute', top: '25px', right: '25px', fontSize: '1.2rem'}}>✨</div>
      </div>
    )
  }
  ,{ 
    id: 'f_just_married', name: 'Just Married', side: 'right', style: { border: '25px solid #FFFAF0', borderBottomWidth: '130px', borderTopWidth: '40px', borderRadius: '10px' }, imageStyle: { top: '40px', bottom: '130px', left: '25px', right: '25px', borderRadius: '5px', border: '2px solid #D4AF37' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box'}}>
        <div style={{position:'absolute', bottom: '50px', width: '100%', textAlign: 'center'}}>
           <div style={{fontFamily: "'Great Vibes', cursive", fontSize: '4.5rem', color: '#D4AF37', textShadow: '1px 1px 3px rgba(0,0,0,0.1)', lineHeight: '1'}}>Just Married</div>
        </div>
        <div style={{position:'absolute', bottom: '20px', width: '100%', textAlign: 'center'}}>
           <div style={{fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: '#888', letterSpacing: '6px', textTransform: 'uppercase'}}>A New Chapter</div>
        </div>
        {/* Double border line on the frame itself */}
        <div style={{position:'absolute', top: '10px', bottom: '10px', left: '10px', right: '10px', border: '1px solid #EEDD82', borderRadius: '5px'}}></div>
      </div>
    )
  }
  ,{ 
    id: 'f_forever', name: 'Forever', side: 'right', style: { border: '0px' }, imageStyle: { top: 0, bottom: '120px', left: 0, right: 0, borderRadius: '0' },
    overlay: (
      <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box'}}>
        
        {/* Sultry, cinematic gradient overlay over the photo for a moody look */}
        <div style={{position:'absolute', top: 0, bottom: '120px', left: 0, right: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 20%, transparent 50%, rgba(0,0,0,0.9) 100%)'}}></div>
        <div style={{position:'absolute', top: 0, bottom: '120px', left: 0, right: 0, boxShadow: 'inset 0 0 60px rgba(0,0,0,0.6)'}}></div>

        {/* Sleek, solid glossy black base */}
        <div style={{position:'absolute', bottom: 0, left: 0, right: 0, height: '120px', backgroundColor: '#050505', borderTop: '2px solid #D4AF37'}}></div>

        {/* High-fashion typography */}
        <div style={{position:'absolute', bottom: '50px', width: '100%', textAlign: 'center'}}>
           <div style={{fontFamily: "'Great Vibes', cursive", fontSize: '4.8rem', color: '#D4AF37', textShadow: '0 0 15px rgba(212,175,55,0.5)', lineHeight: '1'}}>Forever</div>
        </div>
        
        <div style={{position:'absolute', bottom: '25px', width: '100%', textAlign: 'center'}}>
           <div style={{fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: '#FFF', letterSpacing: '15px', textTransform: 'uppercase'}}>& Always</div>
        </div>
        
        {/* Sexy thin gold accent lines framing the edges */}
        <div style={{position:'absolute', top: '15px', bottom: '135px', left: '15px', right: '15px', border: '1px solid rgba(212,175,55,0.4)'}}></div>
      </div>
    )
  }

];