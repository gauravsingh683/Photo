import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util';

const execAsync = util.promisify(exec);

export async function captureDSLRPhoto(outputDir: string): Promise<string> {
  const filename = `capture_${Date.now()}.jpg`;
  const outputPath = path.join(outputDir, filename);
  
  try {
    // Attempt to use digiCamControl CLI (Standard Windows DSLR Software)
    const cmdPath = `"C:\\Program Files (x86)\\digiCamControl\\CameraControlCmd.exe"`;
    
    // Check if digiCamControl is installed
    if (fs.existsSync('C:\\Program Files (x86)\\digiCamControl\\CameraControlCmd.exe')) {
       console.log('Triggering DSLR...');
       await execAsync(`${cmdPath} /capture /filename "${outputPath}"`);
       return filename;
    } else {
       throw new Error('digiCamControl is not installed. DSLR cannot be triggered.');
    }
  } catch (error: any) {
    console.error('DSLR Capture Error:', error.message);
    throw new Error('DSLR Disconnected. Please plug in the DSLR camera and verify digiCamControl is running.');
  }
}
