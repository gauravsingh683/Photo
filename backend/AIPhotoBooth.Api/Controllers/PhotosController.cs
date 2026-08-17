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
                _logger.LogInformation("Generating Background Image for theme {Theme} using Gemini Image API", request.Theme);

                if (string.IsNullOrEmpty(apiKey) || apiKey.Contains("PASTE_YOUR_OPENAI_OR_CODEX"))
                {
                    return StatusCode(500, "API Key is missing or invalid in appsettings.json");
                }

                // Create a prompt based on the Theme. If theme is Modi Ji, generate a specific image.
                var prompt = $"A highly detailed, photorealistic background image for a photo booth. Theme: {request.Theme}. No people in the image, just a beautiful immersive background setting.";
                
                if (request.Theme.Contains("Modi", StringComparison.OrdinalIgnoreCase)) {
                    prompt = "Narendra Modi, the Prime Minister of India, standing in a beautiful garden, wearing traditional Indian clothing, highly detailed, photorealistic, cinematic lighting.";
                }

                var payload = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new object[]
                            {
                                new { text = prompt }
                            }
                        }
                    },
                    generationConfig = new
                    {
                        responseModalities = new[] { "IMAGE" }
                    }
                };

                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync($"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key={apiKey}", content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorStr = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Gemini Image API Error: {Error}", errorStr);
                    return StatusCode(500, "Failed to communicate with AI Image Provider");
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                using var document = JsonDocument.Parse(jsonResponse);
                
                string generatedImageBase64 = "";
                try
                {
                    // For image modalities, Gemini returns the image in inlineData
                    var candidate = document.RootElement.GetProperty("candidates")[0];
                    var part = candidate.GetProperty("content").GetProperty("parts")[0];
                    if (part.TryGetProperty("inlineData", out var inlineData)) 
                    {
                        generatedImageBase64 = inlineData.GetProperty("data").GetString() ?? "";
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to parse image from response");
                }

                if (string.IsNullOrEmpty(generatedImageBase64)) 
                {
                     return StatusCode(500, "AI failed to return an image payload.");
                }

                return Ok(new
                {
                    success = true,
                    processedImageBase64 = $"data:image/jpeg;base64,{generatedImageBase64}"
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
