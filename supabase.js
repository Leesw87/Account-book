const SUPABASE_URL = "https://kbjtxatyeemwrcbdokwy.supabase.co";
const SUPABASE_KEY = "sb_publishable_bKhAbzuLGoHqXaoSmgEp0Q_6ed9VnUB";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
