// ../utils/saveCustomAgenda
import { supabase } from "../lib/supabaseClient";
import { tableNames } from "../config/config";
import { prepareFormDataForSave } from "./prepareFormDataForSave";

export async function saveCustomAgenda(agendaData) {
  // Clean the data before saving
  const cleanedData = prepareFormDataForSave(agendaData);

  const updates = {
    name: cleanedData.meetingInfo.name,
    template: cleanedData.type,
    date: new Date(cleanedData.meetingInfo.date).toISOString(),
    workgroup_id: cleanedData.workgroup_id,
    summary: cleanedData,
    updated_at: new Date(),
  };

  const { data, error } = await supabase
    .from(tableNames.meetingsummaries)
    .upsert(updates, { onConflict: ["name", "date", "workgroup_id", "user_id"] })
    .select("date, meeting_id, updated_at");

  if (error) {
    console.error("Error upserting data:", error);
    return false;
  }

  return data;
}
