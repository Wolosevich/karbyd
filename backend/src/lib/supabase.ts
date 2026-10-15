import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SECRET_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL или SUPABASE_SECRET_KEY не заданы в .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
