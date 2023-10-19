import { supabase } from "../../lib/supabaseClient";

// Define TypeScript interface for User and Admin data
interface User {
  discord_roles: any; // Replace `any` with the actual type if known
  app_role: any;       // Replace `any` with the actual type if known
}

export default async function handler(req: any, res: any) {
  const { userId } = req.query;

  // Query the 'admin' table to see if the user ID exists in the 'user_id' column
  const { data: adminData, error: adminError } = await supabase
    .from("admin")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (adminError) {
    return res.status(500).json({ error: adminError.message });
  }

  // Query the 'users' table to fetch 'discord_roles' and 'app_role'
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("discord_roles, app_role")
    .eq("user_id", userId);

  if (userError) {
    return res.status(500).json({ error: userError.message });
  }

  // If adminData exists, the user is an admin
  const isAdmin = !!adminData;

  // Extract values from userData array
  let discordRoles = null;
  let appRole = null;
  if (userData && Array.isArray(userData) && userData.length > 0) {
    discordRoles = (userData[0] as User).discord_roles;
    appRole = (userData[0] as User).app_role;
  }

  return res.status(200).json({ isAdmin, discordRoles, appRole });
}
