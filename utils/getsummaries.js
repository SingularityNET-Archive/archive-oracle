import { supabase } from "../lib/supabaseClient";

export async function getSummaries(workgroup_id) {
  let summaries = []; // Initialize an array to hold the summaries

  async function getMeetingSummaries() {
    try {
      // Fetch the last 6 summaries from the database
      const { data: summaryData, error, status } = await supabase
        .from('meetingsummaries')
        .select('template, date, summary, user_id, meeting_id, confirmed')
        .eq('workgroup_id', workgroup_id)
        .order('date', { ascending: false })  
        .order('created_at', { ascending: false }) 
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
            // Add the summary and user details to the summaries array
            summaries.push({
              username: userData.full_name,
              meeting_id: data.meeting_id,
              confirmed: data.confirmed,
              date: data.date,
              ...data.summary
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
