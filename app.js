// 1. Stanje aplikacije (niz transakcija)
let transactions = [];

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

// Pomoćna funkcija za formatiranje eura
function formatEur(value) {
  return `${value.toFixed(2)} €`;
}

// 3. Dodavanje nove transakcije
form.addEventListener("submit", function (event) {
  event.preventDefault(); // sprječava reload stranice

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value; // "income" ili "expense"
  const category = categoryInput.value;

  if (!description || isNaN(amount) || amount <= 0) {
    return;
  }

  const newTransaction = {
    id: Date.now(), // jedinstven ID (za vježbu super)
    description: description,
    amount: amount,
    type: type,
    category: category,
  };

  // Dodajemo novu stavku na početak niza
  transactions.unshift(newTransaction);

  // Resetujemo formu i vratimo fokus na opis
  form.reset();
  descriptionInput.focus();

  // Ponovo iscrtavamo sve na ekranu
  renderApp();
});

// 4. Brisanje transakcije po ID-u
function deleteTransaction(id) {
  transactions = transactions.filter((item) => item.id !== id);
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

// 6. Ispis liste transakcija (sa filterom)
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

// Reaguj na promjenu filtera ("Sve stavke", "Samo prihodi", "Samo rashodi")
filterTypeEl.addEventListener("change", renderTransactions);

// Glavna render funkcija — srce aplikacije
function renderApp() {
  renderSummary();
  renderTransactions();
}

// Prvi poziv pri učitavanju stranice
renderApp();