import { supabase } from "../lib/supabaseClient";

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    // Manually construct the date string to ensure it's in "DD MMMM YYYY" format
    const formattedDate = `${date.getDate()} ${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;
    return formattedDate;
}

export async function getMissingSummaries() {
    let missingSummaries = [];
    let allDoneSummaries = [];
  
    async function getAllMissingSummaries() {
      try {
        const { data, error, status } = await supabase
          .from('missingsummaries')
          .select('workgroup, meeting_date, status');
        
        if (error && status !== 406) throw error;
        if (data) {
          missingSummaries = data.map(item => ({
            ...item,
            meetingDate: item.meeting_date,
            status: item.status,
            workgroup: item.workgroup
          }));
        }
      } catch (error) {
        console.log("error", error.message);
      }
    }
  
    async function getAllSummaries() {
      try {
        const { data, error, status } = await supabase
          .from('meetingsummaries')
          .select('date, summary')
          .order('date', { ascending: false });
  
        if (error && status !== 406) throw error;
        if (data) {
          allDoneSummaries = data.map(item => ({
            meetingDate: formatDate(item.date),
            status: "Done", // Setting status to "Done" for all done summaries
            workgroup: item.summary.workgroup
          }));
        }
      } catch (error) {
        console.log("error", error.message);
      }
    }
  
    await getAllMissingSummaries();
    await getAllSummaries();

    const combinedSummaries = [...missingSummaries, ...allDoneSummaries];
    const uniqueSummariesMap = new Map();

    combinedSummaries.forEach(summary => {
        const key = `${summary.meetingDate}-${summary.workgroup}`;
        // Check if the map already has an entry for this key
        if (uniqueSummariesMap.has(key)) {
          // Prioritize "Done" summaries over "Missing"
          const existingSummary = uniqueSummariesMap.get(key);
          if (existingSummary.status !== "Done" && summary.status === "Done") {
            uniqueSummariesMap.set(key, summary);
          }
        } else {
          uniqueSummariesMap.set(key, summary);
        }
      });
  
      const finalSummaries = Array.from(uniqueSummariesMap.values());
  
      return finalSummaries;
  }