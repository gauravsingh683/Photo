import { exec, execSync } from 'child_process';
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

       // --- 90 DEGREES ROTATION ON WINDOWS ---
       try {
         console.log('Rotating captured image 90 degrees...');
         const winPath = execSync(`wslpath -w "${outputPath}"`).toString().trim();
          const rotateCmd = `powershell.exe -Command "[Reflection.Assembly]::LoadWithPartialName('System.Drawing'); $img = [System.Drawing.Image]::FromFile('${winPath}'); $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone); $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageDecoders() | Where-Object { $_.FormatID -eq [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid }; $encoder = [System.Drawing.Imaging.Encoder]::Quality; $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1); $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, 100); $img.Save('${winPath}', $codec, $encoderParams); $img.Dispose();"`;
         await execAsync(rotateCmd);
         console.log('Image rotated successfully:', winPath);
       } catch (rotateErr: any) {
         console.error('Failed to rotate captured image:', rotateErr.message);
       }

       return filename;
    } else {
       throw new Error('digiCamControl is not installed. DSLR cannot be triggered.');
    }
  } catch (error: any) {
    console.error('DSLR Capture Error:', error.message);
    throw new Error('DSLR Disconnected. Please plug in the DSLR camera and verify digiCamControl is running.');
  }
}
