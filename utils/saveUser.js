import { supabase } from "../lib/supabaseClient";

export async function saveUser(user_metadata, discord_roles) {
  let updates = {
    name: user_metadata.name,
    avatar_url: user_metadata.avatar_url,
    full_name: user_metadata.full_name,
    global_name: user_metadata.custom_claims.global_name
    //discord_roles
  }
  
  const { data, error } = await supabase
    .from('users')
    .upsert(updates);

  if (error) {
    console.error('Error upserting data:', error);
    return false;
  }

  return data;
}
