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

async function add() {
  const date = dateEl.value;
  const amount = amountEl.value;
  const type = typeEl.value;
  const memo = memoEl.value;

  if (!date || !amount) return alert("날짜와 금액 필수");

  await supabaseClient.from("expenses").insert([
    { date, amount, type, memo }
  ]);

  load();
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
