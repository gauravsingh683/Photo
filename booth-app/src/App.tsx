import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCcw, Download, Printer, Share2, Home, Wand2, Image as ImageIcon, CheckCircle, XCircle, Heart, MessageCircle, Send, Check } from 'lucide-react';
import { ARCamera } from './ARCamera';
import Webcam from 'react-webcam';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';

type BoothState = 'WELCOME' | 'LAYOUT_SELECT' | 'CAMERA' | 'COUNTDOWN' | 'PREVIEW' | 'PROCESSING' | 'FINAL';


const FILTERS = [
  { id: 'normal', name: 'Normal', css: 'none' },
  // Beauty Filters (All include brightness/blur to trigger ML skin smoothing)
  { id: 'beauty_pro', name: 'Beauty Pro ✨', css: 'brightness(1.15) contrast(0.95) saturate(1.2)' },
  { id: 'glow', name: 'Glow 💖', css: 'brightness(1.1) contrast(1.1) sepia(0.15) hue-rotate(-10deg)' },
  { id: 'soft_peach', name: 'Soft Peach 🍑', css: 'brightness(1.1) contrast(0.95) sepia(0.2) saturate(1.1) hue-rotate(-5deg)' },
  { id: 'rose_gold', name: 'Rose Gold 🌹', css: 'brightness(1.15) contrast(1.05) sepia(0.3) saturate(1.2) hue-rotate(-15deg)' },
  { id: 'porcelain', name: 'Porcelain 🤍', css: 'brightness(1.2) contrast(0.9) saturate(0.8) blur(0.2px)' },
  { id: 'sunkissed', name: 'Sunkissed ☀️', css: 'brightness(1.1) contrast(1.1) sepia(0.4) saturate(1.4)' },
  { id: 'cherry_blossom', name: 'Cherry Blossom 🌸', css: 'brightness(1.15) contrast(0.9) sepia(0.1) hue-rotate(-20deg) saturate(1.2)' },
  { id: 'angelic', name: 'Angelic 🕊️', css: 'brightness(1.3) contrast(0.85) saturate(1.1) blur(0.4px)' },
  { id: 'clean_girl', name: 'Clean Girl 🧼', css: 'brightness(1.1) contrast(1.05) saturate(1.05)' },
  { id: 'glamour', name: 'Glamour 💋', css: 'brightness(1.05) contrast(1.2) saturate(1.3) sepia(0.1)' },
  { id: 'coquette', name: 'Coquette 🎀', css: 'brightness(1.15) contrast(0.9) sepia(0.2) saturate(1.3) hue-rotate(-10deg)' },
  { id: 'velvet', name: 'Velvet 🍷', css: 'brightness(1.05) contrast(1.15) saturate(1.2) sepia(0.2) hue-rotate(10deg)' },
  { id: 'luminous', name: 'Luminous 💎', css: 'brightness(1.15) contrast(1.1) saturate(0.9)' },
  // Standard Filters
  { id: 'sunset', name: 'Sunset 🌅', css: 'brightness(1.1) contrast(1.2) saturate(1.5) sepia(0.4) hue-rotate(-20deg)' },
  { id: 'low_light', name: 'Low Light +', css: 'brightness(1.4) contrast(0.9) saturate(1.1)' },
  { id: 'vintage', name: 'Vintage 🎞️', css: 'sepia(0.5) contrast(1.1) brightness(0.9)' },
  { id: 'bw', name: 'B&W 🖤', css: 'grayscale(1) contrast(1.2)' }
];



















