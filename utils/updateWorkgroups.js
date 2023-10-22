import { supabase } from "../lib/supabaseClient";

export async function updateWorkgroups(workgroupData) {
  let preferred_template = {"workgroup": workgroupData.workgroup,"workgroup_id":"","meetingInfo":{"name":1,"date":1,"host":1,"documenter":1,"peoplePresent":1,"purpose":1,"meetingVideoLink":1,"miroBoardLink":1,"otherMediaLink":1,"transcriptLink":1,"mediaLink":0},"agendaItems":[{"agenda":1,"status":1,"actionItems":1,"decisionItems":1,"discussionPoints":1,"mode":0,"narrative":0,"issues":0}],"tags":1,"type":"Custom"}
  let updates = {...workgroupData, preferred_template}

  const { data, error } = await supabase
    .from('workgroups')
    .upsert(updates);

  if (error) {
    console.error('Error upserting data:', error);
    return false;
  }

  return data;
}
