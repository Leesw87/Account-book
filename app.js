let currentDate = new Date();
let selectedDate = new Date().toISOString().slice(0, 10);
let expenseDates = new Set();

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addBtn").addEventListener("click", add);
  document.getElementById("prevMonth").addEventListener("click", () => changeMonth(-1));
  document.getElementById("nextMonth").addEventListener("click", () => changeMonth(1));

  renderCalendar();
});

/* ===== Calendar ===== */
async function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  document.getElementById("monthTitle").innerText =
    `${year}년 ${month + 1}월`;

  await loadExpenseDatesForMonth(year, month);

  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const div = document.createElement("div");

    div.className = "day";
    div.innerText = d;

    if (expenseDates.has(dateStr)) {
      div.classList.add("has-expense");
    }

    div.onclick = () => selectDate(dateStr, div);

    calendar.appendChild(div);
  }
}


function changeMonth(diff) {
  currentDate.setMonth(currentDate.getMonth() + diff);
  renderCalendar();
}

/* ===== Select Date ===== */
function selectDate(dateStr, el) {
  selectedDate = dateStr;

  document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
  el.classList.add("selected");

  document.getElementById("selectedDate").innerText = `📅 ${dateStr}`;
  document.getElementById("expenseSection").style.display = "block";

  loadExpenses(dateStr);
}

/* ===== Supabase ===== */
async function loadExpenses(date) {
  const { data } = await supabaseClient
    .from("expenses")
    .select("*")
    .eq("date", date);

  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(e => {
    const li = document.createElement("li");
    li.innerText = `${e.type} · ${e.amount.toLocaleString()}원`;
    list.appendChild(li);
  });
}

async function add() {
  if (!selectedDate) return alert("날짜 선택");

  const amountInput = document.getElementById("amount");
  const amount = amountInput.value;

  if (!amount) return;
  
  const type = document.getElementById("type").value;
  const memo = document.getElementById("memo").value;

  if (!type)
  {
    alert("지출종류를 선택하세요.");
    return;
  }

  await supabaseClient.from("expenses").insert({
  date: selectedDate,
  amount: Number(amount),
  type,
  memo
});

amountInput.value = "";

await renderCalendar();
loadExpenses(selectedDate);
}

async function loadExpenseDatesForMonth(year, month) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // ✅ 해당 월 마지막 날

  const start = startDate.toISOString().slice(0, 10);
  const end = endDate.toISOString().slice(0, 10);

  const { data, error } = await supabaseClient
    .from("expenses")
    .select("date")
    .gte("date", start)
    .lte("date", end);

  if (error) {
    console.error(error);
    return;
  }

  expenseDates = new Set(
    data.map(d => d.date.slice(0, 10)) // timestamp 대응
  );
}


window.add = add;
