let expenses = [];

async function load() {
  const { data } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  expenses = data || [];
  render();
}

async function add() {
  const date = dateEl.value;
  const amount = amountEl.value;
  const type = typeEl.value;
  const memo = memoEl.value;

  if (!date || !amount) return alert("날짜와 금액 필수");

  await supabase.from("expenses").insert([
    { date, amount, type, memo }
  ]);

  load();
}

async function remove(id) {
  if (!confirm("삭제할까요?")) return;

  await supabase.from("expenses").delete().eq("id", id);
  load();
}
