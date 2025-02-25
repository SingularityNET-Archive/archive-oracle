import { supabase } from "../lib/supabaseClient";
import { tableNames } from '../config/config';

export async function confirmedStatusUpdate(formData) {

  if (!formData.meeting_id) {
    console.error('Cannot update confirmed status: meeting_id is missing');
    return false;
  }
  
  let updates = {
    meeting_id: formData.meeting_id,
    confirmed: true
  }
  
  const { data, error } = await supabase
    .from(tableNames.meetingsummaries)
    .upsert(updates);

  if (error) {
    console.error('Error upserting data:', error);
    return false;
  }

  return data;
}
