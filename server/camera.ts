import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util';

const execAsync = util.promisify(exec);

export async function captureDSLRPhoto(outputDir: string): Promise<string> {
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

  if (!resolvedPath) {
    throw new Error('digiCamControl is not installed on your Windows PC. Please download and install it from http://digicamcontrol.com/ to trigger your DSLR.');
  }

  try {
    console.log('Triggering DSLR via:', resolvedPath);
    await execAsync(`${resolvedPath} /capture /filename "${outputPath}"`);
    return filename;
  } catch (error: any) {
    console.error('DSLR Capture Error:', error.message);
    throw new Error(`DSLR Shutter Trigger Failed: ${error.message}. Make sure your DSLR is connected via USB and powered on.`);
  }
}
