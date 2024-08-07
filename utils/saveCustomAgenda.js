import { supabase } from "../lib/supabaseClient";
import { tableNames } from '../config/config';

export async function saveCustomAgenda(agendaData) {
  let updates = {
    name: agendaData.meetingInfo.name,
    template: agendaData.type,
    date: new Date(agendaData.meetingInfo.date).toISOString(),
    workgroup_id: agendaData.workgroup_id,
    summary: agendaData,
    updated_at: new Date
  }
  
  const { data, error } = await supabase
    .from(tableNames.meetingsummaries)
    .upsert(updates, { onConflict: ['name', 'date', 'workgroup_id', 'user_id'] })
    .select('date, meeting_id, updated_at');

  if (error) {
    console.error('Error upserting data:', error);
    return false;
  }

  return data;
}
