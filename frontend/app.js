const isDev = window.location.hostname === "127.0.0.1";

const apiUrl = isDev ? "http://127.0.0.1:5000/api" : "/api";

let expenses = [];
let salary = 0;

window.onload = initApp;

async function initApp() {
  let retries = 5;
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  while (retries > 0) {
    try {
      console.log(`Trying to connect to backend... (${6 - retries}/5)`);
      await fetchAndRenderSalary();
      await fetchAndRenderExpenses();
      console.log("Connected to backend successfully.");
      return;
    } catch (error) {
      console.warn("Backend not ready, retrying in 2s...");
      retries--;
      await delay(2000);
    }
  }

  alert(
    "Unable to connect to the backend after multiple attempts. Please refresh the page later."
  );
}

async function fetchSalary() {
  const response = await fetch(`${apiUrl}/salary`);
  if (response.ok) {
    const data = await response.json();
    salary = data.amount;
    renderSalary();
    updateRemainingBalance();
  }
}

// Fizetés beállítása
async function setSalary() {
  const salaryInputElement = document.getElementById("salaryAmount");
  const salaryInput = salaryInputElement.value;
  salary = parseFloat(salaryInput);

  if (!salary) {
    alert("Please enter a valid salary.");
    return;
  }

  await fetch(`${apiUrl}/salary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: salary }),
  });

  salaryInputElement.value = "";

  renderSalary();
  updateRemainingBalance();
}

async function fetchExpenses() {
  const response = await fetch(`${apiUrl}/expenses`);
  if (response.ok) {
    expenses = await response.json();
    renderExpenses();
    updateRemainingBalance();
  }
}

async function addExpense() {
  const amount = parseFloat(document.getElementById("expenseAmount").value);
  const description = document.getElementById("expenseDescription").value;
  const isPaid = document.getElementById("expenseIsPaid").checked;

  if (!amount || !description) {
    alert("Please provide both amount and description.");
    return;
  }

  await fetch(`${apiUrl}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, description, isPaid }),
  });

  await fetchExpenses();

  document.getElementById("expenseAmount").value = "";
  document.getElementById("expenseDescription").value = "";
  document.getElementById("expenseIsPaid").checked = false;
}

function editExpense(index) {
  const expenseContainer = document.getElementById(`expense-${index}`);
  const editContainer = document.getElementById(`edit-expense-${index}`);

  expenseContainer.style.display = "none";
  editContainer.style.display = "table-row";
}

async function saveExpense(index) {
  const expense = expenses[index];

  const amount = parseFloat(
    document.getElementById(`edit-amount-${index}`).value
  );
  const description = document.getElementById(
    `edit-description-${index}`
  ).value;
  const isPaid = document.getElementById(`edit-isPaid-${index}`).checked;

  await fetch(`${apiUrl}/expenses/${expense.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: expense.id, amount, description, isPaid }),
  });

  await fetchExpenses();
}

function cancelEdit(index) {
  renderExpenses();
}

async function deleteExpense(index) {
  const expense = expenses[index];

  if (!confirm("Are you sure you want to delete this expense?")) return;

  await fetch(`${apiUrl}/expenses/${expense.id}`, {
    method: "DELETE",
  });

  await fetchExpenses();
}

function renderSalary() {
  const salaryDisplay = document.getElementById("salaryDisplay");
  salaryDisplay.innerHTML = `Salary: ${salary.toLocaleString("hu-HU")} Ft`;
}

function updateRemainingBalance() {
  const remainingDisplay = document.getElementById("remainingBalance");
  const totalPaidExpenses = expenses
    .filter((expense) => expense.isPaid) // csak a kifizetett tételeket vesszük figyelembe
    .reduce((sum, expense) => sum + expense.amount, 0);

  const remaining = salary - totalPaidExpenses;
  remainingDisplay.innerHTML = `Remaining Balance: ${remaining.toLocaleString(
    "hu-HU"
  )} Ft`;
}

function renderExpenses() {
  const expensesContainer = document.getElementById("expensesContainer");

  let table = expensesContainer.querySelector("table");

  if (!table) {
    table = document.createElement("table");
    table.classList.add("table", "table-striped", "table-hover");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const headers = ["Amount", "Description", "Status", "Actions"];
    headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      th.classList.add("text-center");
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    tbody.classList.add("text-center");
    table.appendChild(tbody);

    expensesContainer.appendChild(table);
  }

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  expenses.forEach((expense, index) => {
    const row = document.createElement("tr");
    row.id = `expense-${index}`;

    const amountCell = document.createElement("td");
    amountCell.textContent = `${Number(expense.amount).toLocaleString(
      "hu-HU"
    )} Ft`;

    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = expense.description;

    const statusCell = document.createElement("td");
    statusCell.textContent = expense.isPaid ? "Paid" : "Unpaid";

    const actionsCell = document.createElement("td");
    actionsCell.classList.add(
      "d-grid",
      "gap-4",
      "d-md-flex",
      "justify-content-center"
    );

    const editButton = document.createElement("button");
    editButton.classList.add("btn", "btn-dark", "px-3");
    editButton.textContent = "Modify";
    editButton.onclick = () => editExpense(index);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn", "btn-danger", "px-3");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteExpense(index);

    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);

    row.appendChild(amountCell);
    row.appendChild(descriptionCell);
    row.appendChild(statusCell);
    row.appendChild(actionsCell);

    tbody.appendChild(row);

    const editRow = document.createElement("tr");
    editRow.id = `edit-expense-${index}`;
    editRow.style.display = "none";

    const editAmountCell = document.createElement("td");
    const editAmountInput = document.createElement("input");
    editAmountInput.type = "number";
    editAmountInput.id = `edit-amount-${index}`;
    editAmountInput.value = expense.amount;
    editAmountInput.classList.add("form-control");
    editAmountCell.appendChild(editAmountInput);

    const editDescriptionCell = document.createElement("td");
    const editDescriptionInput = document.createElement("input");
    editDescriptionInput.type = "text";
    editDescriptionInput.id = `edit-description-${index}`;
    editDescriptionInput.value = expense.description;
    editDescriptionInput.classList.add("form-control");
    editDescriptionCell.appendChild(editDescriptionInput);

    const editStatusCell = document.createElement("td");
    const editStatusCheckbox = document.createElement("input");
    const editStatusLabel = document.createElement("label");
    editStatusCheckbox.type = "checkbox";
    editStatusCheckbox.id = `edit-isPaid-${index}`;
    editStatusLabel.htmlFor = editStatusCheckbox.id;
    editStatusLabel.textContent = "Paid";
    editStatusLabel.classList.add("mx-2");
    editStatusCheckbox.checked = expense.isPaid;
    editStatusCheckbox.classList.add("form-check-input");
    editStatusCell.appendChild(editStatusCheckbox);
    editStatusCell.appendChild(editStatusLabel);

    const editActionsCell = document.createElement("td");
    editActionsCell.classList.add(
      "d-grid",
      "gap-4",
      "d-md-flex",
      "justify-content-center"
    );

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.classList.add("btn", "btn-success", "px-3");
    saveButton.onclick = () => saveExpense(index);

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.classList.add("btn", "btn-dark", "px-3");
    cancelButton.onclick = () => cancelEdit(index);

    editActionsCell.appendChild(saveButton);
    editActionsCell.appendChild(cancelButton);

    editRow.appendChild(editAmountCell);
    editRow.appendChild(editDescriptionCell);
    editRow.appendChild(editStatusCell);
    editRow.appendChild(editActionsCell);

    tbody.appendChild(editRow);
  });
}
