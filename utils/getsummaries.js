import { supabase } from "../lib/supabaseClient";

export async function getSummaries(workgroup_id) {
  let summaryData = {};
  let summary = {}
  async function getMeetingSummaries() {
    try {
      const { data, error, status } = await supabase
        .from('meetingsummaries')
        .select('template, date, summary, user_id, meeting_id, confirmed')
        .eq('workgroup_id', workgroup_id)
        .order('date', { ascending: false })  
        .order('created_at', { ascending: false }) 
        .limit(1);  
      
      if (error && status !== 406) throw error;
      if (data && data.length > 0) {
        summaryData = data[0];
        summary = summaryData.summary

        // Now we fetch the user name using the user_id from the summary
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('full_name')
          .eq('user_id', summaryData.user_id)
          .single(); // Assuming that user_id corresponds to a unique user

        if (userError) throw userError;
        if (userData) {
          // Insert the username into the summaryData object
          summaryData.username = userData.full_name;
          summary.username = summaryData.username;
          summary.meeting_id = summaryData.meeting_id;
          summary.confirmed = summaryData.confirmed;
        }
      }
    } catch (error) {
      console.error('error', error.message);
      // Reset summaryData if there is an error
      summaryData = {};
    }
  }
  
  await getMeetingSummaries();

  // If you want to return only the summary information and the username
  return summary;
}
