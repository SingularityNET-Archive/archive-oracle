// netlify/functions/batchUpdateMeetingSummariesById.js
import { supabase } from '../../lib/supabaseClient';
import { Octokit } from "@octokit/rest";

const BATCH_SIZE = 200; // Increase the batch size
const MAX_CONCURRENT_REQUESTS = 5; // Adjust the number of concurrent requests

export const handler = async (event, context) => {
  try {
    let allSummaries = {};
    let lastProcessedTimestamp = null;
    let hasMoreSummaries = true;

    while (hasMoreSummaries) {
      const { data: summaries, error } = await supabase
        .from('meetingsummaries')
        .select('created_at, meeting_id, summary')
        .order('created_at', { ascending: true })
        .limit(BATCH_SIZE * MAX_CONCURRENT_REQUESTS)
        .gt('created_at', lastProcessedTimestamp || '1970-01-01');

      if (error) {
        console.error('Error retrieving meeting summaries:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to retrieve meeting summaries' }),
        };
      }

      if (summaries.length === 0) {
        hasMoreSummaries = false;
        break;
      }

      // Group summaries by meeting_id
      summaries.forEach(summary => {
        const { meeting_id, summary: summaryText } = summary;
        if (!allSummaries[meeting_id]) {
          allSummaries[meeting_id] = [];
        }
        allSummaries[meeting_id].push(summaryText);
      });

      lastProcessedTimestamp = summaries[summaries.length - 1].created_at;
    }

    // Commit all summaries to GitHub in a single file
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    // Get the current SHA of the file
    let currentSHA = null;
    try {
      const { data: currentFile } = await octokit.repos.getContent({
        owner: "SingularityNET-Archive",
        repo: "SingularityNET-Archive",
        path: "Data/Meeting-Summaries/meeting-summaries-by-id.json",
      });
      currentSHA = currentFile.sha;
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
    }

    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: "SingularityNET-Archive",
      repo: "SingularityNET-Archive",
      path: "Data/Meeting-Summaries/meeting-summaries-by-id.json",
      message: "Update meeting summaries",
      content: Buffer.from(JSON.stringify(allSummaries, null, 2)).toString('base64'),
      sha: currentSHA,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Meeting summaries updated successfully' }),
    };
  } catch (error) {
    console.error('Error in updateGitHubRepo function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update meeting summaries' }),
    };
  }
};