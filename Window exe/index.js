const { app, BrowserWindow, Menu, globalShortcut, ipcMain, session } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    kiosk: true, // Forces full screen kiosk mode
    fullscreen: true,
    autoHideMenuBar: true,
    alwaysOnTop: true, // Optional, keeps it above other apps
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Necessary if hitting local APIs with different ports
      sandbox: false
    }
  });

  // Remove the default menu completely
  Menu.setApplicationMenu(null);

  // Clear cache on launch to ensure the latest frontend updates are loaded
  mainWindow.webContents.session.clearCache().then(() => {
    mainWindow.loadURL('https://photobooth.woodcliff.co.in/');
  });

  // Block basic shortcuts to prevent user escape
  globalShortcut.register('CommandOrControl+W', () => {
    console.log('User attempted to close window');
  });

  // Enable Ctrl+R to reload ignoring cache (for testing/updating purposes)
  globalShortcut.register('CommandOrControl+R', () => {
    mainWindow.webContents.reloadIgnoringCache();
  });

  // Ensure fullscreen stays active
  mainWindow.on('leave-full-screen', () => {
    mainWindow.setFullScreen(true);
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

const os = require('os');
const { execSync } = require('child_process');
const crypto = require('crypto');

ipcMain.handle('get-hardware-id', async () => {
  let mac = 'UNKNOWN-MAC';
  const networkInterfaces = os.networkInterfaces();
  for (const key in networkInterfaces) {
    const ifaces = networkInterfaces[key];
    if (ifaces) {
      for (const iface of ifaces) {
        if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
          mac = iface.mac.toUpperCase();
          break;
        }
      }
    }
    if (mac !== 'UNKNOWN-MAC') break;
  }

  let serial = 'UNKNOWN-SERIAL';
  try {
    const stdout = execSync('wmic baseboard get serialnumber', { encoding: 'utf-8' });
    const lines = stdout.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length > 1) {
      serial = lines[1];
    }
  } catch (e) {
    console.error('Failed to get motherboard serial:', e);
  }

  const rawId = `${mac}-${serial}`;
  const hash = crypto.createHash('sha256').update(rawId).digest('hex').toUpperCase();
  return `${hash.substring(0,4)}-${hash.substring(4,8)}-${hash.substring(8,12)}`;
});

const sendKioskLog = (message, level = 'INFO') => {
  console.log(`[KIOSK-MAIN] [${level}] ${message}`);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('electron-log', { msg: message, level });
  }
};

ipcMain.handle('get-printers-list', async () => {
  sendKioskLog("get-printers-list IPC triggered", "INFO");
  let win = new BrowserWindow({ show: false });
  try {
    const printers = await win.webContents.getPrintersAsync();
    sendKioskLog(`get-printers-list found ${printers.length} printers: ${JSON.stringify(printers.map(p => p.name))}`, "INFO");
    win.close();
    return printers;
  } catch (err) {
    sendKioskLog(`get-printers-list failed: ${err.message}`, "ERROR");
    win.close();
    return [];
  }
});

