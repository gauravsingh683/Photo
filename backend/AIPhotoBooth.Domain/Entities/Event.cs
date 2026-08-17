using System;
using System.Collections.Generic;

namespace AIPhotoBooth.Domain.Entities
{
    public class Event : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Venue { get; set; } = string.Empty;
        
        public Guid CompanyId { get; set; }
        public Company Company { get; set; } = null!;
        
        public ICollection<Photo> Photos { get; set; } = new List<Photo>();
    }
}
