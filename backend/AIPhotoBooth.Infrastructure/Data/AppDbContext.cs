using AIPhotoBooth.Domain.Entities;
using AIPhotoBooth.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AIPhotoBooth.Infrastructure.Data
{
    public class AppDbContext : DbContext, IAppDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Company> Companies { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<Photo> Photos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // PostgreSQL specific configurations if needed
            // Can be abstracted for MySQL migration later

            modelBuilder.Entity<Company>().HasMany(c => c.Users).WithOne(u => u.Company).HasForeignKey(u => u.CompanyId);
            modelBuilder.Entity<Company>().HasMany(c => c.Events).WithOne(e => e.Company).HasForeignKey(e => e.CompanyId);
            modelBuilder.Entity<Event>().HasMany(e => e.Photos).WithOne(p => p.Event).HasForeignKey(p => p.EventId);
            modelBuilder.Entity<Role>().HasMany(r => r.Users).WithOne(u => u.Role).HasForeignKey(u => u.RoleId);
        }
    }
}
