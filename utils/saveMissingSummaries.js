import { supabase } from "../lib/supabaseClient";

export async function saveMissingSummary(summaryData) {
  let updates = {
    workgroup_id: summaryData.workgroupId,
    workgroup: summaryData.workgroup,
    meeting_date: summaryData.meetingDate,
    status: summaryData.status,
    type: summaryData.type
  }
  
  const { data, error } = await supabase
    .from('missingsummaries')
    .upsert(updates, { onConflict: ['workgroup_id', 'meeting_date', 'type'] })
    .select('meeting_date, workgroup, updated_at');

  if (error) {
    console.error('Error upserting data:', error);
    return false;
  }

  return data;
}
