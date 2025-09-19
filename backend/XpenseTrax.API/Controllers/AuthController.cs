using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using XpenseTrax.API.Models;
using static XpenseTrax.API.Models.User;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // Két felhasználó, hash-elt jelszóval
    private static List<User> _users = new()
    {
        new User { Username = "adrian", PasswordHash = "f3e7e7312129014cfc89643bef8387e40686bd75" },
        new User { Username = "partner", PasswordHash = "3c6e0b8a9c15224a8228b9a98ca1531d6c3d4b8d" } // SHA1("jelszo2")
    };

    private static Dictionary<string, string> _activeTokens = new();

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest req)
    {
        var user = _users.FirstOrDefault(u => u.Username == req.Username);
        if (user == null)
            return Unauthorized("Hibás felhasználónév vagy jelszó");

        string hash = ComputeSha1Hash(req.Password);
        if (hash != user.PasswordHash)
            return Unauthorized("Hibás felhasználónév vagy jelszó");

        string token = Guid.NewGuid().ToString();
        _activeTokens[req.Username] = token;

        return Ok(new { Token = token });
    }

    [HttpPost("logout")]
    public IActionResult Logout([FromBody] LogoutRequest req)
    {
        _activeTokens.Remove(req.Username);
        return Ok();
    }

    public static bool ValidateToken(string username, string token)
    {
        return _activeTokens.TryGetValue(username, out var t) && t == token;
    }

    private string ComputeSha1Hash(string input)
    {
        using (SHA1 sha = SHA1.Create())
        {
            byte[] bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(input));
            return BitConverter.ToString(bytes).Replace("-", "").ToLower();
        }
    }
}
