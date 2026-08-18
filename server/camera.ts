import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util';

const execAsync = util.promisify(exec);

export async function captureDSLRPhoto(outputDir: string): Promise<{ filename: string; useWebcamFallback: boolean }> {
  const filename = `capture_${Date.now()}.jpg`;
  const outputPath = path.join(outputDir, filename);
  
  // Define check paths for both WSL mounted drive and native Windows
  const wslCmdPath = '/mnt/c/Program Files (x86)/digiCamControl/CameraControlCmd.exe';
  const winCmdPath = 'C:\\Program Files (x86)\\digiCamControl\\CameraControlCmd.exe';

  let resolvedPath = '';
  if (fs.existsSync(wslCmdPath)) {
    resolvedPath = `"${wslCmdPath}"`;
  } else if (fs.existsSync(winCmdPath)) {
    resolvedPath = `"${winCmdPath}"`;
  }

  // Auto-Detect: If digiCamControl is not installed, signal client to use webcam fallback
  if (!resolvedPath) {
    console.log('digiCamControl is not installed. Auto-detect signaling Web Camera fallback mode.');
    return { filename: '', useWebcamFallback: true };
  }

  try {
    console.log('Triggering DSLR via:', resolvedPath);
    await execAsync(`${resolvedPath} /capture /filename "${outputPath}"`);
    return { filename: filename, useWebcamFallback: false };
  } catch (error: any) {
    console.error('DSLR Capture Error:', error.message);
    throw new Error(`DSLR Shutter Trigger Failed: ${error.message}. Make sure your DSLR is connected via USB and powered on.`);
  }
}
