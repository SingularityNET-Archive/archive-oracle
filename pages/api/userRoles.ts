import { supabase } from "../../lib/supabaseClient";

interface User {
  discord_roles: any; 
  app_role: any;       
}

export default async function handler(req: any, res: any) {
  const { userId } = req.query;

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("discord_roles, app_role")
    .eq("user_id", userId);

  if (userError) {
    return res.status(500).json({ error: userError.message });
  }

  // Extract values from userData array
  let discordRoles = null;
  let appRole = null;
  let isAdmin = false;
  if (userData && Array.isArray(userData) && userData.length > 0) {
    discordRoles = (userData[0] as User).discord_roles;
    appRole = (userData[0] as User).app_role;
    isAdmin = appRole == "admin"? true : false;
  }

  return res.status(200).json({ isAdmin, discordRoles, appRole });
}
