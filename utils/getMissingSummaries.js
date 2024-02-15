import { supabase } from "../lib/supabaseClient";

function formatDate(dateString) {
    const date = new Date(dateString);
    const formattedDate = `${date.getDate()} ${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;
    return formattedDate;
}

export async function getMissingSummaries() {
    let missingSummaries = [];
    let allSummaries = []; // Will include both done and archived summaries with adjustments

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
              .select('date, summary, confirmed, workgroup_id, updated_at')
              .order('date', { ascending: false });

            if (error && status !== 406) throw error;

            if (data) {
                const summariesMap = new Map();

                data.forEach(item => {
                    const key = `${item.date}-${item.workgroup_id}`;
                    const summary = {
                        meetingDate: formatDate(item.date),
                        status: item.confirmed ? "Archived" : "Done",
                        workgroup: item.summary.workgroup, // Assuming 'summary' has a 'workgroup' property
                        workgroupId: item.workgroup_id,
                        updated_at: item.updated_at,
                        confirmed: item.confirmed
                    };

                    if (!summariesMap.has(key)) {
                        summariesMap.set(key, [summary]);
                    } else {
                        summariesMap.get(key).push(summary);
                    }
                });

                summariesMap.forEach((value, key) => {
                    // Sort summaries by confirmed status first, then by updated_at descending
                    const sortedSummaries = value.sort((a, b) => b.confirmed - a.confirmed || new Date(b.updated_at) - new Date(a.updated_at));
                    const actualSummary = sortedSummaries[0]; // Get the first summary after sorting

                    // Remove unnecessary properties for the final result
                    delete actualSummary.updated_at;
                    delete actualSummary.confirmed;

                    allSummaries.push(actualSummary);
                });
            }
        } catch (error) {
            console.log("error", error.message);
        }
    }

    await getAllMissingSummaries();
    await getAllSummaries();
    const combinedSummaries = [...missingSummaries, ...allSummaries];
    const uniqueSummariesMap = new Map();

    combinedSummaries.forEach(summary => {
        const key = `${summary.meetingDate}-${summary.workgroup}`;
        // Check if the map already has an entry for this key
        if (uniqueSummariesMap.has(key)) {
          // Prioritize "Done" summaries over "Missing"
          const existingSummary = uniqueSummariesMap.get(key);
          if ((existingSummary.status !== "Done" && summary.status === "Done") || (existingSummary.status !== "Archived" && summary.status === "Archived")) {
            uniqueSummariesMap.set(key, summary);
          }
        } else {
          uniqueSummariesMap.set(key, summary);
        }
      });
  
      const allFinalSummaries = Array.from(uniqueSummariesMap.values());
    // Since allSummaries now already includes the logic for both "Done" and "Archived" statuses
    // and ensures that only actual summaries are included, we directly use it
    const finalSummaries = allFinalSummaries.filter(summary => summary.status !== "Archived");
    const allArchivedSummaries = allSummaries.filter(summary => summary.status === "Archived");

    return { finalSummaries, allArchivedSummaries };
}
