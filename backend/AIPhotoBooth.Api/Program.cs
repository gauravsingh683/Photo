using AIPhotoBooth.Domain.Entities;
using AIPhotoBooth.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using System;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("PhotoBoothDb"));

var applicationAssembly = Assembly.Load("AIPhotoBooth.Application");
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(applicationAssembly));

builder.Services.AddScoped<AIPhotoBooth.Application.Common.Interfaces.IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

var app = builder.Build();

// Auto-migrate and seed Database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated(); // Creates DB if it doesn't exist

    if (!db.Roles.Any())
    {
        var adminRole = new Role { Id = Guid.NewGuid(), Name = "SuperAdmin", Description = "System Administrator" };
        db.Roles.Add(adminRole);
        
        var adminUser = new User 
        { 
            Id = Guid.NewGuid(), 
            Email = "admin@aiphotobooth.com", 
            FirstName = "Super", 
            LastName = "Admin", 
            PasswordHash = "admin123", // In production, this would be hashed
            Role = adminRole 
        };
        db.Users.Add(adminUser);
        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.Run();
