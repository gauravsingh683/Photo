import re

file_path = r'C:\Photo\booth-app\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the import
content = content.replace(
    "import { Camera, RefreshCcw, Download, Printer, Share2, Home, Wand2, Image as ImageIcon, CheckCircle, XCircle, Heart, MessageCircle, Send } from 'lucide-react';",
    "import { Camera, RefreshCcw, Download, Printer, Share2, Home, Wand2, Image as ImageIcon, CheckCircle, XCircle, Heart, MessageCircle, Send, Check } from 'lucide-react';"
)

# 2. Remove misplaced modal
bad_modal = """
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
        )}"""

content = content.replace(bad_modal, "")

# 3. Add modal at the end
good_modal = """
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
"""

content = content.replace("    </div>\n  );\n}", good_modal + "\n    </div>\n  );\n}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
