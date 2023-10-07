import { supabase } from "../lib/supabaseClient";

export async function saveAgenda(agendaData) {
  let updates = {
    name: agendaData.name,
    template: agendaData.type,
    date: new Date(agendaData.date).toISOString(),
    workgroup_id: agendaData.workgroup_id,
    summary: agendaData
  }
  
  const { data, error } = await supabase
    .from('meetingsummaries')
    .upsert(updates, { onConflict: ['name', 'date', 'workgroup_id'] });

  if (error) {
    console.error('Error upserting data:', error);
    return false;
  }

  return data;
}
