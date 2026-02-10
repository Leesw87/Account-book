document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  addBtn.addEventListener("click", add);
});


const dateEl = document.getElementById("date");
const amountEl = document.getElementById("amount");
const typeEl = document.getElementById("type");
const memoEl = document.getElementById("memo");

let data = [];

async function load() {
  const { data: rows, error } = await supabaseClient
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  if (!error) {
    data = rows;
    render();
  }
}

/*async function add() {
  const date = dateEl.value;
  const amount = amountEl.value;
  const type = typeEl.value;
  const memo = memoEl.value;

  if (!date || !amount) return alert("날짜와 금액 필수");

  await supabaseClient.from("expenses").insert([
    { date, amount, type, memo }
  ]);

  load();
}*/

async function add() {
  if (!selectedDate) return alert("날짜를 선택하세요");

  const amount = document.getElementById("amount").value;
  const type = document.getElementById("type").value;
  const memo = document.getElementById("memo").value;

  await supabaseClient.from("expenses").insert({
    date: selectedDate,
    amount,
    type,
    memo
  });

  loadExpenses(selectedDate);
}


async function remove(id) {
  if (!confirm("삭제할까요?")) return;
  await supabaseClient.from("expenses").delete().eq("id", id);
  load();
}

function render() {
  const list = document.getElementById("list");
  const stats = document.getElementById("stats");
  list.innerHTML = "";

  let total = 0;
  let monthly = {};

  data.forEach(e => {
    total += e.amount;
    const month = e.date.slice(0, 7);
    monthly[month] = (monthly[month] || 0) + e.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      <div class="info">
        ${e.date} | ${e.type} | ${e.amount.toLocaleString()}원<br>
        ${e.memo || ""}
      </div>
      <button class="delete" onclick="remove('${e.id}')">삭제</button>
    `;
    list.appendChild(li);
  });

  const avg = Object.keys(monthly).length
    ? Math.round(total / Object.keys(monthly).length)
    : 0;

  stats.innerHTML = `
    총 지출: ${total.toLocaleString()}원<br>
    월 평균 지출: ${avg.toLocaleString()}원
  `;
}

load();

let selectedDate = null;

function renderCalendar(year, month) {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  // 빈칸
  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const div = document.createElement("div");
    div.className = "day";
    div.innerText = d;

    div.onclick = () => selectDate(dateStr, div);

    calendar.appendChild(div);
  }
}

function selectDate(dateStr, element) {
  selectedDate = dateStr;

  document.querySelectorAll(".day").forEach(d =>
    d.classList.remove("selected")
  );
  element.classList.add("selected");

  document.getElementById("selectedDate").innerText =
    `📅 ${dateStr}`;

  document.getElementById("expenseSection").style.display = "block";

  loadExpenses(dateStr);
}

async function loadExpenses(date) {
  const { data, error } = await supabaseClient
    .from("expenses")
    .select("*")
    .eq("date", date)
    .order("created_at", { ascending: false });

  if (error) return console.error(error);

  renderList(data);
}

