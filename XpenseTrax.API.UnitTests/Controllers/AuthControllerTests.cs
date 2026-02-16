using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Security.Cryptography;
using System.Text;
using XpenseTrax.API;
using XpenseTrax.API.Controllers;
using XpenseTrax.API.Models;

namespace XpenseTrax.API.UnitTests
{
    /// <summary>
    /// Tests for AuthController.Login behavior: valid credentials, invalid username, invalid password,
    /// and token replacement on repeated logins.
    /// </summary>
    [TestClass]
    public class AuthControllerTests
    {
        /// <summary>
        /// Test purpose:
        /// Verifies that ValidateToken returns false when the username is not present in the active token dictionary.
        /// Input conditions:
        /// - A username that is very unlikely to exist in the controller's private active tokens dictionary.
        /// Expected result:
        /// - ValidateToken returns false and does not throw.
        /// Remarks:
        /// - We cannot directly manipulate the private static _activeTokens field from tests (no reflection per guidelines),
        ///   so this test asserts the observable behavior when no entry exists for the provided username.
        /// </summary>
        [TestMethod]
        public void ValidateToken_UsernameNotPresent_ReturnsFalse()
        {
            // Arrange
            // Use a username unlikely to be present; avoid null since method parameters are non-nullable in source.
            string username = Guid.NewGuid().ToString("N");
            string token = "some-token";
            // Act
            bool result = AuthController.ValidateToken(username, token);
            // Assert
            Assert.IsFalse(result, "ValidateToken should return false when username is not present in the active tokens dictionary.");
        }

    }
}