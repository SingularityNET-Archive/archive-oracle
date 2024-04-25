// netlify/functions/batchUpdateMeetingSummariesArray.js
import { supabase } from '../../lib/supabaseClient';
import { Octokit } from "@octokit/rest";

const BATCH_SIZE = 100;

export const handler = async (event, context) => {
  try {
    let allSummaries = [];
    let lastProcessedTimestamp = null;
    let hasMoreSummaries = true;

    while (hasMoreSummaries) {
      // Retrieve the next batch of summaries
      let { data: summaries, error } = await supabase
        .from('meetingsummaries')
        .select('meeting_id, created_at, summary')
        .order('created_at', { ascending: true })
        .limit(BATCH_SIZE);

      if (lastProcessedTimestamp) {
        summaries = summaries.filter(summary => summary.created_at > lastProcessedTimestamp);
      }

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

      // Accumulate the summaries
      allSummaries = allSummaries.concat(summaries.map(summary => summary.summary));
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
        path: "Data/Meeting-Summaries/meeting-summaries-array.json",
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
      path: "Data/Meeting-Summaries/meeting-summaries-array.json",
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