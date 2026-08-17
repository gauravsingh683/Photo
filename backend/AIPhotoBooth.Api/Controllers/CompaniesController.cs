using AIPhotoBooth.Application.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace AIPhotoBooth.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompaniesController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CompaniesController(IMediator mediator) { _mediator = mediator; }

        [HttpPost]
        public async Task<IActionResult> CreateCompany([FromBody] CreateCompanyCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
