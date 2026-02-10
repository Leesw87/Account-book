async function load() {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  if (!error) {
    expenses = data;
    render();
  }
}

async function add() {
  const date = dateEl.value;
  const amount = amountEl.value;
  const type = typeEl.value;
  const memo = memoEl.value;

  await supabase.from("expenses").insert([
    { date, amount, type, memo }
  ]);

  load();
}

async function remove(id) {
  await supabase.from("expenses").delete().eq("id", id);
  load();
}
