// api/userRoles.ts
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req: any, res: any) {
  const { userId } = req.query;

  // Query the 'admin' table to see if the user ID exists in the 'user_id' column
  const { data, error } = await supabase
    .from("admin")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // If data exists, the user is an admin
  const isAdmin = !!data;

  return res.status(200).json({ isAdmin });
}