const FRAMES = [
    // --- PROFESSIONAL ---
    { 
      id: 'collage_strip3_pro', name: 'Professional', layout: 'strip3', side: 'left', 
      style: { border: '20px solid #1a1a1a', borderBottomWidth: '100px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }, 
      imageStyle: { backgroundColor: '#1a1a1a', padding: '0px', gap: '20px' },
      overlay: (
        <div style={{position:'absolute', bottom: '-70px', left: '0', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '18px', letterSpacing: '6px', fontWeight: '300', textTransform: 'uppercase'}}>GALLERY</span>
          <div style={{width: '30px', height: '2px', backgroundColor: '#fff', margin: '10px auto 0'}}></div>
        </div>
      )
    },
    { 
      id: 'collage_grid4_pro', name: 'Professional', layout: 'grid4', side: 'left', 
      style: { border: '20px solid #ffffff', borderBottomWidth: '100px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }, 
      imageStyle: { backgroundColor: '#ffffff', padding: '0px', gap: '20px' },
      overlay: (
        <div style={{position:'absolute', bottom: '-70px', left: '0', width: '100%', textAlign: 'center'}}>
          <span style={{color: '#333', fontFamily: 'Inter, sans-serif', fontSize: '18px', letterSpacing: '6px', fontWeight: '300', textTransform: 'uppercase'}}>STUDIO</span>
          <div style={{width: '30px', height: '2px', backgroundColor: '#333', margin: '10px auto 0'}}></div>
        </div>
      )
    },

    // --- WEDDING ---
    { 
      id: 'collage_strip3_wedding', name: 'Wedding', layout: 'strip3', side: 'left', 
      style: { border: '15px solid #FDFBF7', borderBottomWidth: '120px', boxShadow: '0 15px 40px rgba(0,0,0,0.15)' }, 
      imageStyle: { backgroundColor: '#FDFBF7', padding: '5px', gap: '15px' },
      overlay: (
        <div style={{position:'absolute', bottom: '-90px', left: '0', width: '100%', textAlign: 'center'}}>
          <div style={{color: '#C5A059', fontFamily: '"Playfair Display", serif', fontSize: '32px', fontStyle: 'italic', marginBottom: '5px'}}>Just Married</div>
          <div style={{color: '#888', fontFamily: 'sans-serif', fontSize: '12px', letterSpacing: '3px'}}>FOREVER & ALWAYS</div>
        </div>
      )
    },
    { 
      id: 'collage_grid4_wedding', name: 'Wedding', layout: 'grid4', side: 'left', 
      style: { border: '20px solid #FFF5EE', borderBottomWidth: '120px', boxShadow: '0 15px 40px rgba(0,0,0,0.15)' }, 
      imageStyle: { backgroundColor: '#FFF5EE', padding: '10px', gap: '15px' },
      overlay: (
        <div style={{position:'absolute', bottom: '-85px', left: '0', width: '100%', textAlign: 'center'}}>
          <div style={{color: '#D4AF37', fontFamily: '"Playfair Display", serif', fontSize: '36px', fontStyle: 'italic'}}>Mr. & Mrs.</div>
          <div style={{width: '60px', height: '1px', backgroundColor: '#D4AF37', margin: '8px auto'}}></div>
        </div>
      )
    },

    // --- LOVE ---
    { 
      id: 'collage_strip3_love', name: 'Love', layout: 'strip3', side: 'right', 
      style: { border: '15px solid #FFF0F5', borderBottomWidth: '110px', boxShadow: '0 10px 30px rgba(255,182,193,0.3)' }, 
      imageStyle: { backgroundColor: '#FFF0F5', padding: '10px', gap: '20px' },
      overlay: (
        <div style={{position:'absolute', bottom: '-75px', left: '0', width: '100%', textAlign: 'center'}}>
          <div style={{color: '#FF69B4', fontFamily: 'cursive', fontSize: '42px', textShadow: '2px 2px 4px rgba(255,105,180,0.2)'}}>Love</div>
        </div>
      )
    },
    { 
      id: 'collage_grid4_love', name: 'Love', layout: 'grid4', side: 'right', 
      style: { border: '15px solid #FFE4E1', borderBottomWidth: '110px', boxShadow: '0 10px 30px rgba(255,182,193,0.3)' }, 
      imageStyle: { backgroundColor: '#FFE4E1', padding: '10px', gap: '15px' },
      overlay: (
        <div style={{position:'absolute', bottom: '-75px', left: '0', width: '100%', textAlign: 'center'}}>
          <div style={{color: '#FF1493', fontFamily: 'cursive', fontSize: '36px'}}>You & Me</div>
          <div style={{color: '#FF69B4', fontSize: '24px', marginTop: '5px'}}>♥</div>
        </div>
      )
    },

    // --- VALENTINE ---
    { 
      id: 'collage_strip3_val', name: 'Valentine', layout: 'strip3', side: 'right', 
      style: { border: '15px solid #FFC0CB', borderBottomWidth: '120px', boxShadow: '0 10px 30px rgba(220,20,60,0.3)' }, 
      imageStyle: { backgroundColor: '#FFC0CB', padding: '10px', gap: '20px' },
      overlay: (
        <div style={{position:'absolute', bottom: '-85px', left: '0', width: '100%', textAlign: 'center'}}>
          <div style={{color: '#DC143C', fontFamily: '"Arial Black", sans-serif', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '2px'}}>Happy</div>
          <div style={{color: '#DC143C', fontFamily: '"Arial Black", sans-serif', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '2px'}}>Valentine's</div>
        </div>
      )
    },
    { 
      id: 'collage_grid4_val', name: 'Valentine', layout: 'grid4', side: 'right', 
      style: { border: '15px solid #DC143C', borderBottomWidth: '100px', boxShadow: '0 10px 30px rgba(220,20,60,0.4)' }, 
      imageStyle: { backgroundColor: '#DC143C', padding: '10px', gap: '15px' },
      overlay: (
        <div style={{position:'absolute', bottom: '-70px', left: '0', width: '100%', textAlign: 'center'}}>
          <div style={{color: '#fff', fontFamily: 'Georgia, serif', fontSize: '28px', fontStyle: 'italic', letterSpacing: '4px'}}>Be Mine</div>
        </div>
      )
    },

    { 
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
                    <img src="/wcs.jpeg" style={{width:'28px', height:'28px', borderRadius:'50%', objectFit:'cover'}} />
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
                <img src="/wcs.jpeg" style={{width:'100%', height:'100%', objectFit:'cover'}} />
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
                 <img src="/wcs.jpeg" style={{width:'100%', height:'100%', objectFit:'cover'}} />
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
                  <img src="/wcs.jpeg" style={{width:'100%', height:'100%', objectFit:'cover'}} />
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
        <div style={{position:'absolute', bottom: '-90px', left: '20px', right: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70px'}}>
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
        <div style={{position:'absolute', bottom: '-85px', left: '25px', fontSize: '2rem'}}>🤍</div>
        <div style={{position:'absolute', bottom: '-85px', right: '25px', fontSize: '2rem'}}>🤍</div>

        {/* Top Header */}
        <div style={{position:'absolute', top: '25px', left: '20px', right: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50px'}}>
           <div style={{fontFamily: "'Great Vibes', cursive, 'Brush Script MT', serif", fontSize: '3.6rem', color: '#B8860B', textShadow: '1px 1px 0px #FFF, 2px 2px 5px rgba(212,175,55,0.3)', letterSpacing: '2px'}}>Team Bride 💍</div>
        </div>
        
        {/* Bottom Details */}
        <div style={{position:'absolute', bottom: '-75px', left: '20px', right: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60px'}}>
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
        <div style={{position:'absolute', bottom: '-85px', left: '20px', right: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60px'}}>
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
    id: 'f12_film', name: 'Film Strip', style: { border: '30px solid #111', borderTopWidth: '30px', borderBottomWidth: '30px' }, imageStyle: { top: '30px', bottom: '-75px', left: '30px', right: '30px' },
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
        
        <div style={{position:'absolute', bottom: '-85px', width: '100%', textAlign: 'center'}}>
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
        <div style={{position:'absolute', bottom: '-90px', width: '100%', textAlign: 'center'}}>
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
        <div style={{position:'absolute', bottom: '-85px', width: '100%', textAlign: 'center'}}>
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
        <div style={{position:'absolute', bottom: '-90px', width: '100%', textAlign: 'center'}}>
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
        
        <div style={{position:'absolute', bottom: '-85px', width: '100%', textAlign: 'center'}}>
           <div style={{fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: '#FFF', letterSpacing: '15px', textTransform: 'uppercase'}}>& Always</div>
        </div>
        
        {/* Sexy thin gold accent lines framing the edges */}
        <div style={{position:'absolute', top: '15px', bottom: '135px', left: '15px', right: '15px', border: '1px solid rgba(212,175,55,0.4)'}}></div>
      </div>
    )
  }

];

function App() {
  const [appState, setAppState] = useState<BoothState>('WELCOME');
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedFrame, setSelectedFrame] = useState<any>(FRAMES[0]);

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);


  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappOtp, setWhatsappOtp] = useState('');
  const [whatsappStep, setWhatsappStep] = useState<'number'|'otp'|'success'>('number');
  const [otpTimer, setOtpTimer] = useState(300);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [whatsappUploadedUrl, setWhatsappUploadedUrl] = useState('');

  // Licensing State
  const [hardwareId, setHardwareId] = useState('');
  const [machineCode, setMachineCode] = useState('');
  const [isLicensed, setIsLicensed] = useState(true); // default true until checked
  const [selfieCount, setSelfieCount] = useState(0);
  const [selectedPrinter, setSelectedPrinter] = useState('');

  const logToServer = async (message: string, level = 'INFO') => {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, level })
      });
    } catch (e) {
      console.error("Failed to log to server:", e);
    }
  };

  // Listen for Electron silent print feedback
  useEffect(() => {
    if ((window as any).electronAPI && (window as any).electronAPI.onPrintReply) {
      (window as any).electronAPI.onPrintReply((result: any) => {
        logToServer(`Print reply received: ${JSON.stringify(result)}`, result.success ? 'INFO' : 'ERROR');
        if (result.success) {
          alert(`Print command successfully sent to printer: ${result.printer}`);
        } else {
          alert(`Printing failed!\nError: ${result.error || 'Unknown printer failure'}\nTarget Printer: ${result.printer}`);
        }
      });
    }
  }, []);

  // Listen for Electron main process logs to send to server
  useEffect(() => {
    if ((window as any).electronAPI && (window as any).electronAPI.onElectronLog) {
      (window as any).electronAPI.onElectronLog((data: any) => {
        logToServer(`[ELECTRON MAIN] ${data.msg}`, data.level);
      });
    }
  }, []);

  useEffect(() => {
    const initLicense = async () => {
      try {
        let hwId = 'BROWSER-DEV-MODE';
        if ((window as any).electronAPI) {
          hwId = await (window as any).electronAPI.getHardwareId();
        } else if ((window as any).require) {
          const { ipcRenderer } = (window as any).require('electron');
          hwId = await ipcRenderer.invoke('get-hardware-id');
        }
        setHardwareId(hwId);

        let code = localStorage.getItem('photoBoothShortCode');
        if (!code) {
          code = Math.floor(100000 + Math.random() * 900000).toString();
          localStorage.setItem('photoBoothShortCode', code);
        }
        setMachineCode(code);

        await fetch('/api/license/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hardwareId: hwId, shortCode: code })
        });

        // Report printers to backend
        if ((window as any).electronAPI) {
          try {
            const printers = await (window as any).electronAPI.getPrintersList();
            await fetch('/api/license/printers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ hardwareId: hwId, printers })
            });
          } catch (pe) {
            console.error("Failed to report printers list to backend", pe);
          }
        }
      } catch (e) {
        console.error("License Init Failed", e);
      }
    };
    initLicense();
  }, []);

  useEffect(() => {
    if (!hardwareId) return;
    
    const checkLicense = async () => {
      try {
        const res = await fetch(`/api/license/status?hardwareId=${hardwareId}`);
        const data = await res.json();
        setIsLicensed(data.isLicensed);
        setSelfieCount(data.selfieCount);
        if (data.selectedPrinter !== undefined) {
          setSelectedPrinter(data.selectedPrinter);
        }
      } catch (e) {
        // fail silently
      }
    };
    checkLicense();
    const interval = setInterval(checkLicense, 5000);
    return () => clearInterval(interval);
  }, [hardwareId]);
  const handleWhatsAppClick = async () => {
    setWhatsappStep('number');
    setWhatsappNumber('');
    setWhatsappOtp('');
    setShowWhatsAppModal(true);
    setIsSendingWhatsApp(true);
    try {
      const el = document.getElementById('final-capture-container');
      if (el) {
        const canvas = await html2canvas(el, { useCORS: true, scale: 2 });
        const base64Image = canvas.toDataURL('image/jpeg', 0.8);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image, host: window.location.origin })
        });
        const data = await res.json();
        if (data.success) {
          setWhatsappUploadedUrl(data.url);
        } else {
          alert('Failed to process image.');
          setShowWhatsAppModal(false);
        }
      }
    } catch (e) {
      console.error(e);
      alert('Error generating image.');
      setShowWhatsAppModal(false);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleWhatsAppSendOtp = async () => {
    setIsSendingWhatsApp(true);
    setTimeout(() => {
      setWhatsappStep('otp');
      setOtpTimer(300); // 5 minutes
      setIsSendingWhatsApp(false);
    }, 1000);
  };

  const handleWhatsAppVerifyOtp = async () => {
    setIsSendingWhatsApp(true);
    setTimeout(() => {
      if (whatsappOtp === '1234') {
        setWhatsappStep('success');
      } else {
        alert('Invalid OTP. Please enter 1234 for testing.');
      }
      setIsSendingWhatsApp(false);
    }, 1000);
  };

  useEffect(() => {
    let timer: number;
    if (showWhatsAppModal && whatsappStep === 'otp' && otpTimer > 0) {
      timer = window.setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showWhatsAppModal, whatsappStep, otpTimer]);

  const handleQRCodeClick = async () => {
    setIsGeneratingQR(true);
    try {
      const isSocialFrame = ['f1', 'f2', 'f3_youtube'].includes(selectedFrame.id);
      const targetId = isSocialFrame ? 'print-capture-wrapper' : 'final-capture-container';
      const el = document.getElementById(targetId);
      if (el) {
        const canvas = await html2canvas(el, { useCORS: true, scale: 2, scrollX: 0, scrollY: 0, x: 0, y: 0 });

        const base64Image = canvas.toDataURL('image/jpeg', 0.8);
        const hostUrl = window.location.origin;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image, host: hostUrl })
        });
        const data = await res.json();
        if (data.success) {
          setQrUrl(data.url);
          setShowQRModal(true);
        } else {
          alert('Failed to generate QR code link.');
        }
      }
    } catch (e) {
      console.error(e);
      alert('Error generating QR code.');
    } finally {
      setIsGeneratingQR(false);
    }
  };
  const handlePrint = async () => {
    logToServer(`Print Strip clicked. Selected printer: "${selectedPrinter}"`, 'INFO');
    try {
      const response = await fetch('/api/settings');
      const settings = await response.json();
      const printSize = settings.printSize || '4x6';
      logToServer(`Fetched settings. printSize: "${printSize}"`, 'INFO');
      
      const isSocialFrame = ['f1', 'f2', 'f3_youtube'].includes(selectedFrame.id);
      const targetId = isSocialFrame ? 'print-capture-wrapper' : 'final-capture-container';
      const el = document.getElementById(targetId);
      if (!el) {
        logToServer(`${targetId} element not found!`, 'ERROR');
        alert("Could not find the image to print.");
        return;
      }
      
      // Capture in HD quality
      logToServer(`Capturing layout container via html2canvas...`, 'INFO');
      const canvas = await html2canvas(el, { useCORS: true, scale: 4, scrollX: 0, scrollY: 0, x: 0, y: 0 });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      logToServer(`html2canvas capture successful. Data URL length: ${imgData.length}`, 'INFO');
      
      // Determine CSS page size dynamically (supports 4x6, 5x7, 2x6, 8x10, etc.)
      let cssSize = '4in 6in';
      if (printSize && printSize.includes('x')) {
        const parts = printSize.split('x');
        if (parts.length === 2) {
          cssSize = `${parts[0]}in ${parts[1]}in`;
        }
      }
      
      // Check if running inside Electron Kiosk mode
      if ((window as any).electronAPI) {
        (window as any).electronAPI.printSilent({ imgData, cssSize, printerName: selectedPrinter });
      } else if ((window as any).require) {
        // @ts-ignore
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('print-silent', { imgData, cssSize, printerName: selectedPrinter });
      } else {
        // Fallback for normal browser
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Print Strip</title>
                <style>
                  @page { size: ${cssSize}; margin: 0; }
                  body { margin: 0; padding: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background: #fdfbf7; }
                  img { max-width: 95%; max-height: 95%; object-fit: contain; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
                </style>
              </head>
              <body>
                <img src="${imgData}" onload="setTimeout(() => { window.print(); window.close(); }, 500);" />
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
    } catch (e) {
      console.error("Failed to print", e);
      alert("Failed to fetch print configuration or capture image.");
    }
  };
  const [countdown, setCountdown] = useState(5);
  const [imagesSrc, setImagesSrc] = useState<string[]>([]);
  const [captureMode, setCaptureMode] = useState<number>(1);
  const [currentShot, setCurrentShot] = useState<number>(0);
  const [customFrames, setCustomFrames] = useState<any[]>([]);
  const webcamRef = useRef<any>(null);

  // Fetch custom frames from admin panel
  useEffect(() => {
    fetch('/api/frames')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formattedFrames = data.filter(f => f.approved).map(f => ({
            id: f.id.toString(),
            name: f.name,
            type: f.type,
            side: 'custom',
            style: { border: '0px' },
            imageStyle: { top: 0, bottom: 0, left: 0, right: 0, borderRadius: '0px' },
            overlay: (
              <div style={{position:'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5}}>
                <img src={f.url} style={{width: '100%', height: '100%', objectFit: 'fill'}} />
              </div>
            )
          }));
          setCustomFrames(formattedFrames);
        }
      })
      .catch(err => console.error("Error fetching custom frames:", err));
  }, []);

  // Handle Countdown
  useEffect(() => {
    let timer: number;
    if (appState === 'COUNTDOWN' && countdown > 0) {
      timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (appState === 'COUNTDOWN' && countdown === 0) {
      capture();
    }
    return () => clearTimeout(timer);
  }, [appState, countdown]);

  // Handle Fake Processing & Counting
  useEffect(() => {
    if (appState === 'PROCESSING') {
      const timer = setTimeout(async () => {
        setAppState('FINAL');
        try {
          const res = await fetch('/api/license/increment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hardwareId })
          });
          const data = await res.json();
          if (data.success) {
            setSelfieCount(data.selfieCount);
          }
        } catch(e) {
          setSelfieCount(prev => prev + 1);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [appState, hardwareId]);

  const capture = useCallback(async () => {
    setAppState('PROCESSING'); // Show processing state while DSLR is capturing
    try {
      console.log("Triggering backend DSLR capture...");
      const res = await fetch('/api/hardware/capture', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.url) {
        const dslrImageUrl = data.url;
        setImagesSrc(prev => {
          const newImages = [...prev, dslrImageUrl];
          if (newImages.length < captureMode) {
            setCurrentShot(newImages.length);
            setCountdown(5);
            setAppState('CAMERA');
            return newImages;
          } else {
            setAppState('PREVIEW');
            return newImages;
          }
        });
        return;
      }
    } catch (err) {
      console.error("DSLR Capture failed, falling back to webcam...", err);
    }

    // Fallback: use webcam screenshot if DSLR capture fails
    const image = webcamRef.current?.getScreenshot();
    if (image) {
      setImagesSrc(prev => {
        const newImages = [...prev, image];
        if (newImages.length < captureMode) {
          setCurrentShot(newImages.length);
          setCountdown(5);
          setAppState('CAMERA');
          return newImages;
        } else {
          setAppState('PREVIEW');
          return newImages;
        }
      });
    } else {
      setAppState('PREVIEW');
    }
  }, [webcamRef, captureMode]);

  const startCountdown = () => {
    setCountdown(5);
    setAppState('COUNTDOWN');
  };

  const resetSession = () => {
    setImagesSrc([]);
    setCurrentShot(0);
    setAppState('WELCOME');
  };


  const isFrameVisible = (f: any) => {
    if (f.id === 'f_none') return false;
    if (captureMode === 1 && f.layout) return false;
    if (captureMode === 3 && f.layout !== 'strip3') return false;
    if (captureMode === 4 && f.layout !== 'grid4') return false;
    return true;
  };

  const renderImageContainer = (f: any, images: string[], filterCss: string, currentCaptureMode: number) => {
    // If not enough images for the layout, duplicate the last image to fill it
    let renderImages = [...images];
    if (renderImages.length === 0) renderImages = ['https://via.placeholder.com/400x600?text=Preview'];
    
    const effectiveLayout = f.layout || (currentCaptureMode === 3 ? 'strip3' : (currentCaptureMode === 4 ? 'grid4' : 'single'));
    const count = effectiveLayout === 'strip3' ? 3 : (effectiveLayout === 'grid4' ? 4 : 1);
    
    while (renderImages.length < count) {
      renderImages.push(renderImages[renderImages.length - 1]);
    }

    if (effectiveLayout === 'strip3') {
      return (
        <div style={Object.assign({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '15px', padding: '20px' }, f.imageStyle)}>
          {renderImages.slice(0, 3).map((src, i) => (
             <div key={i} style={{ width: '100%', height: '100%', backgroundImage: `url("${src}")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', filter: filterCss, borderRadius: '8px', gridColumn: i === 2 ? '1 / span 2' : 'auto' }} />
          ))}
        </div>
      );
    } else if (effectiveLayout === 'grid4') {
      return (
        <div style={Object.assign({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '15px', padding: '20px' }, f.imageStyle)}>
          {renderImages.slice(0, 4).map((src, i) => (
             <div key={i} style={{ width: '100%', height: '100%', backgroundImage: `url("${src}")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', filter: filterCss, borderRadius: '8px' }} />
          ))}
        </div>
      );
    } else {
      return (
        <div style={Object.assign({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, f.imageStyle)}>
          <div style={{ width: '100%', height: '100%', backgroundImage: `url("${renderImages[0] || ''}")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', filter: filterCss }} />
        </div>
      );
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#ffffff', color: '#4a4a4a', fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden' }}>
      
      {/* LICENSE LOCK SCREEN OVERLAY */}
      {selfieCount >= 3 && !isLicensed && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', padding: '40px' }}>
          <div style={{ background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)', padding: '60px', borderRadius: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.1)' }}>
            <h1 style={{ fontSize: '3rem', margin: '0 0 20px 0', color: '#ff4757' }}>Trial Expired</h1>
            <p style={{ fontSize: '1.5rem', maxWidth: '600px', lineHeight: '1.6', color: '#a4b0be', marginBottom: '40px' }}>
              You have reached the maximum number of free trial selfies. To permanently unlock this Photo Booth, please provide the following registration code to your Administrator.
            </p>
            <div style={{ backgroundColor: '#2f3542', padding: '20px 40px', borderRadius: '15px', display: 'inline-block', marginBottom: '40px' }}>
              <span style={{ fontSize: '1.2rem', color: '#ced6e0', display: 'block', marginBottom: '10px' }}>YOUR 6-DIGIT CODE:</span>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', letterSpacing: '4px', color: '#fff', background: '#353b48', padding: '10px 30px', borderRadius: '15px', display: 'inline-block' }}>
                {machineCode}
              </div>
            </div>
            <p style={{ fontSize: '1.2rem', color: '#747d8c', fontStyle: 'italic' }}>This screen will automatically unlock once the code is authorized...</p>
          </div>
        </div>
      )}

      {/* 1. WELCOME SCREEN */}
      {appState === 'WELCOME' && (
        <div style={{ textAlign: 'center', zIndex: 10, animation: 'fadeIn 1.5s ease-out', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <img src="/wcs.jpeg" alt="Logo" style={{ width: '250px', marginBottom: '40px', filter: 'drop-shadow(0px 10px 15px rgba(255, 182, 193, 0.6))' }} />
          
          <h1 style={{ fontFamily: '"Georgia", serif', fontSize: '5.5rem', fontStyle: 'italic', background: 'linear-gradient(45deg, #ff758c 0%, #ff7eb3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px', textShadow: '0px 4px 20px rgba(255, 117, 140, 0.3)' }}>
            Lumière ✨
          </h1>
          <p style={{ fontSize: '1.4rem', color: '#ff8da1', marginBottom: '50px', fontWeight: '300', letterSpacing: '2px' }}>Capture your glowing moments 💖</p>
          
          <button onClick={() => setAppState('LAYOUT_SELECT')} style={{ 
              padding: '22px 70px', fontSize: '1.6rem', borderRadius: '50px', background: 'linear-gradient(135deg, #002D62 0%, #00FFFF 100%)', color: '#ffffff', border: '2px solid rgba(0, 255, 255, 0.5)', cursor: 'pointer', fontWeight: '600', boxShadow: '0 15px 35px rgba(0, 255, 255, 0.2), inset 0 0 10px rgba(255,255,255,0.4)', transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 255, 255, 0.4), inset 0 0 15px rgba(255,255,255,0.6)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 255, 255, 0.2), inset 0 0 10px rgba(255,255,255,0.4)'; }}
            >
            Start
          </button>
        </div>
      )}

      {appState === 'LAYOUT_SELECT' && (
        <div style={{ textAlign: 'center', zIndex: 10 }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '40px', fontWeight: '800', color: '#333' }}>Choose Your Layout</h2>
          <div style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
              <div onClick={() => { setCaptureMode(1); setSelectedFrame(FRAMES.find(f => !f.layout || f.layout === 'single') || FRAMES[0]); setImagesSrc([]); setCurrentShot(0); setCountdown(5); setAppState('CAMERA'); }} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                <div style={{ width: '140px', height: '180px', backgroundColor: '#e0e0e0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', border: '3px solid #ccc' }}>
                   <div style={{ width: '120px', height: '160px', backgroundColor: '#fff', borderRadius: '5px' }}></div>
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#4a4a4a' }}>Single Selfie</span>
              </div>

              <div onClick={() => { setCaptureMode(3); setSelectedFrame(FRAMES.find(f => f.id === 'f_none') || FRAMES[0]); setImagesSrc([]); setCurrentShot(0); setCountdown(5); setAppState('CAMERA'); }} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                <div style={{ width: '140px', height: '180px', backgroundColor: '#e0e0e0', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '8px', padding: '10px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', border: '3px solid #ccc', boxSizing: 'border-box' }}>
                   <div style={{ backgroundColor: '#fff', borderRadius: '3px' }}></div>
                   <div style={{ backgroundColor: '#fff', borderRadius: '3px' }}></div>
                   <div style={{ backgroundColor: '#fff', borderRadius: '3px', gridColumn: '1 / span 2' }}></div>
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#4a4a4a' }}>3 Collage Selfie</span>
              </div>

              <div onClick={() => { setCaptureMode(4); setSelectedFrame(FRAMES.find(f => f.id === 'f_none') || FRAMES[0]); setImagesSrc([]); setCurrentShot(0); setCountdown(5); setAppState('CAMERA'); }} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                <div style={{ width: '140px', height: '180px', backgroundColor: '#e0e0e0', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '8px', padding: '10px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', border: '3px solid #ccc', boxSizing: 'border-box' }}>
                     <div style={{ backgroundColor: '#fff', borderRadius: '3px' }}></div>
                     <div style={{ backgroundColor: '#fff', borderRadius: '3px' }}></div>
                     <div style={{ backgroundColor: '#fff', borderRadius: '3px' }}></div>
                     <div style={{ backgroundColor: '#fff', borderRadius: '3px' }}></div>
                  </div>
                  <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#4a4a4a' }}>4 Collage Selfie</span>
              </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '30px', width: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <button onClick={() => setShowWhatsAppModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
              <XCircle size={30} />
            </button>
            <div style={{ width: '60px', height: '60px', backgroundColor: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
               <MessageCircle color="white" size={30} />
            </div>
            
            {whatsappStep === 'number' && (
              <>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#333', fontWeight: 'bold' }}>Share on WhatsApp</h3>
                <p style={{ color: '#666', textAlign: 'center', marginBottom: '20px' }}>Enter your 10-digit number to receive the photo.</p>
                <input 
                  type="text" 
                  value={whatsappNumber} 
                  onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit number"
                  style={{ width: '100%', padding: '15px', fontSize: '1.2rem', borderRadius: '10px', border: '2px solid #ddd', marginBottom: '20px', textAlign: 'center', outline: 'none' }}
                />
                <button 
                  onClick={handleWhatsAppSendOtp}
                  disabled={isSendingWhatsApp || whatsappNumber.length !== 10}
                  style={{ width: '100%', padding: '15px', backgroundColor: (isSendingWhatsApp || whatsappNumber.length !== 10) ? '#999' : '#25D366', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {isSendingWhatsApp ? 'Please wait...' : 'Send OTP'}
                </button>
              </>
            )}

            {whatsappStep === 'otp' && (
              <>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#333', fontWeight: 'bold' }}>Enter OTP</h3>
                <p style={{ color: '#666', textAlign: 'center', marginBottom: '10px' }}>Sent to +91 {whatsappNumber}</p>
                <div style={{ color: '#25D366', fontWeight: 'bold', marginBottom: '20px' }}>Time remaining: {Math.floor(otpTimer/60)}:{otpTimer%60 < 10 ? '0' : ''}{otpTimer%60}</div>
                <input 
                  type="text" 
                  value={whatsappOtp} 
                  onChange={(e) => setWhatsappOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                  disabled={otpTimer === 0}
                  style={{ width: '100%', padding: '15px', fontSize: '1.5rem', letterSpacing: '10px', borderRadius: '10px', border: '2px solid #ddd', marginBottom: '20px', textAlign: 'center', outline: 'none' }}
                />
                <button 
                  onClick={handleWhatsAppVerifyOtp}
                  disabled={isSendingWhatsApp || whatsappOtp.length !== 4 || otpTimer === 0}
                  style={{ width: '100%', padding: '15px', backgroundColor: (isSendingWhatsApp || whatsappOtp.length !== 4 || otpTimer === 0) ? '#999' : '#25D366', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {isSendingWhatsApp ? 'Verifying...' : 'Verify & Send'}
                </button>
              </>
            )}

            {whatsappStep === 'success' && (
              <>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#333', fontWeight: 'bold' }}>Success!</h3>
                <p style={{ color: '#666', textAlign: 'center', marginBottom: '20px' }}>Your photo has been sent to your WhatsApp.</p>
                <button 
                  onClick={() => setShowWhatsAppModal(false)}
                  style={{ width: '100%', padding: '15px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Done
                </button>
              </>
            )}

          </div>
        </div>
      )}



      {/* 2 & 3. CAMERA & COUNTDOWN SCREEN */}
      {(appState === 'CAMERA' || appState === 'COUNTDOWN') && (
        <div style={{ width: '100%', height: '100vh', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
            <ARCamera ref={webcamRef} filterCSS={selectedFilter.css} />
            
            
            
      


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
                  style={{ 
                    width: '100%', 
                    height: '140px',
                    position: 'relative',
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {FILTERS.map((f, i) => {
                    const activeIndex = FILTERS.findIndex(filter => filter.id === selectedFilter.id);
                    const delta = i - activeIndex;
                    const isSelected = delta === 0;
                    
                    // Arc math
                    const radius = 250;
                    const angleStep = 22; // degrees per item
                    const angle = delta * angleStep;
                    const rad = angle * Math.PI / 180;
                    
                    const x = Math.sin(rad) * radius;
                    const y = radius - Math.cos(rad) * radius; // arches downwards
                    
                    const isVisible = Math.abs(delta) <= 4;
                    
                    

  

  return (
                      <div 
                        key={f.id} 
                        onClick={() => {
                          if (isSelected) {
                            startCountdown();
                          } else {
                            setSelectedFilter(f);
                          }
                        }} 
                        style={{ 
                          position: 'absolute',
                          top: '10px',
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          transform: `translateX(${x}px) translateY(${y}px) scale(${isSelected ? 1 : 0.85})`,
                          opacity: isVisible ? (1 - Math.abs(delta) * 0.15) : 0,
                          pointerEvents: isVisible ? 'auto' : 'none',
                          zIndex: 10 - Math.abs(delta),
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                      >
                        <div style={{ 
                          width: isSelected ? '90px' : '60px', 
                          height: isSelected ? '90px' : '60px', 
                          borderRadius: '50%', 
                          border: isSelected ? '5px solid #fff' : '2px solid rgba(255,255,255,0.8)', 
                          padding: isSelected ? '4px' : '0px', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          boxShadow: '0 4px 15px rgba(0,0,0,0.2)', 
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          backgroundColor: 'transparent'
                        }}>
                          {/* Inner circle (shutter / filter icon) */}
                          <div style={{
                            width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                            backgroundColor: '#fff'
                          }}>
                            <img src="/filter_preview.jpg" style={{ filter: f.css, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt={f.name} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {appState === 'COUNTDOWN' && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12rem', fontWeight: 'bold', color: 'white', textShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
                {countdown > 0 ? countdown : ''}
              {captureMode > 1 && (
                <div style={{ position: 'absolute', top: '30px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '10px 20px', borderRadius: '20px', fontSize: '1.5rem', zIndex: 100 }}>
                  Shot {currentShot + 1} of {captureMode}
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. PREVIEW SCREEN */}
      {appState === 'PREVIEW' && imagesSrc.length > 0 && (
        <div style={{ width: '100%', height: '100vh', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
            <img src={imagesSrc[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', filter: selectedFilter.css }} alt="Captured" />
            
            <div style={{ position: 'absolute', bottom: '60px', width: '100%', display: 'flex', justifyContent: 'center', gap: '20px' }}>
               <button 
                onClick={() => setAppState('CAMERA')}
                style={{ padding: '15px 30px', fontSize: '1.2rem', borderRadius: '50px', border: '2px solid #ffb6c1', backgroundColor: '#fff', color: '#4a4a4a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <RefreshCcw /> Retake
              </button>
              <button 
                onClick={() => setAppState('PROCESSING')}
                style={{ padding: '15px 30px', fontSize: '1.2rem', borderRadius: '50px', background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4e1 100%)', border: '2px solid rgba(255, 182, 193, 0.5)', boxShadow: '0 10px 20px rgba(255, 117, 140, 0.15)', color: '#4a4a4a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Check /> Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PROCESSING SCREEN */}
      {appState === 'PROCESSING' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '100px', height: '100px', border: '10px solid #f0e6e6', borderTopColor: '#ffb6c1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 40px' }} />
          <h2 style={{ fontSize: '3rem', fontWeight: 'bold' }}>Applying AI Magic...</h2>
          <p style={{ fontSize: '1.2rem', color: '#a1a1aa', marginTop: '10px' }}>Enhancing face and replacing background</p>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
        </div>
      )}

      {/* 6. FINAL SCREEN */}
      {appState === 'FINAL' && imagesSrc.length > 0 && (
        <div className="final-screen-container">
          
          {/* Top Section (Templates + Custom Frames) */}
          <div className="frames-section-custom-ai">
            {/* Left Standard Frames (Templates) */}
            <div className="frame-column-container column-templates">
              <div className="frame-list-scrollable no-scrollbar">
                {FRAMES.filter((f) => f.side !== 'right' && isFrameVisible(f)).map((f) => (
                  <div 
                    key={f.id} 
                    onClick={() => setSelectedFrame(f)}
                    style={{ 
                      flexShrink: 0, width: '120px', height: '160px', borderRadius: '10px', cursor: 'pointer', overflow: 'hidden', position: 'relative',
                      border: selectedFrame.id === f.id ? '4px solid #7000FF' : '1px solid #000',
                      boxShadow: selectedFrame.id === f.id ? '0 4px 15px rgba(112,0,255,0.4)' : '0 4px 10px rgba(0,0,0,0.1)',
                      transform: selectedFrame.id === f.id ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.2s',
                      backgroundColor: 'transparent', margin: '0 auto'
                    }}>
                    <div style={{ width: '450px', height: '600px', transform: 'scale(0.266)', transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                      {renderImageContainer(f, imagesSrc, selectedFilter.css, captureMode)}
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box', ...f.style }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box' }}>{f.overlay}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Frames */}
            {captureMode === 1 && customFrames.filter(f => f.type === 'custom').length > 0 && (
              <div className="frame-column-container column-custom-frames">
                 <div className="frame-column-title">
                    Custom frame
                 </div>
                 <div className="frame-list-scrollable no-scrollbar">
                   {customFrames.filter(f => f.type === 'custom').map((f) => (
                     <div 
                       key={f.id} 
                       onClick={() => setSelectedFrame(f)}
                       style={{ 
                         flexShrink: 0, width: '120px', height: '160px', borderRadius: '10px', cursor: 'pointer', overflow: 'hidden', position: 'relative',
                         border: selectedFrame.id === f.id ? '4px solid #7000FF' : '1px solid #000',
                         boxShadow: selectedFrame.id === f.id ? '0 4px 15px rgba(112,0,255,0.4)' : '0 4px 10px rgba(0,0,0,0.1)',
                         transform: selectedFrame.id === f.id ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.2s',
                         backgroundColor: 'transparent', margin: '0 auto'
                       }}>
                       <div style={{ width: '450px', height: '600px', transform: 'scale(0.266)', transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                         {renderImageContainer(f, imagesSrc, selectedFilter.css, captureMode)}
                         <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box', ...f.style }}>
                           <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box' }}>{f.overlay}</div>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </div>

          {/* Center Selfie Column */}
          <div className="selfie-card-column">
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap' }}>Select Your Frame</h2>
            
            <div id="print-capture-wrapper" style={{ padding: '30px 20px', background: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div id="final-capture-container" className={`selfie-capture-wrapper ${['f1', 'f2', 'f3_youtube'].includes(selectedFrame.id) ? 'has-shadow' : ''}`}>
                 {renderImageContainer(selectedFrame, imagesSrc, selectedFilter.css, captureMode)}
                 {/* Frame Border Overlay */}
                 <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box', ...selectedFrame.style }}>
                   <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box' }}>
                     {selectedFrame.overlay}
                   </div>
                 </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '30px', width: 'max-content' }}>
               <button onClick={handlePrint} style={{ padding: '15px 30px', fontSize: '1.2rem', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4e1 100%)', color: '#4a4a4a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(255, 117, 140, 0.15)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                <Printer /> Print Strip
              </button>
              <button onClick={handleQRCodeClick} disabled={isGeneratingQR} style={{ padding: '15px 30px', fontSize: '1.2rem', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', color: '#fff', cursor: isGeneratingQR ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(142, 197, 252, 0.3)', fontWeight: 'bold', opacity: isGeneratingQR ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                <Share2 /> {isGeneratingQR ? 'Generating...' : 'QR Code'}
              </button>
              <button onClick={handleWhatsAppClick} disabled={isSendingWhatsApp} style={{ padding: '15px 30px', fontSize: '1.2rem', borderRadius: '50px', border: 'none', background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', color: '#fff', cursor: isSendingWhatsApp ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(37, 211, 102, 0.3)', fontWeight: 'bold', opacity: isSendingWhatsApp ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                <MessageCircle /> {isSendingWhatsApp ? 'Processing...' : 'WhatsApp'}
              </button>
              <button 
                onClick={resetSession}
                style={{ padding: '15px 30px', fontSize: '1.2rem', borderRadius: '50px', border: '2px solid #ccc', backgroundColor: '#fff', color: '#4a4a4a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                <Home /> Finish
              </button>
            </div>
          </div>
          
          {/* Bottom Section (AI Frames + Designs) */}
          <div className="frames-section-normal">
            {/* AI Image Column */}
            {captureMode === 1 && customFrames.filter(f => f.type === 'ai').length > 0 && (
              <div className="frame-column-container column-ai-images">
                <div className="frame-column-title" style={{ borderColor: '#ff4757', color: '#ff4757' }}>
                  AI Image
                </div>
                <div className="frame-list-scrollable no-scrollbar">
                  {customFrames.filter((f) => f.type === 'ai').map((f) => (
                    <div 
                      key={f.id} 
                      onClick={() => setSelectedFrame(f)}
                      style={{ 
                        flexShrink: 0, width: '120px', height: '160px', borderRadius: '10px', cursor: 'pointer', overflow: 'hidden', position: 'relative',
                        border: selectedFrame.id === f.id ? '4px solid #ff4757' : '1px solid #000',
                        boxShadow: selectedFrame.id === f.id ? '0 4px 15px rgba(255,71,87,0.4)' : '0 4px 10px rgba(0,0,0,0.1)',
                        transform: selectedFrame.id === f.id ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.2s',
                        backgroundColor: 'transparent', margin: '0 auto'
                      }}>
                      <div style={{ width: '450px', height: '600px', transform: 'scale(0.266)', transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                        {renderImageContainer(f, imagesSrc, selectedFilter.css, captureMode)}
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box', ...f.style }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box' }}>{f.overlay}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Right Standard Frames (Designs) */}
            <div className="frame-column-container column-designs">
              <div className="frame-list-scrollable no-scrollbar">
                {FRAMES.filter((f) => f.side === 'right' && isFrameVisible(f)).map((f) => (
                  <div 
                    key={f.id} 
                    onClick={() => setSelectedFrame(f)}
                    style={{ 
                      flexShrink: 0, width: '120px', height: '160px', borderRadius: '10px', cursor: 'pointer', overflow: 'hidden', position: 'relative',
                      border: selectedFrame.id === f.id ? '4px solid #7000FF' : '1px solid #000',
                      boxShadow: selectedFrame.id === f.id ? '0 4px 15px rgba(112,0,255,0.4)' : '0 4px 10px rgba(0,0,0,0.1)',
                      transform: selectedFrame.id === f.id ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.2s',
                      backgroundColor: 'transparent', margin: '0 auto'
                    }}>
                    <div style={{ width: '450px', height: '600px', transform: 'scale(0.266)', transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                      {renderImageContainer(f, imagesSrc, selectedFilter.css, captureMode)}
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box', ...f.style }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', boxSizing: 'border-box' }}>{f.overlay}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* QR CODE MODAL */}
      {showQRModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', textAlign: 'center', maxWidth: '400px', width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
            <h2 style={{ marginBottom: '10px', color: '#1e293b', fontSize: '1.8rem', fontWeight: 800 }}>Scan to Download</h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Scan this QR code with your phone camera to download your photo strip directly to your device.</p>
            
            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'inline-block', border: '2px solid #e2e8f0' }}>
              <QRCodeSVG value={qrUrl} size={220} />
            </div>
            
            <div style={{ marginTop: '30px' }}>
              <button onClick={() => setShowQRModal(false)} style={{ padding: '12px 30px', fontSize: '1.1rem', borderRadius: '50px', background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;






