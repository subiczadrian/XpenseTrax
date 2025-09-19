using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

public class AuthTokenAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        var headers = context.HttpContext.Request.Headers;
        if (!headers.ContainsKey("X-Auth-Username") || !headers.ContainsKey("X-Auth-Token"))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var username = headers["X-Auth-Username"].ToString();
        var token = headers["X-Auth-Token"].ToString();

        if (!AuthController.ValidateToken(username, token))
        {
            context.Result = new UnauthorizedResult();
        }
    }
}
