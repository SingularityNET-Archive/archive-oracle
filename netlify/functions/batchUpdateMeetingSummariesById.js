// netlify/functions/batchUpdateMeetingSummariesById.js
import { supabase } from '../../lib/supabaseClient';
import { Octokit } from "@octokit/rest";

const BATCH_SIZE = 200;
const MAX_CONCURRENT_REQUESTS = 5;

async function fetchMeetingSummaries(lastProcessedTimestamp) {
  const { data: summaries, error } = await supabase
    .from('meetingsummaries')
    .select('created_at, meeting_id, summary')
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE * MAX_CONCURRENT_REQUESTS)
    .gt('created_at', lastProcessedTimestamp || '1970-01-01');

  if (error) {
    throw new Error('Failed to retrieve meeting summaries');
  }

  return summaries;
}

function groupSummariesByMeetingId(summaries, allSummaries) {
  summaries.forEach(summary => {
    const { meeting_id, summary: summaryText } = summary;
    if (!allSummaries[meeting_id]) {
      allSummaries[meeting_id] = [];
    }
    allSummaries[meeting_id].push(summaryText);
  });
}

async function commitSummariesToGitHub(allSummaries) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

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

  await octokit.repos.createOrUpdateFileContents({
    owner: "SingularityNET-Archive",
    repo: "SingularityNET-Archive",
    path: "Data/Meeting-Summaries/meeting-summaries-by-id.json",
    message: "Update meeting summaries",
    content: Buffer.from(JSON.stringify(allSummaries, null, 2)).toString('base64'),
    sha: currentSHA,
  });
}

async function processAndCommitSummaries() {
  const allSummaries = {};
  let lastProcessedTimestamp = null;
  let hasMoreSummaries = true;

  while (hasMoreSummaries) {
    const summaries = await fetchMeetingSummaries(lastProcessedTimestamp);

    if (summaries.length === 0) {
      hasMoreSummaries = false;
      break;
    }

    groupSummariesByMeetingId(summaries, allSummaries);
    lastProcessedTimestamp = summaries[summaries.length - 1].created_at;
  }

  await commitSummariesToGitHub(allSummaries);
}

export const handler = async (event, context) => {
  try {
    await processAndCommitSummaries();

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