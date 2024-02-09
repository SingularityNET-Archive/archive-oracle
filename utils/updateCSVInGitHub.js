// File: utils/githubCSVUtils.js
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export const fetchAndUpdateCSV = async ({ owner, repo, path, branch = 'main', summariesToUpdate }) => {
  // Fetch the current CSV content
  const { data: fileData } = await octokit.repos.getContent({
    owner,
    repo,
    path,
    ref: branch,
  });
  const currentCSV = Buffer.from(fileData.content, 'base64').toString('utf8');

  // Update the CSV content based on allSummaries
  const updatedCSV = updateCSVContent(currentCSV, summariesToUpdate);

  // Encode the updated CSV content in Base64 for GitHub
  const contentEncoded = Buffer.from(updatedCSV).toString('base64');

  // Update the file on GitHub
  const { data: updateResponse } = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: "Update CSV with new summaries",
    content: contentEncoded,
    sha: fileData.sha,
    branch,
  });

  return updateResponse;
};

const updateCSVContent = (currentCSV, summariesToUpdate) => {
  const lines = currentCSV.split('\n').filter(line => line.trim()); // Exclude empty lines
  const headers = lines.shift().split(','); // Extract headers
  let csvObjects = lines.map(line => line.split(',').reduce((acc, cur, i) => ({
    ...acc,
    [headers[i]]: cur,
  }), {}));

  // Create a map of existing summaries for quick lookup
  let existingSummariesMap = new Map(csvObjects.map(obj => [`${obj.meetingDate}-${obj.workgroup}`, obj]));

  // Iterate over allSummaries to update existing or add new entries
  summariesToUpdate.forEach(summary => {
    const key = `${summary.meetingDate}-${summary.workgroup}`;
    if (existingSummariesMap.has(key)) {
      // Update existing entry
      const existingEntry = existingSummariesMap.get(key);
      existingEntry.status = summary.status; // Assuming status is the field to update
    } else {
      // Add new entry
      existingSummariesMap.set(key, summary);
    }
  });

  // Convert the updated map back to CSV string
  const updatedCSVObjects = Array.from(existingSummariesMap.values());
  // Function to parse custom date format into a Date object
  function parseCustomDate(dateString) {
    const [day, month, year] = dateString.split(' ');
    const monthIndex = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(month);
    return new Date(year, monthIndex, day);
  }

  // Sort the objects by status ("Missing" at the top), then by date in descending order
  updatedCSVObjects.sort((a, b) => {
    // Sort by status
    if (a.status === "Missing" && b.status !== "Missing") {
      return -1;
    } else if (a.status !== "Missing" && b.status === "Missing") {
      return 1;
    }

    // Then sort by date within the same status group
    const dateA = parseCustomDate(a.meetingDate);
    const dateB = parseCustomDate(b.meetingDate);
    return dateB - dateA; // Descending order
  });

  // Convert sorted objects back to CSV lines
  const updatedCSVLines = updatedCSVObjects.map(obj => headers.map(header => obj[header] || "").join(','));
  const updatedCSV = [headers.join(',')].concat(updatedCSVLines).join('\n');

  return updatedCSV;
};