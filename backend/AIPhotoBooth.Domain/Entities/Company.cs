using System;
using System.Collections.Generic;

namespace AIPhotoBooth.Domain.Entities
{
    public class Company : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Domain { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public Guid SubscriptionId { get; set; }
        
        // Navigation properties
        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<Event> Events { get; set; } = new List<Event>();
    }
}
