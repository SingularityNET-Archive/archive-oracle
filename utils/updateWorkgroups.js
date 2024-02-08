import { supabase } from "../lib/supabaseClient";

export async function updateWorkgroups(workgroupData) {
  let preferred_template = {
    "workgroup": workgroupData.workgroup,
    "workgroup_id":"",
    "meetingInfo":
    {
      "name":1,
      "date":1,
      "host":1,
      "documenter":1,
      "peoplePresent":1,
      "purpose":1,
      "townHallNumber": 0,
      "googleSlides": 0,
      "meetingVideoLink":1,
      "miroBoardLink":0,
      "otherMediaLink":0,
      "transcriptLink":1,
      "mediaLink":0,
      "workingDocs": 1,
      "timestampedVideo": 0
    },
    "agendaItems":
    [
      {
        "agenda":0,
        "status":0,
        "narrative":0,
        "townHallUpdates": 0,
        "townHallSummary": 0,
        "meetingTopics":0,
        "issues":0,
        "actionItems":1,
        "decisionItems":1,
        "discussionPoints":1,
        "gameRules": 0,
        "learningPoints":0,
      }
    ],
      "tags":1,
      "type":"Custom"
      }
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
