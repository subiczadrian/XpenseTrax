namespace XpenseTrax.API.Models;

public class User
{
    public string Username { get; set; }
    public string PasswordHash { get; set; }
    public record LoginRequest(string Username, string Password);
    public record LogoutRequest(string Username);

}

