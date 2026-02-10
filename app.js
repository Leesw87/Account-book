let selectedDate = null;

/* ===== 초기 로드 ===== */
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  addBtn.addEventListener("click", add);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayStr = today.toISOString().slice(0, 10);

  renderCalendar(year, month);

  // 오늘 날짜 자동 선택
  setTimeout(() => {
    const todayEl = document.querySelector(`[data-date="${todayStr}"]`);
    if (todayEl) todayEl.click();
  }, 0);
});

/* ===== 달력 ===== */
function renderCalendar(year, month) {
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
    div.dataset.date = dateStr;
    div.onclick = () => selectDate(dateStr, div);

    calendar.appendChild(div);
  }
}

/* ===== 날짜 선택 ===== */
function selectDate(dateStr, element) {
  selectedDate = dateStr;

  document.querySelectorAll(".day").forEach(d =>
    d.classList.remove("selected")
  );
  element.classList.add("selected");

  document.getElementById("selectedDate").innerText = `📅 ${dateStr}`;
  document.getElementById("expenseSection").style.display = "block";

  loadExpenses(dateStr);
}

/* ===== Supabase ===== */
async function loadExpenses(date) {
  const { data, error } = await supabaseClient
    .from("expenses")
    .select("*")
    .eq("date", date)
    .order("created_at", { ascending: false });

  if (error) return console.error(error);
  renderList(data);
}

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
  loadExpenses(selectedDate);
}

/* ===== 리스트 렌더 ===== */
function renderList(rows) {
  const list = document.getElementById("list");
  list.innerHTML = "";

  rows.forEach(e => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        ${e.type} · ${e.amount.toLocaleString()}원<br>
        ${e.memo || ""}
      </div>
      <button class="delete" onclick="remove('${e.id}')">삭제</button>
    `;
    list.appendChild(li);
  });
}
