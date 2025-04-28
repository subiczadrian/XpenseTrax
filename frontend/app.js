// ====== Config ======
const isDev = window.location.hostname === "127.0.0.1";
const apiUrl = isDev ? "http://127.0.0.1:5000/api" : "/api";

// ====== Global State ======
let expenses = [];
let salary = 0;

// ====== API Wrapper ======
const Api = {
  get: async (endpoint) => {
    const response = await fetch(`${apiUrl}${endpoint}`);
    if (!response.ok) throw new Error(`GET ${endpoint} failed`);
    return response.json();
  },
  post: async (endpoint, data) => {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`POST ${endpoint} failed`);
  },
  put: async (endpoint, data) => {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`PUT ${endpoint} failed`);
  },
  delete: async (endpoint) => {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(`DELETE ${endpoint} failed`);
  },
};

// ====== Utils ======
function clearExpenseForm() {
  document.getElementById("expenseAmount").value = "";
  document.getElementById("expenseDescription").value = "";
  document.getElementById("expenseIsPaid").checked = false;
}

function createButton({ text, classes, onClick }) {
  const button = document.createElement("button");
  button.textContent = text;
  button.className = classes;
  button.onclick = onClick;
  return button;
}

function createInput({ id, type = "text", value = "", classes = "" }) {
  const input = document.createElement("input");
  input.type = type;
  input.id = id;
  input.value = value;
  input.className = classes;
  return input;
}

// ====== Initialization ======
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
      return; // If success, exit the loop
    } catch (error) {
      console.warn("Backend not ready, retrying in 2s...");
      retries--;
      await delay(2000); // Wait 2 seconds before retrying
    }
  }

  alert(
    "Unable to connect to the backend after multiple attempts. Please refresh the page later."
  );
}

// ====== Fetch and Render Functions ======
async function fetchAndRenderSalary() {
  const data = await Api.get("/salary");
  salary = data.amount;
  renderSalary();
  updateRemainingBalance();
}

async function fetchAndRenderExpenses() {
  expenses = await Api.get("/expenses");
  renderExpenses();
  updateRemainingBalance();
}

// ====== Salary Functions ======
async function setSalary() {
  const salaryInputElement = document.getElementById("salaryAmount");
  const salaryInput = parseFloat(salaryInputElement.value);

  if (!salaryInput) {
    alert("Please enter a valid salary.");
    return;
  }

  try {
    await Api.post("/salary", { amount: salaryInput });
    salary = salaryInput;
    salaryInputElement.value = "";
    renderSalary();
    updateRemainingBalance();
  } catch (error) {
    console.error(error);
    alert("Failed to set salary.");
  }
}

function renderSalary() {
  document.getElementById(
    "salaryDisplay"
  ).innerHTML = `Salary: ${salary.toLocaleString("hu-HU")} Ft`;
}

// ====== Expense Functions ======
async function addExpense() {
  const amount = parseFloat(document.getElementById("expenseAmount").value);
  const description = document
    .getElementById("expenseDescription")
    .value.trim();
  const isPaid = document.getElementById("expenseIsPaid").checked;

  if (!amount || !description) {
    alert("Please provide both amount and description.");
    return;
  }

  try {
    await Api.post("/expenses", { amount, description, isPaid });
    await fetchAndRenderExpenses();
    clearExpenseForm();
  } catch (error) {
    console.error(error);
    alert("Failed to add expense.");
  }
}

async function saveExpense(index) {
  const expense = expenses[index];
  const amount = parseFloat(
    document.getElementById(`edit-amount-${index}`).value
  );
  const description = document
    .getElementById(`edit-description-${index}`)
    .value.trim();
  const isPaid = document.getElementById(`edit-isPaid-${index}`).checked;

  try {
    await Api.put(`/expenses/${expense.id}`, {
      id: expense.id,
      amount,
      description,
      isPaid,
    });
    await fetchAndRenderExpenses();
  } catch (error) {
    console.error(error);
    alert("Failed to save expense.");
  }
}

