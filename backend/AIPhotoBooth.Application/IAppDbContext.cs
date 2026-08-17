using AIPhotoBooth.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace AIPhotoBooth.Application.Common.Interfaces
{
    public interface IAppDbContext
    {
        DbSet<Company> Companies { get; }
        DbSet<User> Users { get; }
        DbSet<Role> Roles { get; }
        DbSet<Event> Events { get; }
        DbSet<Photo> Photos { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