// Handle Silent Printing from React App
ipcMain.on('print-silent', (event, { imgData, cssSize, printerName }) => {
  sendKioskLog(`print-silent IPC received. Target printerName: ${printerName}, cssSize: ${cssSize}`, "INFO");
  
  const fs = require('fs');
  try {
    const userDataPath = app.getPath('userData');
    
    // Extract base64 image data
    const base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    const imgPath = path.join(userDataPath, 'temp-print-image.jpg');
    
    // Write image to local disk
    fs.writeFileSync(imgPath, base64Data, 'base64');
    sendKioskLog(`Temporary image written to: ${imgPath}`, "INFO");

    // Dynamic Paper Size Calculation in Microns (e.g. "4in 6in", "5in 7in", "8in 10in", "2in 6in", etc.)
    const getPageSizeMicrons = (sizeStr) => {
      if (!sizeStr) return { width: 101600, height: 152400 }; // default 4x6
      const clean = sizeStr.toLowerCase()
        .replace(/in/g, '')
        .replace(/[\*\s]+/g, 'x')
        .replace(/x+/g, 'x')
        .trim();
      
      const parts = clean.split('x');
      if (parts.length === 2) {
        const w = parseInt(parts[0], 10);
        const h = parseInt(parts[1], 10);
        if (!isNaN(w) && !isNaN(h)) {
          return { width: w * 25400, height: h * 25400 };
        }
      }
      return { width: 101600, height: 152400 }; // default 4x6
    };

    const micronsSize = getPageSizeMicrons(cssSize);
    const isLandscape = micronsSize.width > micronsSize.height;
    sendKioskLog(`Computed micronsSize: ${JSON.stringify(micronsSize)}, isLandscape: ${isLandscape}`, "INFO");

    // Find default printer if target printerName is not set
    let targetDeviceName = printerName;
    if (!targetDeviceName) {
      const { execSync } = require('child_process');
      try {
        const defaultPrinter = execSync('powershell -NoProfile -Command "(Get-CimInstance CIM_Printer | Where-Object { $_.Default -eq $true }).Name"').toString().trim();
        targetDeviceName = defaultPrinter;
      } catch (err) {
        sendKioskLog(`Failed to fetch default printer via Get-CimInstance: ${err.message}`, "ERROR");
      }
    }
    
    if (!targetDeviceName) {
      targetDeviceName = "EPSON PM-520 Series"; // Fallback target
    }
    
    sendKioskLog(`Target printer for native printing: "${targetDeviceName}"`, "INFO");

    // Execute native PowerShell print
    const { exec } = require('child_process');
    
    const landscapeSetting = isLandscape ? "$doc.DefaultPageSettings.Landscape = $true;" : "";
    const escapedImgPath = imgPath.replace(/'/g, "''");
    const escapedPrinterName = targetDeviceName.replace(/'/g, "''");
    
    const psCommand = `
      Add-Type -AssemblyName System.Drawing;
      $doc = New-Object System.Drawing.Printing.PrintDocument;
      $doc.PrinterSettings.PrinterName = '${escapedPrinterName}';
      ${landscapeSetting}
      $doc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(0,0,0,0);
      $doc.add_PrintPage({
        param($sender, $e)
        $img = [System.Drawing.Image]::FromFile('${escapedImgPath}');
        $bounds = $e.Graphics.VisibleClipBounds;
        $e.Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic;
        $e.Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality;
        $e.Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality;
        $e.Graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality;
        $rect = New-Object System.Drawing.RectangleF(-20, -20, ($bounds.Width + 40), ($bounds.Height + 40));
        $e.Graphics.DrawImage($img, $rect);
        $img.Dispose();
      });
      $doc.Print();
    `;
    
    const cleanCmd = psCommand.replace(/\r?\n/g, ' ').trim();
    
    sendKioskLog(`Spawning powershell native print command...`, "INFO");
    exec(`powershell -NoProfile -Command "${cleanCmd}"`, (error, stdout, stderr) => {
      if (error) {
        sendKioskLog(`Native print command failed: ${error.message}. Stderr: ${stderr}`, "ERROR");
        event.reply('print-reply', { success: false, error: error.message, printer: targetDeviceName });
      } else {
        sendKioskLog(`Native print command executed successfully! Stdout: ${stdout}`, "INFO");
        event.reply('print-reply', { success: true, printer: targetDeviceName });
      }
    });

  } catch (err) {
    sendKioskLog(`Error in print-silent handler: ${err.message}`, "ERROR");
    event.reply('print-reply', { success: false, error: err.message });
  }
});



// Request media access (Camera/Mic) automatically without prompting
app.commandLine.appendSwitch('use-fake-ui-for-media-stream');

app.whenReady().then(() => {
  // Explicitly grant media permissions in the Electron session
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true);
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    return true;
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
