$ErrorActionPreference = "Continue"

$appTsxPath = "c:\Photo\booth-app\src\App.tsx"
$content = Get-Content $appTsxPath -Raw

# Replace the skin smoothing drawing logic to fix the opacity and blending
$oldLogic = @"
           // Now anything we draw is ONLY applied to the skin (eyes/mouth/eyebrows are perfectly protected!)
           // Apply a smoothing blur and brightness boost
           ctx.filter = 'blur(6px) brightness(1.1) saturate(1.1)';
           ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
           
           // Add a very subtle pink blush to the skin layer
           ctx.fillStyle = 'rgba(255, 180, 180, 0.1)';
           ctx.fillRect(0, 0, canvas.width, canvas.height);
"@

$newLogic = @"
           // We must lower the opacity so we blend the blurred skin with the real skin!
           // This preserves the nose, shadows, and natural 3D contours of the face.
           ctx.globalAlpha = 0.4;
           ctx.filter = 'blur(8px) brightness(1.1) saturate(1.2)';
           ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
           
           // Restore opacity
           ctx.globalAlpha = 1.0;
"@

$content = $content.Replace($oldLogic, $newLogic)
Set-Content -Path $appTsxPath -Value $content

Write-Host "Opacity fix applied to App.tsx!"
