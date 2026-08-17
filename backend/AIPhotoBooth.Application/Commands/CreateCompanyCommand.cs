using AIPhotoBooth.Application.DTOs;
using AIPhotoBooth.Domain.Entities;
using AIPhotoBooth.Application.Common.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace AIPhotoBooth.Application.Commands
{
    public class CreateCompanyCommand : IRequest<CompanyDto>
    {
        public string Name { get; set; } = string.Empty;
        public string Domain { get; set; } = string.Empty;
    }

    public class CreateCompanyCommandHandler : IRequestHandler<CreateCompanyCommand, CompanyDto>
    {
        private readonly IAppDbContext _context;
        public CreateCompanyCommandHandler(IAppDbContext context) { _context = context; }

        public async Task<CompanyDto> Handle(CreateCompanyCommand request, CancellationToken cancellationToken)
        {
            var company = new Company { Name = request.Name, Domain = request.Domain };
            _context.Companies.Add(company);
            await _context.SaveChangesAsync(cancellationToken);
            return new CompanyDto { Id = company.Id, Name = company.Name, Domain = company.Domain };
        }
    }
}
