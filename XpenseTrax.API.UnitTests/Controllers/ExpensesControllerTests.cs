using System;
using System.Collections.Generic;
using System.Threading.Tasks;

#nullable enable
using Microsoft;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using XpenseTrax.API;
using XpenseTrax.API.Controllers;
using XpenseTrax.API.Data;
using XpenseTrax.API.Models;

namespace XpenseTrax.API.Controllers.UnitTests;

[TestClass]
public class ExpensesControllerTests
{
    /// <summary>
    /// Test purpose:
    /// Verifies that UpdateExpense returns BadRequest when the provided id does not match updatedExpense.Id.
    /// Input conditions:
    /// - Several integer id edge values are tested (int.MinValue, -1, 0, 1, int.MaxValue)
    /// - updatedExpense.Id is set to a different value for each case (avoiding overflow)
    /// Expected result:
    /// - The method returns BadRequestResult for every mismatched id case.
    /// </summary>
    [TestMethod]
    public async Task UpdateExpense_IdMismatch_ReturnsBadRequest()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        using var context = new AppDbContext(options);
        var controller = new ExpensesController(context);

        var idsToTest = new[] { int.MinValue, -1, 0, 1, int.MaxValue };

        // Act / Assert
        foreach (int id in idsToTest)
        {
            int updatedId;
            // Ensure updatedId != id and avoid overflow when adjusting extremes
            if (id == int.MaxValue) updatedId = id - 1;
            else if (id == int.MinValue) updatedId = 0;
            else updatedId = id + 1;

            var updatedExpense = new Expense
            {
                Id = updatedId,
                Amount = 1.0,
                Description = "mismatch",
                IsPaid = false
            };

            // Act
            IActionResult result = await controller.UpdateExpense(id, updatedExpense);

            // Assert
            Assert.IsInstanceOfType(result, typeof(BadRequestResult),
                $"Expected BadRequestResult when id ({id}) != updatedExpense.Id ({updatedId}).");
        }
    }

    /// <summary>
    /// Test purpose:
    /// Verifies that UpdateExpense returns NotFound when the target expense does not exist in the database.
    /// Input conditions:
    /// - Database contains no expense with the provided id (42).
    /// - updatedExpense.Id equals the id parameter to pass the id-mismatch check.
    /// Expected result:
    /// - The method returns NotFoundResult.
    /// </summary>
    [TestMethod]
    public async Task UpdateExpense_ExpenseNotFound_ReturnsNotFound()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .Options;
        using var context = new AppDbContext(options);
        var mockSet = new Mock<DbSet<Expense>>();
        mockSet.Setup(m => m.FindAsync(It.IsAny<object[]>()))
               .Returns(new ValueTask<Expense>((Expense)null));
        context.Expenses = mockSet.Object;

        var controller = new ExpensesController(context);

        var updatedExpense = new Expense
        {
            Id = 42,
            Amount = 100.0,
            Description = "will not be found",
            IsPaid = true
        };

        // Act
        IActionResult result = await controller.UpdateExpense(42, updatedExpense);

        // Assert
        Assert.IsInstanceOfType(result, typeof(NotFoundResult), "Expected NotFoundResult when the expense does not exist.");
    }

    /// <summary>
    /// The test verifies that the ExpensesController constructor creates a non-null instance when provided a valid AppDbContext.
    /// Input conditions: An in-memory AppDbContext constructed with non-null DbContextOptions.
    /// Expected result: No exception is thrown and the returned controller instance is not null and of correct type.
    /// </summary>
    [TestMethod]
    public void ExpensesController_Constructor_ValidContext_InstanceCreated()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        using var context = new AppDbContext(options);

        // Act
        var controller = new ExpensesController(context);

        // Assert
        Assert.IsNotNull(controller, "Constructor returned null for a valid AppDbContext.");
        Assert.IsInstanceOfType(controller, typeof(ExpensesController), "Returned instance is not of type ExpensesController.");
    }

    /// <summary>
    /// Verifies that the ExpensesController constructor does not throw and still creates an instance when provided a disposed AppDbContext.
    /// Input conditions: An AppDbContext that has been disposed before passing to constructor.
    /// Expected result: No exception is thrown and the controller instance is created (the ctor does not access DbContext operations).
    /// </summary>
    [TestMethod]
    public void ExpensesController_Constructor_DisposedContext_DoesNotThrowAndInstanceCreated()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var context = new AppDbContext(options);
        context.Dispose();

        // Act
        var controller = new ExpensesController(context);

        // Assert
        Assert.IsNotNull(controller, "Constructor returned null when provided a disposed AppDbContext.");
        Assert.IsInstanceOfType(controller, typeof(ExpensesController), "Returned instance is not of type ExpensesController when provided a disposed context.");
    }

}