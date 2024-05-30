// netlify/functions/singleCallUpdateMeetingSummariesArray.js
import { supabase } from '../../lib/supabaseClient';
import { Octokit } from "@octokit/rest";

export const handler = async (event, context) => {
  try {
    // Retrieve all summaries
    const { data: summaries, error } = await supabase
      .from('meetingsummaries')
      .select('meeting_id, created_at, summary')
      .eq('confirmed', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error retrieving meeting summaries:', error);
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to retrieve meeting summaries' }), };
    }

    // Group summaries by year
    const summariesByYear = {};
    summaries.forEach(summary => {
      const year = new Date(summary.summary.meetingInfo.date).getFullYear();
      if (!summariesByYear[year]) {
        summariesByYear[year] = [];
      }
      summariesByYear[year].push(summary.summary);
    });

    // Commit summaries to GitHub in separate year folders
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN, });

    for (const year in summariesByYear) {
      const yearSummaries = summariesByYear[year];
      const path = `Data/Snet-Ambassador-Program/Meeting-Summaries/${year}/meeting-summaries-array.json`;

      // Get the current SHA of the file
      let currentSHA = null;
      try {
        const { data: currentFile } = await octokit.repos.getContent({
          owner: "SingularityNET-Archive",
          repo: "SingularityNET-Archive",
          path,
        });
        currentSHA = currentFile.sha;
      } catch (error) {
        if (error.status !== 404) {
          throw error;
        }
      }

      await octokit.repos.createOrUpdateFileContents({
        owner: "SingularityNET-Archive",
        repo: "SingularityNET-Archive",
        path,
        message: `Update meeting summaries for ${year}`,
        content: Buffer.from(JSON.stringify(yearSummaries, null, 2)).toString('base64'),
        sha: currentSHA,
      });
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Meeting summaries updated successfully' }), };
  } catch (error) {
    console.error('Error in updateGitHubRepo function:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to update meeting summaries' }), };
  }
};