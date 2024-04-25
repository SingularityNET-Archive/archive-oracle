// netlify/functions/batchUpdateMeetingSummariesArray.js
import { supabase } from '../../lib/supabaseClient';
import { Octokit } from "@octokit/rest";

export const handler = async (event, context) => {
  try {
    // Retrieve all summaries
    const { data: summaries, error } = await supabase
      .from('meetingsummaries')
      .select('meeting_id, created_at, summary')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error retrieving meeting summaries:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to retrieve meeting summaries' }),
      };
    }

    // Extract summaries from the retrieved data
    const allSummaries = summaries.map(summary => summary.summary);

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