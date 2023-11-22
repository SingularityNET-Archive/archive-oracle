import { supabase } from "../lib/supabaseClient";

export async function getSummaries(workgroup_id) {
  let summaries = []; // Initialize an array to hold the summaries
  let summary = {};
  async function getMeetingSummaries() {
    try {
      // Fetch the last 6 summaries from the database
      const { data: summaryData, error, status } = await supabase
        .from('meetingsummaries')
        .select('template, date, summary, user_id, meeting_id, confirmed, updated_at')
        .eq('workgroup_id', workgroup_id)
        .order('date', { ascending: false })  
        .order('updated_at', { ascending: false }) 
        .limit(6);

      if (error && status !== 406) throw error;

      if (summaryData) {
        // Fetch the user details for each summary
        for (const data of summaryData) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('full_name')
            .eq('user_id', data.user_id)
            .single();

          if (userError) throw userError;
          if (userData) {
            summary = data.summary
            // Add the summary and user details to the summaries array

            summaries.push({
              username: userData.full_name,
              meeting_id: data.meeting_id,
              confirmed: data.confirmed,
              date: data.date,
              updated_at: data.updated_at,
              ...summary
            });
          }
        }
      }
    } catch (error) {
      console.error('error', error.message);
      // Consider how to handle errors, maybe you want to return an empty array or some error code
    }
  }

  await getMeetingSummaries();

  return summaries; // Return the array of summaries
}
