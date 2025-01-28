// netlify/functions/batchUpdateMeetingSummariesArray.js
import { supabase } from '../../lib/supabaseClient';
import { Octokit } from "@octokit/rest";

const BATCH_SIZE = 100;
const MAX_CONCURRENT_REQUESTS = 10;

function sanitizeObject(item) {
  if (typeof item === 'string') {
    
    return item
      .replace(/\r?\n/g, ' ') // Remove newlines
      .replace(/[\u2013\u2014\u2015]/g, '-') // Handle en dash, em dash, and horizontal bar
      .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'") // Handle various single quotes
      .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"') // Handle various double quotes
      .replace(/[\u2026]/g, '...') // Handle ellipsis
      .replace(/[\u00A0]/g, ' ') // Replace non-breaking space with regular space
      .trim();
  }
  
  if (Array.isArray(item)) {
    return item.map(element => sanitizeObject(element));
  }
  
  if (item && typeof item === 'object') {
    const newObj = {};
    for (const key in item) {
      newObj[key] = sanitizeObject(item[key]);
    }
    return newObj;
  }

  // for numbers, booleans, null, etc just return item.
  return item;
}

async function fetchMeetingSummaries(lastProcessedTimestamp, batchNumber) {
  const { data: summaries, error } = await supabase
    .from('meetingsummaries')
    .select('created_at, meeting_id, summary')
    .eq('confirmed', true)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE)
    .gt('created_at', lastProcessedTimestamp || '1970-01-01')
    .range(batchNumber * BATCH_SIZE, (batchNumber + 1) * BATCH_SIZE - 1);

  if (error) {
    throw new Error('Failed to retrieve meeting summaries');
  }

  return summaries;
}

function groupSummariesByYear(summaries, allSummaries) {
  summaries.forEach(summary => {
    const { summary: summaryText } = summary;
    const year = new Date(summaryText.meetingInfo.date).getFullYear();

    if (!allSummaries[year]) {
      allSummaries[year] = [];
    }

    // Sanitize the summary object
    const sanitizedSummary = sanitizeObject(summaryText);

    allSummaries[year].push(sanitizedSummary);
  });
}

async function commitSummariesToGitHub(allSummaries) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  for (const year in allSummaries) {
    const yearSummaries = allSummaries[year];
    const path = `Data/Snet-Ambassador-Program/Meeting-Summaries/${year}/meeting-summaries-array.json`;

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
}

async function processAndCommitSummaries() {
  const allSummaries = {};
  let lastProcessedTimestamp = null;
  let hasMoreSummaries = true;
  let batchNumber = 0;

  while (hasMoreSummaries) {
    const fetchPromises = [];
    for (let i = 0; i < MAX_CONCURRENT_REQUESTS; i++) {
      fetchPromises.push(fetchMeetingSummaries(lastProcessedTimestamp, batchNumber));
      batchNumber++;
    }

    const summariesBatches = await Promise.all(fetchPromises);
    const flattenedSummaries = summariesBatches.flat();

    if (flattenedSummaries.length === 0) {
      hasMoreSummaries = false;
      break;
    }

    groupSummariesByYear(flattenedSummaries, allSummaries);

    lastProcessedTimestamp = flattenedSummaries[flattenedSummaries.length - 1].created_at;
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