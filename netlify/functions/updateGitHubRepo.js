// netlify/functions/updateGitHubRepo.js
import { supabase } from '../../lib/supabaseClient';
import { Octokit } from "@octokit/rest";

const BATCH_SIZE = 100;

export const handler = async (event, context) => {
  try {
    let allSummaries = [];
    let lastProcessedId = null;
    let hasMoreSummaries = true;

    while (hasMoreSummaries) {
      // Retrieve the next batch of summaries
      const { data: summaries, error } = await supabase
        .from('meetingsummaries')
        .select('meeting_id, summary')
        .gt('meeting_id', lastProcessedId || 0)
        .limit(BATCH_SIZE)
        .order('meeting_id', { ascending: true });

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
      allSummaries = allSummaries.concat(summaries);
      lastProcessedId = summaries[summaries.length - 1].meeting_id;
    }

    // Commit all summaries to GitHub in a single file
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: "SingularityNET-Archive",
      repo: "SingularityNET-Archive",
      path: "Data/meeting-summaries.json",
      message: "Update meeting summaries",
      content: Buffer.from(JSON.stringify(allSummaries, null, 2)).toString('base64'),
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