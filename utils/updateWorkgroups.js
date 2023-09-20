import { supabase } from "../lib/supabaseClient";

export async function updateWorkgroups(workgroupData) {

  const { data, error } = await supabase
    .from('workgroups')
    .upsert(workgroupData);

  if (error) {
    console.error('Error upserting data:', error);
    return false;
  }

  return data;
}
