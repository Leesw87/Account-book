let currentDate = new Date();
let selectedDate = null;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addBtn").addEventListener("click", add);
  document.getElementById("prevMonth").addEventListener("click", () => changeMonth(-1));
  document.getElementById("nextMonth").addEventListener("click", () => changeMonth(1));

  renderCalendar();
});

/* ===== Calendar ===== */
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  document.getElementById("monthTitle").innerText =
    `${year}년 ${month + 1}월`;

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

  const amount = amount.value;
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