async function deleteExpense(index) {
  const expense = expenses[index];

  if (!confirm("Are you sure you want to delete this expense?")) return;

  try {
    await Api.delete(`/expenses/${expense.id}`);
    await fetchAndRenderExpenses();
  } catch (error) {
    console.error(error);
    alert("Failed to delete expense.");
  }
}

function editExpense(index) {
  document.getElementById(`expense-${index}`).style.display = "none";
  document.getElementById(`edit-expense-${index}`).style.display = "table-row";
}

function cancelEdit() {
  renderExpenses();
}

// ====== Render Expenses ======
function renderExpenses() {
  const expensesContainer = document.getElementById("expensesContainer");
  expensesContainer.innerHTML = ""; // Clear previous content

  const table = document.createElement("table");
  table.className = "table table-striped table-hover";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["Amount", "Description", "Status", "Actions"].forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    th.className = "text-center";
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  tbody.className = "text-center";

  expenses.forEach((expense, index) => {
    // Normal row
    const row = document.createElement("tr");
    row.id = `expense-${index}`;

    row.appendChild(createCell(`${expense.amount.toLocaleString("hu-HU")} Ft`));
    row.appendChild(createCell(expense.description));
    row.appendChild(createCell(expense.isPaid ? "Paid" : "Unpaid"));

    const actionsCell = document.createElement("td");
    actionsCell.className = "d-grid gap-4 d-md-flex justify-content-center";

    actionsCell.appendChild(
      createButton({
        text: "Modify",
        classes: "btn btn-dark px-3",
        onClick: () => editExpense(index),
      })
    );

    actionsCell.appendChild(
      createButton({
        text: "Delete",
        classes: "btn btn-danger px-3",
        onClick: () => deleteExpense(index),
      })
    );

    row.appendChild(actionsCell);
    tbody.appendChild(row);

    // Edit row
    const editRow = document.createElement("tr");
    editRow.id = `edit-expense-${index}`;
    editRow.style.display = "none";

    editRow.appendChild(
      createCell(
        null,
        createInput({
          id: `edit-amount-${index}`,
          type: "number",
          value: expense.amount,
          classes: "form-control",
        })
      )
    );

    editRow.appendChild(
      createCell(
        null,
        createInput({
          id: `edit-description-${index}`,
          type: "text",
          value: expense.description,
          classes: "form-control",
        })
      )
    );

    const statusCell = document.createElement("td");
    const statusCheckbox = createInput({
      id: `edit-isPaid-${index}`,
      type: "checkbox",
      value: "",
      classes: "form-check-input",
    });
    statusCheckbox.checked = expense.isPaid;

    const statusLabel = document.createElement("label");
    statusLabel.textContent = "Paid";
    statusLabel.setAttribute("for", `edit-isPaid-${index}`);
    statusLabel.className = "mx-2";

    statusCell.appendChild(statusCheckbox);
    statusCell.appendChild(statusLabel);
    editRow.appendChild(statusCell);

    const editActionsCell = document.createElement("td");
    editActionsCell.className = "d-grid gap-4 d-md-flex justify-content-center";
    editActionsCell.appendChild(
      createButton({
        text: "Save",
        classes: "btn btn-success px-3",
        onClick: () => saveExpense(index),
      })
    );
    editActionsCell.appendChild(
      createButton({
        text: "Cancel",
        classes: "btn btn-dark px-3",
        onClick: () => cancelEdit(index),
      })
    );
    editRow.appendChild(editActionsCell);

    tbody.appendChild(editRow);
  });

  table.appendChild(tbody);
  expensesContainer.appendChild(table);
}

function createCell(textContent, childElement = null) {
  const td = document.createElement("td");
  if (childElement) {
    td.appendChild(childElement);
  } else {
    td.textContent = textContent;
  }
  return td;
}

// ====== Balance Update ======
function updateRemainingBalance() {
  const totalPaidExpenses = expenses
    .filter((expense) => expense.isPaid)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const remaining = salary - totalPaidExpenses;
  document.getElementById(
    "remainingBalance"
  ).innerHTML = `Remaining Balance: ${remaining.toLocaleString("hu-HU")} Ft`;
}
