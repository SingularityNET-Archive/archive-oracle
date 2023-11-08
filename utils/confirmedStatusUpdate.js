import { supabase } from "../lib/supabaseClient";

export async function confirmedStatusUpdate(formData) {
  let updates = {
    meeting_id: formData.meeting_id,
    confirmed: true
  }
  
  const { data, error } = await supabase
    .from('meetingsummaries')
    .upsert(updates);

  if (error) {
    console.error('Error upserting data:', error);
    return false;
  }

  return data;
}
