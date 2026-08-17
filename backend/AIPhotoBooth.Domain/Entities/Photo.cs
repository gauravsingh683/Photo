using System;

namespace AIPhotoBooth.Domain.Entities
{
    public class Photo : BaseEntity
    {
        public string OriginalUrl { get; set; } = string.Empty;
        public string ProcessedUrl { get; set; } = string.Empty;
        public string QrCodeUrl { get; set; } = string.Empty;
        
        public Guid EventId { get; set; }
        public Event Event { get; set; } = null!;
        
        public Guid? GuestId { get; set; }
    }
}
