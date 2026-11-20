const STORAGE_KEY = "budget_tracker_transactions_v1";

// 1. Učitavanje stanja iz localStorage-a (ili prazan niz ako nema ništa)
let transactions = loadTransactions();

// 2. Hvatanje elemenata iz DOM-a
const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");

const totalBalanceEl = document.getElementById("total-balance");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const transactionListEl = document.getElementById("transaction-list");
const filterTypeEl = document.getElementById("filter-type");
const categoryBreakdownEl = document.getElementById("category-breakdown");

// Pomoćna funkcija za formatiranje eura
function formatEur(value) {
  return `${value.toFixed(2)} €`;
}

// Čuvanje niza u localStorage
function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// Učitavanje niza iz localStorage-a
function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Greška pri čitanju localStorage-a:", err);
    return [];
  }
}

// 3. Dodavanje nove transakcije
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value; // "income" ili "expense"
  const category = categoryInput.value;

  if (!description || isNaN(amount) || amount <= 0) {
    return;
  }

  const newTransaction = {
    id: Date.now(),
    description,
    amount,
    type,
    category,
  };

  transactions.unshift(newTransaction);
  saveTransactions();

  form.reset();
  descriptionInput.focus();

  renderApp();
});

// 4. Brisanje transakcije po ID-u
function deleteTransaction(id) {
  transactions = transactions.filter((item) => item.id !== id);
  saveTransactions();
  renderApp();
}

// 5. Ažuriranje kartica (stanje, prihodi, rashodi)
function renderSummary() {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  totalBalanceEl.textContent = formatEur(balance);
  totalIncomeEl.textContent = `+${formatEur(income)}`;
  totalExpenseEl.textContent = `-${formatEur(expense)}`;
}

// 6. Ispis raspodjele rashoda po kategorijama
function renderCategoryBreakdown() {
  const expenses = transactions.filter((t) => t.type === "expense");
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  categoryBreakdownEl.innerHTML = "";

  if (expenses.length === 0 || totalExpense === 0) {
    categoryBreakdownEl.innerHTML = `<p class="empty-msg">Nema unesenih rashoda za prikaz.</p>`;
    return;
  }

  // Sabiramo rashode po kategorijama u objekat { "Hrana": 45, "Auto i gorivo": 60, ... }
  const totalsByCategory = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  // Sortiramo kategorije od najvećeg troška prema najmanjem
  const sortedCategories = Object.entries(totalsByCategory).sort(
    (a, b) => b[1] - a[1]
  );

  sortedCategories.forEach(([category, sum]) => {
    const percentage = ((sum / totalExpense) * 100).toFixed(0);

    const itemDiv = document.createElement("div");
    itemDiv.className = "breakdown-item";
    itemDiv.innerHTML = `
      <div class="breakdown-item-header">
        <span>${category} (${percentage}%)</span>
        <strong>${formatEur(sum)}</strong>
      </div>
      <div class="progress-bg">
        <div class="progress-fill" style="width: ${percentage}%;"></div>
      </div>
    `;

    categoryBreakdownEl.appendChild(itemDiv);
  });
}

// 7. Ispis liste transakcija (sa filterom)
function renderTransactions() {
  const selectedFilter = filterTypeEl.value;

  const filtered = transactions.filter((t) => {
    if (selectedFilter === "all") return true;
    return t.type === selectedFilter;
  });

  transactionListEl.innerHTML = "";

  if (filtered.length === 0) {
    transactionListEl.innerHTML = `<p class="empty-msg">Nema transakcija za odabrani filter.</p>`;
    return;
  }

  filtered.forEach((t) => {
    const li = document.createElement("li");
    li.className = "transaction-item";

    const sign = t.type === "income" ? "+" : "-";
    const amountClass = t.type === "income" ? "amount-plus" : "amount-minus";

    li.innerHTML = `
      <div class="item-info">
        <span class="item-title">${t.description}</span>
        <span class="item-meta">${t.category}</span>
      </div>
      <div class="item-actions">
        <span class="${amountClass}">${sign}${formatEur(t.amount)}</span>
        <button class="btn-delete" onclick="deleteTransaction(${t.id})" title="Obriši">✕</button>
      </div>
    `;

    transactionListEl.appendChild(li);
  });
}

filterTypeEl.addEventListener("change", renderTransactions);

// Glavna render funkcija
function renderApp() {
  renderSummary();
  renderCategoryBreakdown();
  renderTransactions();
}

renderApp();