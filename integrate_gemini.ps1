$ErrorActionPreference = "Continue"

Write-Host "Updating PhotosController.cs..."

$controllerCode = @"
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;
using System.Net.Http.Headers;

namespace AIPhotoBooth.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PhotosController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<PhotosController> _logger;
        private readonly HttpClient _httpClient;

        public PhotosController(IConfiguration configuration, ILogger<PhotosController> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClient = new HttpClient();
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessPhoto([FromBody] PhotoProcessRequest request)
        {
            try
            {
                var apiKey = _configuration["AIProvider:ApiKey"];
                _logger.LogInformation("Processing photo with theme {Theme} using Gemini API", request.Theme);

                if (string.IsNullOrEmpty(apiKey) || apiKey.Contains("PASTE_YOUR_OPENAI_OR_CODEX"))
                {
                    return StatusCode(500, "API Key is missing or invalid in appsettings.json");
                }

                // Strip the "data:image/jpeg;base64," prefix if it exists
                var base64Data = request.ImageBase64;
                if (base64Data.Contains(","))
                {
                    base64Data = base64Data.Substring(base64Data.IndexOf(",") + 1);
                }

                var prompt = $"Analyze this person's face and outfit. Write a fun, 2-sentence highly creative description of what they would look like if they were a character in a {request.Theme} movie/world. Be enthusiastic and descriptive!";

                var payload = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new object[]
                            {
                                new { text = prompt },
                                new
                                {
                                    inline_data = new
                                    {
                                        mime_type = "image/jpeg",
                                        data = base64Data
                                    }
                                }
                            }
                        }
                    }
                };

                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync($"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}", content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorStr = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Gemini API Error: {Error}", errorStr);
                    return StatusCode(500, "Failed to communicate with AI Provider");
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                using var document = JsonDocument.Parse(jsonResponse);
                
                var generatedText = "AI analysis failed to generate text.";
                try
                {
                    generatedText = document.RootElement
                        .GetProperty("candidates")[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text").GetString();
                }
                catch { }

                return Ok(new
                {
                    success = true,
                    message = generatedText,
                    processedImageBase64 = request.ImageBase64 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing photo");
                return StatusCode(500, "Internal Server Error during AI processing");
            }
        }
    }

    public class PhotoProcessRequest
    {
        public string ImageBase64 { get; set; } = string.Empty;
        public string Theme { get; set; } = string.Empty;
    }
}
"@
Set-Content -Path "c:\Photo\backend\AIPhotoBooth.Api\Controllers\PhotosController.cs" -Value $controllerCode

Write-Host "Updating App.tsx to display AI message..."
$appTsxContent = Get-Content -Path "c:\Photo\booth-app\src\App.tsx" -Raw
$appTsxContent = $appTsxContent -replace "const \[imageSrc, setImageSrc\] = useState<string \| null>\(null\);", "const [imageSrc, setImageSrc] = useState<string | null>(null);`n  const [aiMessage, setAiMessage] = useState<string>('');"
$appTsxContent = $appTsxContent -replace "setAppState\('WELCOME'\);", "setAiMessage(''); setAppState('WELCOME');"
$appTsxContent = $appTsxContent -replace "const data = await response\.json\(\);\s*// In a real app, update imageSrc with data\.processedImageBase64", "const data = await response.json();`n          if (data.message) { setAiMessage(data.message); }`n          // In a real app, update imageSrc with data.processedImageBase64"

# Add the message display in the FINAL screen
$finalScreenHtml = @"
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
"@
$finalScreenHtmlWithMsg = @"
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {aiMessage && (
                <div style={{ padding: '20px', backgroundColor: 'rgba(112, 0, 255, 0.2)', border: '2px solid #7000FF', borderRadius: '15px', color: '#e4e4e7', fontSize: '1.2rem', maxWidth: '350px', lineHeight: '1.5', fontStyle: 'italic' }}>
                  ✨ {aiMessage}
                </div>
              )}
"@
$appTsxContent = $appTsxContent.Replace($finalScreenHtml, $finalScreenHtmlWithMsg)

Set-Content -Path "c:\Photo\booth-app\src\App.tsx" -Value $appTsxContent

Write-Host "Restarting Backend API..."
taskkill /IM AIPhotoBooth.Api.exe /F
taskkill /IM dotnet.exe /F
cd c:\Photo\backend\AIPhotoBooth.Api
Start-Process pwsh -ArgumentList "-Command `"dotnet run`""

Write-Host "Complete!"
