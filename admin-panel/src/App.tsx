import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Frame = { id: string; name: string; url: string; approved: boolean; type: 'ai' | 'custom' };

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
  }, [isAuthenticated]);
  const [username, setUsername] = useState(() => localStorage.getItem('adminUsername') || '');

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('adminUsername', username);
    } else {
      localStorage.removeItem('adminUsername');
    }
  }, [isAuthenticated, username]);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dashboard State
  const [frames, setFrames] = useState<Frame[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedImage, setSelectedImage] = useState<Frame | null>(null);
  const [printSize, setPrintSize] = useState('4x6');
  const [whatsappSettings, setWhatsappSettings] = useState({ apiUrl: '', apiKey: '', senderNumber: '' });
  const [cameraMode, setCameraMode] = useState<'dslr' | 'webcam'>('dslr');
  
  const [licenses, setLicenses] = useState<Record<string, any>>({});
  const [licenseCodeInput, setLicenseCodeInput] = useState('');
  
  // Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Load Data
  const fetchData = async () => {
    try {
      const resFrames = await fetch('/api/frames');
      const dataFrames = await resFrames.json();
      setFrames(dataFrames);
      
      const resSettings = await fetch('/api/settings');
      const dataSettings = await resSettings.json();
      if (dataSettings) {
        if (dataSettings.printSize) setPrintSize(dataSettings.printSize);
        if (dataSettings.whatsapp) setWhatsappSettings(dataSettings.whatsapp);
        if (dataSettings.cameraMode) setCameraMode(dataSettings.cameraMode);
      }
      
      const resLicenses = await fetch('/api/licenses');
      const dataLicenses = await resLicenses.json();
      setLicenses(dataLicenses);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Auth Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsSubmitting(true);
    
    try {
      if (authView === 'LOGIN') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
          setIsAuthenticated(true);
        } else {
          setAuthError(data.error || 'Invalid credentials');
        }
      } else if (authView === 'REGISTER') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
          setAuthSuccess('Account created successfully! Please login.');
          setAuthView('LOGIN');
          setPassword('');
        } else {
          setAuthError(data.error || 'Failed to register');
        }
      } else if (authView === 'FORGOT') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        const data = await res.json();
        if (data.success) {
          setAuthSuccess('Password reset link sent to your email.');
          setTimeout(() => setAuthView('LOGIN'), 3000);
        }
      }
    } catch (err) {
      setAuthError('Network error. Please try again.');
    }
    setIsSubmitting(false);
  };

  // Dashboard Handlers
  const saveFrames = async (newFrames: Frame[]) => {
    try {
      await fetch('/api/frames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFrames)
      });
      setFrames(newFrames);
    } catch (e) { console.error(e); }
  };

  const toggleApprove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFrames = frames.map(f => f.id === id ? { ...f, approved: !f.approved } : f);
    saveFrames(newFrames);
  };

  const deleteFrame = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to permanently delete this frame?")) {
      const newFrames = frames.filter(f => f.id !== id);
      saveFrames(newFrames);
      if (selectedImage?.id === id) setSelectedImage(null);
    }
  };

  const handleUploadPng = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newFrame: Frame = {
            id: 'custom_' + Date.now(),
            name: file.name.replace('.png', ''),
            url: event.target.result as string,
            approved: true,
            type: 'custom'
          };
          saveFrames([newFrame, ...frames]);
          setIsUploadModalOpen(false);
          alert('Frame Uploaded Successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = async (updates: any) => {
    try {
      const currentSettings = { printSize, whatsapp: whatsappSettings, cameraMode, ...updates };
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentSettings)
      });
      if (updates.printSize) setPrintSize(updates.printSize);
      if (updates.whatsapp) setWhatsappSettings(updates.whatsapp);
      if (updates.cameraMode) setCameraMode(updates.cameraMode);
      alert('Settings saved successfully!');
    } catch (e) {
      alert('Error saving settings');
    }
  };

  // Mock data for Recharts
  const chartData = [
    { name: 'Mon', prints: 120, digital: 400 },
    { name: 'Tue', prints: 200, digital: 300 },
    { name: 'Wed', prints: 150, digital: 200 },
    { name: 'Thu', prints: 300, digital: 500 },
    { name: 'Fri', prints: 400, digital: 600 },
    { name: 'Sat', prints: 600, digital: 900 },
    { name: 'Sun', prints: 500, digital: 800 },
  ];

  // Theme Colors from Primetroniq Logo
  const themeNavy = '#052a56'; // Deep Navy Blue
  const themeCyan = '#22b5c5'; // Vibrant Cyan/Teal

  // Dashboard Sidebar Menu Items
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Overview' },
    { id: 'generate-ai', icon: '✨', label: 'Generate AI Frame' },
    { id: 'upload-png', icon: '📤', label: 'Upload Custom PNG' },
    { id: 'print', icon: '🖨️', label: 'Print Config' },
    { id: 'whatsapp', icon: '💬', label: 'WhatsApp API' },
    { id: 'licenses', icon: '🔑', label: 'Licenses' },
    { id: 'downloads', icon: '💾', label: 'Download App' }
  ];

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCustomAiGenerate = () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    setTimeout(() => {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiPrompt)}?width=600&height=800&nologo=true`;
      const newFrame: Frame = { id: 'ai_' + Date.now(), name: aiPrompt.substring(0, 20) + '...', url: url, approved: true, type: 'ai' };
      saveFrames([newFrame, ...frames]);
      setAiPrompt('');
      setIsGenerating(false);
      setIsAiModalOpen(false);
      alert('AI Frame Generated Successfully!');
    }, 500);
  };

  // ==========================================
  // VIEW RENDERERS
  // ==========================================

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ backgroundColor: 'white', padding: '50px 40px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px', borderTop: `4px solid ${themeCyan}` }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <img src="/wcs.jpeg" alt="Primetroniq Innovations" style={{ width: '220px', marginBottom: '15px' }} />
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '10px', letterSpacing: '1px' }}>
              {authView === 'LOGIN' ? 'Welcome back, please sign in' : authView === 'REGISTER' ? 'Create a new admin account' : 'Reset your password'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: themeNavy, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Username / ID</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '1rem', boxSizing: 'border-box', outline: 'none', transition: 'border 0.3s' }} onFocus={e => e.target.style.borderColor = themeCyan} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>

            {authView !== 'FORGOT' && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: themeNavy, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '1rem', boxSizing: 'border-box', outline: 'none', transition: 'border 0.3s' }} onFocus={e => e.target.style.borderColor = themeCyan} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
            )}

            {authError && <div style={{ color: '#d32f2f', fontSize: '0.9rem', textAlign: 'center', backgroundColor: '#fdecea', padding: '10px', borderRadius: '6px' }}>{authError}</div>}
            {authSuccess && <div style={{ color: '#2e7d32', fontSize: '0.9rem', textAlign: 'center', backgroundColor: '#edf7ed', padding: '10px', borderRadius: '6px' }}>{authSuccess}</div>}

            <button type="submit" disabled={isSubmitting} style={{ marginTop: '10px', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: themeNavy, color: 'white', fontSize: '1rem', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', letterSpacing: '1px', transition: 'all 0.3s', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? 'Processing...' : authView === 'LOGIN' ? 'Sign In' : authView === 'REGISTER' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          <div style={{ marginTop: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {authView === 'LOGIN' ? (
              <>
                <a href="#" onClick={(e) => { e.preventDefault(); setAuthView('FORGOT'); setAuthError(''); setAuthSuccess(''); }} style={{ color: '#64748b', fontSize: '0.9rem', textDecoration: 'none' }}>Forgot password?</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setAuthView('REGISTER'); setAuthError(''); setAuthSuccess(''); }} style={{ color: themeCyan, fontSize: '0.9rem', textDecoration: 'none', fontWeight: 600 }}>Create new account</a>
              </>
            ) : (
              <a href="#" onClick={(e) => { e.preventDefault(); setAuthView('LOGIN'); setAuthError(''); setAuthSuccess(''); }} style={{ color: '#64748b', fontSize: '0.9rem', textDecoration: 'none' }}>Back to Sign In</a>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleValidateLicense = async () => {
    if (!licenseCodeInput.trim()) return;
    try {
      await fetch('/api/license/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: licenseCodeInput.trim() })
      });
      setLicenseCodeInput('');
      fetchData();
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f1f5f9', fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ width: 'var(--sidebar-width)', backgroundColor: themeNavy, display: 'flex', flexDirection: 'column', transition: 'width 0.3s' }}>
        <div style={{ padding: 'var(--logo-padding)', backgroundColor: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="/wcs.jpeg" alt="Primetroniq Innovations" style={{ width: '55%', height: 'auto' }} />
        </div>
        
        <nav style={{ flex: 1, padding: 'var(--sidebar-padding)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: 'var(--nav-gap)', padding: 'var(--nav-padding)', 
                borderRadius: '10px', border: 'none', 
                backgroundColor: activeTab === item.id ? themeCyan : 'transparent', 
                color: activeTab === item.id ? 'white' : 'rgba(255,255,255,0.7)', 
                cursor: 'pointer', fontSize: 'var(--nav-font-size)', 
                fontWeight: activeTab === item.id ? 500 : 400, 
                transition: 'all 0.2s', textAlign: 'left',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => { if(activeTab !== item.id) e.currentTarget.style.color = 'white'; }}
              onMouseOut={(e) => { if(activeTab !== item.id) e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >
              <span style={{ fontSize: 'var(--nav-icon-size)' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: 'var(--footer-padding)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--footer-card-gap)', padding: 'var(--footer-card-padding)', borderRadius: '12px', background: 'linear-gradient(145deg, #063165, #042247)', boxShadow: '5px 5px 15px rgba(0,0,0,0.3), -5px -5px 15px rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ width: 'var(--avatar-size)', height: 'var(--avatar-size)', borderRadius: '50%', background: 'linear-gradient(145deg, #25c2d3, #1fa3b1)', boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.3), inset -2px -2px 5px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'calc(var(--avatar-size) * 0.5)', color: 'white', flexShrink: 0 }}>
              👤
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--admin-name-size)', fontWeight: 500, color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{username || 'Admin'}</div>
              <div style={{ fontSize: 'var(--admin-role-size)', color: themeCyan, textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Admin</div>
            </div>
            <button onClick={() => { setIsAuthenticated(false); setUsername(''); setPassword(''); }} style={{ width: 'var(--avatar-size)', height: 'var(--avatar-size)', background: '#ef4444', border: 'none', cursor: 'pointer', color: 'white', borderRadius: '8px', boxShadow: '0 4px 10px rgba(239,68,68,0.4)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} title="Logout">
              <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 'var(--main-padding)', boxSizing: 'border-box' }}>
        
        {/* DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div style={{ width: '100%' }}>
            <h1 style={{ fontSize: 'var(--h1-size)', color: themeNavy, marginBottom: '30px', fontWeight: 600 }}>System Overview</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(var(--card-grid-min), 1fr))', gap: '25px', marginBottom: '40px' }}>
              <div style={{ backgroundColor: 'white', padding: 'calc(var(--card-padding) * 0.6) var(--card-padding)', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', borderLeft: `5px solid ${themeNavy}` }}>
                <div style={{ color: '#64748b', fontSize: 'var(--body-text-small)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 500 }}>Total Frames</div>
                <div style={{ fontSize: 'var(--stat-value-size)', fontWeight: 600, color: themeNavy, lineHeight: 1.1 }}>{frames.length}</div>
                <div style={{ color: themeCyan, fontSize: 'var(--body-text-small)', marginTop: '4px', fontWeight: 500 }}>Active & Ready</div>
              </div>
              <div style={{ backgroundColor: 'white', padding: 'calc(var(--card-padding) * 0.6) var(--card-padding)', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', borderLeft: `5px solid ${themeNavy}` }}>
                <div style={{ color: '#64748b', fontSize: 'var(--body-text-small)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 500 }}>Print Format</div>
                <div style={{ fontSize: 'var(--stat-value-size)', fontWeight: 600, color: themeNavy, lineHeight: 1.1 }}>{printSize}</div>
                <div style={{ color: '#64748b', fontSize: 'var(--body-text-small)', marginTop: '4px', fontWeight: 400 }}>Standard Layout</div>
              </div>
              <div style={{ backgroundColor: 'white', padding: 'calc(var(--card-padding) * 0.6) var(--card-padding)', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', borderLeft: `5px solid ${themeCyan}` }}>
                <div style={{ color: '#64748b', fontSize: 'var(--body-text-small)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 500 }}>WhatsApp Integration</div>
                <div style={{ fontSize: 'var(--body-text-large)', fontWeight: 500, color: whatsappSettings.apiUrl ? themeNavy : '#94a3b8', marginTop: '8px' }}>
                  {whatsappSettings.apiUrl ? '🟢 Configured' : '🔴 Not Configured'}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: 'var(--card-padding)', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 30px 0', color: themeNavy, fontSize: 'var(--card-title-size)', fontWeight: 700 }}>Activity Trend (Last 7 Days)</h3>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="prints" name="Physical Prints" fill={themeNavy} radius={[6, 6, 0, 0]} barSize={30} />
                    <Bar dataKey="digital" name="Digital Shares" fill={themeCyan} radius={[6, 6, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* GENERATE AI FRAME PAGE */}
        {activeTab === 'generate-ai' && (
          <div style={{ width: '100%' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
              <div>
                <h1 style={{ fontSize: 'var(--h1-size)', color: themeNavy, margin: '0 0 15px 0', fontWeight: 700 }}>✨ Generate AI Frame</h1>
                <div style={{ backgroundColor: 'white', padding: '15px 25px', borderRadius: '12px', borderLeft: `5px solid ${themeCyan}`, boxShadow: '0 4px 10px rgba(0,0,0,0.02)', display: 'inline-block' }}>
                   <div style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600 }}>Total AI Frames Generated</div>
                   <div style={{ fontSize: '2rem', color: themeNavy, fontWeight: 700 }}>{frames.filter(f => f.type === 'ai').length}</div>
                </div>
              </div>
              <button 
                onClick={() => setIsAiModalOpen(true)} 
                style={{ padding: '14px 28px', backgroundColor: themeCyan, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1.05rem', boxShadow: '0 4px 15px rgba(34,181,197,0.3)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'transform 0.2s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: '1.4rem', fontWeight: 300 }}>+</span> Create New AI Frame
              </button>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px' }}>
                {frames.filter(f => f.type === 'ai').map((frame) => (
                  <div key={frame.id} onClick={() => setSelectedImage(frame)} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', cursor: 'pointer', position: 'relative' }}>
                    <div style={{ height: '180px', backgroundColor: '#f1f5f9', backgroundImage: `url(${frame.url})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: frame.approved ? 1 : 0.4 }} />
                    <div style={{ padding: '10px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: themeNavy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{frame.name}</div>
                    </div>
                    <button onClick={(e) => toggleApprove(frame.id, e)} style={{ position: 'absolute', top: '5px', right: '5px', background: frame.approved ? themeNavy : '#ef4444', color: 'white', border: 'none', borderRadius: '50px', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
                      {frame.approved ? 'Active' : 'Off'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* UPLOAD FRAME PAGE */}
        {activeTab === 'upload-png' && (
          <div style={{ width: '100%' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
              <div>
                <h1 style={{ fontSize: 'var(--h1-size)', color: themeNavy, margin: '0 0 15px 0', fontWeight: 700 }}>📤 Upload Custom PNG</h1>
                <div style={{ backgroundColor: 'white', padding: '15px 25px', borderRadius: '12px', borderLeft: `5px solid ${themeCyan}`, boxShadow: '0 4px 10px rgba(0,0,0,0.02)', display: 'inline-block' }}>
                   <div style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600 }}>Total Custom Uploads</div>
                   <div style={{ fontSize: '2rem', color: themeNavy, fontWeight: 700 }}>{frames.filter(f => f.type === 'custom').length}</div>
                </div>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(true)} 
                style={{ padding: '14px 28px', backgroundColor: themeCyan, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1.05rem', boxShadow: '0 4px 15px rgba(34,181,197,0.3)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'transform 0.2s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <span style={{ fontSize: '1.4rem', fontWeight: 300 }}>+</span> Upload New PNG
              </button>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px' }}>
                {frames.filter(f => f.type === 'custom').map((frame) => (
                  <div key={frame.id} onClick={() => setSelectedImage(frame)} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', cursor: 'pointer', position: 'relative' }}>
                    <div style={{ height: '180px', backgroundColor: '#f1f5f9', backgroundImage: `url(${frame.url})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: frame.approved ? 1 : 0.4 }} />
                    <div style={{ padding: '10px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: themeNavy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{frame.name}</div>
                    </div>
                    <button onClick={(e) => toggleApprove(frame.id, e)} style={{ position: 'absolute', top: '5px', right: '5px', background: frame.approved ? themeNavy : '#ef4444', color: 'white', border: 'none', borderRadius: '50px', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
                      {frame.approved ? 'Active' : 'Off'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}



        {/* PRINT SETTINGS */}
        {activeTab === 'print' && (
          <div style={{ width: '100%' }}>
            <h1 style={{ fontSize: 'var(--h1-size)', color: themeNavy, marginBottom: '30px', fontWeight: 700 }}>Print Configuration</h1>
            <div style={{ backgroundColor: 'white', padding: 'var(--card-padding)', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
              <h3 style={{ margin: '0 0 20px 0', color: themeNavy, fontWeight: 600, fontSize: 'var(--body-text-large)' }}>Select Paper Size</h3>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                {['4x6', '5x7', '2x6', '8x10'].map(size => (
                  <label key={size} style={{ flex: 1, padding: '20px', border: printSize === size ? `2px solid ${themeCyan}` : '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', backgroundColor: printSize === size ? '#e0f2fe' : 'white' }}>
                    <input type="radio" name="printSize" value={size} checked={printSize === size} onChange={(e) => setPrintSize(e.target.value)} style={{ display: 'none' }} />
                    <div style={{ fontSize: 'var(--body-text-large)', fontWeight: 700, color: themeNavy }}>{size}</div>
                    <div style={{ fontSize: 'var(--body-text-small)', color: '#64748b', marginTop: '5px', fontWeight: 500 }}>Standard</div>
                  </label>
                ))}
              </div>
              <button onClick={() => saveSettings({ printSize })} style={{ padding: '14px 30px', backgroundColor: themeNavy, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--body-text-base)' }}>Save Print Settings</button>
            </div>

            <div style={{ backgroundColor: 'white', padding: 'var(--card-padding)', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 20px 0', color: themeNavy, fontWeight: 600, fontSize: 'var(--body-text-large)' }}>Camera Input Mode</h3>
              <p style={{ color: '#64748b', fontSize: 'var(--body-text-base)', marginBottom: '20px', marginTop: '-10px' }}>
                Choose whether the photo booth uses a Canon DSLR (requires USB connection & digiCamControl) or the built-in webcam.
              </p>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                {[
                  { value: 'dslr', label: 'Canon DSLR Camera', desc: 'Uses USB control & digiCamControl' },
                  { value: 'webcam', label: 'Web Camera (Selfie)', desc: 'Uses built-in web camera stream' }
                ].map(mode => (
                  <label key={mode.value} style={{ flex: 1, padding: '20px', border: cameraMode === mode.value ? `2px solid ${themeCyan}` : '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', backgroundColor: cameraMode === mode.value ? '#e0f2fe' : 'white' }}>
                    <input type="radio" name="cameraMode" value={mode.value} checked={cameraMode === mode.value} onChange={(e) => setCameraMode(e.target.value as any)} style={{ display: 'none' }} />
                    <div style={{ fontSize: 'var(--body-text-large)', fontWeight: 700, color: themeNavy }}>{mode.label}</div>
                    <div style={{ fontSize: 'var(--body-text-small)', color: '#64748b', marginTop: '5px', fontWeight: 500 }}>{mode.desc}</div>
                  </label>
                ))}
              </div>
              <button onClick={() => saveSettings({ cameraMode })} style={{ padding: '14px 30px', backgroundColor: themeNavy, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--body-text-base)' }}>Save Camera Settings</button>
            </div>
          </div>
        )}

        {/* WHATSAPP SETTINGS */}
        {activeTab === 'whatsapp' && (
          <div style={{ width: '100%' }}>
            <h1 style={{ fontSize: 'var(--h1-size)', color: themeNavy, marginBottom: '30px', fontWeight: 700 }}>WhatsApp API Settings</h1>
            <div style={{ backgroundColor: 'white', padding: 'var(--card-padding)', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--body-text-small)', color: themeNavy, fontWeight: 600 }}>API URL Endpoint</label>
                  <input type="text" value={whatsappSettings.apiUrl} onChange={e => setWhatsappSettings({...whatsappSettings, apiUrl: e.target.value})} placeholder="https://api.whatsapp.provider.com/v1/messages" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 'var(--body-text-base)', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = themeCyan} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--body-text-small)', color: themeNavy, fontWeight: 600 }}>API Bearer Token / Key</label>
                  <input type="password" value={whatsappSettings.apiKey} onChange={e => setWhatsappSettings({...whatsappSettings, apiKey: e.target.value})} placeholder="Enter your secret token" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 'var(--body-text-base)', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = themeCyan} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--body-text-small)', color: themeNavy, fontWeight: 600 }}>Sender Phone Number ID</label>
                  <input type="text" value={whatsappSettings.senderNumber} onChange={e => setWhatsappSettings({...whatsappSettings, senderNumber: e.target.value})} placeholder="1234567890" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 'var(--body-text-base)', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = themeCyan} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>

                <div style={{ marginTop: '10px' }}>
                  <button onClick={() => saveSettings({ whatsapp: whatsappSettings })} style={{ padding: '14px 30px', backgroundColor: themeNavy, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--body-text-base)' }}>Save WhatsApp Config</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LICENSES SETTINGS */}
        {activeTab === 'licenses' && (
          <div style={{ width: '100%' }}>
            <h1 style={{ fontSize: 'var(--h1-size)', color: themeNavy, marginBottom: '30px', fontWeight: 700 }}>Manage Licenses</h1>
            <div style={{ backgroundColor: 'white', padding: 'var(--card-padding)', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
              
              <p style={{ color: '#64748b', marginBottom: '30px', fontSize: 'var(--body-text-large)' }}>Authorize machines to use the Photo Booth executable indefinitely. Unregistered machines lock out after 3 trial selfies.</p>
              
              <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
                <input 
                  type="text" 
                  value={licenseCodeInput} 
                  onChange={(e) => setLicenseCodeInput(e.target.value)} 
                  placeholder="Enter 6-Digit Setup Code"
                  style={{ padding: '16px 20px', fontSize: 'var(--body-text-large)', borderRadius: '12px', border: '2px solid #e2e8f0', flex: 1, outline: 'none' }}
                />
                <button onClick={handleValidateLicense} style={{ padding: '16px 32px', backgroundColor: themeCyan, color: 'white', border: 'none', borderRadius: '12px', fontSize: 'var(--body-text-large)', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s' }}>
                  Authorize Machine
                </button>
              </div>

              <h3 style={{ fontSize: 'var(--card-title-size)', marginBottom: '20px', color: themeNavy, fontWeight: '700' }}>Authorized & Registered Machines</h3>
              <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px 20px', color: themeNavy, fontWeight: '700', fontSize: 'var(--body-text-small)' }}>Machine ID</th>
                      <th style={{ padding: '16px 20px', color: themeNavy, fontWeight: '700', fontSize: 'var(--body-text-small)' }}>Setup Code</th>
                      <th style={{ padding: '16px 20px', color: themeNavy, fontWeight: '700', fontSize: 'var(--body-text-small)' }}>Target Printer</th>
                      <th style={{ padding: '16px 20px', color: themeNavy, fontWeight: '700', fontSize: 'var(--body-text-small)' }}>Selfies Taken</th>
                      <th style={{ padding: '16px 20px', color: themeNavy, fontWeight: '700', fontSize: 'var(--body-text-small)' }}>Status</th>
                      <th style={{ padding: '16px 20px', color: themeNavy, fontWeight: '700', fontSize: 'var(--body-text-small)' }}>Activated At</th>
                      <th style={{ padding: '16px 20px', color: themeNavy, fontWeight: '700', fontSize: 'var(--body-text-small)', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(licenses).length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>No registered machines found.</td>
                      </tr>
                    ) : (
                      Object.entries(licenses).map(([hardwareId, details]: [string, any]) => (
                        <tr key={hardwareId} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '16px 20px', fontWeight: '600', color: themeNavy, fontSize: 'var(--body-text-small)' }}>{hardwareId}</td>
                          <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontSize: 'var(--body-text-large)', fontWeight: 'bold', color: '#64748b', letterSpacing: '1px' }}>{details.shortCode || 'N/A'}</td>
                          <td style={{ padding: '16px 20px' }}>
                            {details.printers && details.printers.length > 0 ? (
                              <select
                                value={details.selectedPrinter || ''}
                                onChange={async (e) => {
                                  const val = e.target.value;
                                  try {
                                    const res = await fetch('/api/license/select-printer', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ hardwareId, printer: val })
                                    });
                                    if (res.ok) {
                                      alert('Target printer updated successfully!');
                                      fetchData();
                                    } else {
                                      alert('Failed to update target printer');
                                    }
                                  } catch (err) {
                                    alert('Error updating target printer');
                                  }
                                }}
                                style={{ padding: '8px 12px', fontSize: 'var(--body-text-small)', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#f8fafc', color: themeNavy, fontWeight: '500' }}
                              >
                                <option value="">-- Select Printer --</option>
                                {details.printers.map((p: any) => (
                                  <option key={p.name} value={p.name}>
                                    {p.name} {p.isDefault ? '(Default)' : ''}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 'var(--body-text-small)' }}>No printers detected</span>
                            )}
                          </td>
                          <td style={{ padding: '16px 20px', fontWeight: '600', color: themeNavy, fontSize: 'var(--body-text-small)' }}>{details.selfieCount ?? 0}</td>
                          <td style={{ padding: '16px 20px' }}>
                            {details.validated ? (
                              <span style={{ color: '#059669', fontWeight: 'bold', backgroundColor: '#d1fae5', padding: '6px 16px', borderRadius: '30px', fontSize: 'var(--body-text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-block' }}>✓ Authorized</span>
                            ) : (
                              <span style={{ color: '#d97706', fontWeight: 'bold', backgroundColor: '#fef3c7', padding: '6px 16px', borderRadius: '30px', fontSize: 'var(--body-text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-block' }}>⏳ Pending</span>
                            )}
                          </td>
                          <td style={{ padding: '16px 20px', color: '#64748b', fontSize: 'var(--body-text-small)' }}>
                            {details.validatedAt ? new Date(details.validatedAt).toLocaleString() : '—'}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            {!details.validated && (
                              <button 
                                onClick={async () => {
                                  if (details.shortCode) {
                                    try {
                                      const res = await fetch('/api/license/validate', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ code: details.shortCode })
                                      });
                                      if (res.ok) {
                                        alert('Machine authorized successfully!');
                                        fetchData();
                                      } else {
                                        alert('Failed to authorize machine');
                                      }
                                    } catch (e) {
                                      alert('Error authorizing machine');
                                    }
                                  }
                                }} 
                                style={{ padding: '8px 16px', backgroundColor: themeCyan, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: 'var(--body-text-xs)', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(34,181,197,0.2)' }}
                              >
                                Authorize
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DOWNLOAD APP PAGE */}
        {activeTab === 'downloads' && (
          <div style={{ width: '100%' }}>
            <h1 style={{ fontSize: 'var(--h1-size)', color: themeNavy, marginBottom: '30px', fontWeight: 700 }}>Download Photo Booth Application</h1>
            
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', marginBottom: '35px', fontSize: 'var(--body-text-large)', lineHeight: '1.6' }}>
                Download the compiled desktop application builds for the Photo Booth kiosk machines. These executables are configured to automatically load this panel's settings, templates, custom frames, and native camera hardware permissions.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '20px' }}>
                {/* Installer Card */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: themeCyan, color: 'white', padding: '6px 15px', fontSize: 'var(--body-text-xs)', fontWeight: 'bold', borderBottomLeftRadius: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Recommended</div>
                  <div>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📦</div>
                    <h3 style={{ fontSize: 'var(--card-title-size)', fontWeight: '700', color: themeNavy, margin: '0 0 10px 0' }}>Setup Installer</h3>
                    <p style={{ color: '#64748b', fontSize: 'var(--body-text-small)', margin: '0 0 25px 0', lineHeight: '1.5' }}>
                      Standard Windows installation package. Automatically configures desktop shortcuts, registers startup triggers, and handles permissions cleanly.
                    </p>
                  </div>
                  <a 
                    href="/download/Photo%20Booth%20Setup%201.0.0.exe" 
                    download
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px 24px', backgroundColor: themeNavy, color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: 'var(--body-text-base)', transition: 'background-color 0.2s', textAlign: 'center' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#0b3a70'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = themeNavy}
                  >
                    📥 Download Installer (89 MB)
                  </a>
                </div>

                {/* Portable Card */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                  <div>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🏃</div>
                    <h3 style={{ fontSize: 'var(--card-title-size)', fontWeight: '700', color: themeNavy, margin: '0 0 10px 0' }}>Portable Build</h3>
                    <p style={{ color: '#64748b', fontSize: 'var(--body-text-small)', margin: '0 0 25px 0', lineHeight: '1.5' }}>
                      Standalone executable. Runs immediately without installation. Perfect for quick testing, diagnostic checks, or executing from a USB drive.
                    </p>
                  </div>
                  <a 
                    href="/download/Photo%20Booth%201.0.0.exe" 
                    download
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px 24px', backgroundColor: 'transparent', color: themeNavy, border: `2px solid ${themeNavy}`, textDecoration: 'none', borderRadius: '8px', fontWeight: 600, fontSize: 'var(--body-text-base)', transition: 'all 0.2s', textAlign: 'center' }}
                    onMouseOver={e => { e.currentTarget.style.backgroundColor = themeNavy; e.currentTarget.style.color = 'white'; }}
                    onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = themeNavy; }}
                  >
                    📥 Download Portable (88 MB)
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
      {/* Frame Preview Modal */}
      {selectedImage && (
        <div onClick={() => setSelectedImage(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', maxWidth: '600px', width: '90%' }}>
            <img src={selectedImage.url} style={{ width: '100%', borderRadius: '8px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button onClick={() => setSelectedImage(null)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Close</button>
              <button onClick={(e) => deleteFrame(selectedImage.id, e)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Delete Frame</button>
            </div>
          </div>
        </div>
      )}
      
      {/* AI Generate Modal */}
      {isAiModalOpen && (
        <div onClick={() => setIsAiModalOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', maxWidth: '600px', width: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', borderTop: `4px solid ${themeCyan}` }}>
            <h3 style={{ margin: '0 0 15px 0', color: themeNavy, fontWeight: 700, fontSize: '1.5rem' }}>Create New AI Frame</h3>
            <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.95rem' }}>Enter a descriptive prompt and our AI will generate a unique photobooth frame.</p>
            
            <textarea 
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="e.g. A futuristic cyberpunk neon border..."
              style={{ width: '100%', height: '140px', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1.05rem', boxSizing: 'border-box', outline: 'none', resize: 'none', marginBottom: '25px', fontFamily: "'Outfit', sans-serif" }}
              onFocus={e => e.target.style.borderColor = themeCyan} 
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
              <button onClick={() => setIsAiModalOpen(false)} style={{ padding: '12px 24px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button 
                onClick={handleCustomAiGenerate}
                disabled={isGenerating || !aiPrompt}
                style={{ padding: '12px 24px', backgroundColor: isGenerating || !aiPrompt ? '#94a3b8' : themeCyan, color: 'white', border: 'none', borderRadius: '8px', cursor: isGenerating || !aiPrompt ? 'not-allowed' : 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
              >
                {isGenerating ? 'Generating...' : 'Generate New Frame'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload PNG Modal */}
      {isUploadModalOpen && (
        <div onClick={() => setIsUploadModalOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', maxWidth: '600px', width: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', borderTop: `4px solid ${themeCyan}` }}>
            <h3 style={{ margin: '0 0 15px 0', color: themeNavy, fontWeight: 700, fontSize: '1.5rem' }}>Upload Custom Overlay</h3>
            <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '0.95rem' }}>Upload a transparent PNG file to use directly as a photobooth frame.</p>
            
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '220px', border: `2px dashed ${themeCyan}`, borderRadius: '12px', backgroundColor: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '25px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#e0f2fe'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#f8fafc'}>
              <span style={{ fontSize: '3rem', marginBottom: '15px' }}>📁</span>
              <span style={{ fontSize: '1.2rem', color: themeNavy, fontWeight: 600 }}>Click to browse files</span>
              <span style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '10px' }}>Supports transparent PNG files</span>
              <input 
                type="file" 
                accept="image/png" 
                onChange={handleUploadPng} 
                style={{ display: 'none' }} 
              />
            </label>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsUploadModalOpen(false)} style={{ padding: '12px 24px', backgroundColor: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
