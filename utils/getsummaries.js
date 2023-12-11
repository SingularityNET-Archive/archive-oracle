import { supabase } from "../lib/supabaseClient";

export async function getSummaries(workgroup_id) {
  let summaries = []; // Initialize an array to hold the summaries
  let summary = {};
  let lastConfirmedDate = null;
  let lastUpdatedAt = null;
  let lastConfirmedMeeting = null;

  async function getMeetingSummaries() {
    try {
      // Fetch all summaries from the database
      const { data: summaryData, error, status } = await supabase
        .from('meetingsummaries')
        .select('template, date, summary, user_id, meeting_id, confirmed, updated_at')
        .eq('workgroup_id', workgroup_id)
        .order('date', { ascending: false })  
        .order('updated_at', { ascending: false });

      if (error && status !== 406) throw error;

      if (summaryData) {
        // Find the last confirmed meeting
        lastConfirmedMeeting = summaryData.find(data => data.confirmed === true);
        if (lastConfirmedMeeting) {
          lastConfirmedDate = lastConfirmedMeeting.date;
          lastUpdatedAt = lastConfirmedMeeting.updated_at;
        }

        // Fetch the user details for each summary
        for (const data of summaryData) {
          // Exclude meetings where confirmed == true and all meetings with an earlier date and updated_at date than the last meeting where confirmed == true
          if (data.confirmed === true || new Date(data.date) < new Date(lastConfirmedDate) || new Date(data.updated_at) < new Date(lastUpdatedAt)) {
            continue;
          }

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

  if (summaries.length === 0 && lastConfirmedMeeting) {
    // Fetch the user details for the last confirmed meeting
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('full_name')
      .eq('user_id', lastConfirmedMeeting.user_id)
      .single();

    if (userError) throw userError;
    if (userData) {
      summary = lastConfirmedMeeting.summary
      // Add the summary and user details to the last confirmed meeting
      lastConfirmedMeeting = {
        username: userData.full_name,
        meeting_id: lastConfirmedMeeting.meeting_id,
        confirmed: lastConfirmedMeeting.confirmed,
        date: lastConfirmedMeeting.date,
        updated_at: lastConfirmedMeeting.updated_at,
        ...summary
      };
      summaries.push(lastConfirmedMeeting);
    }
  }

  return summaries; // Return the array of summaries
}