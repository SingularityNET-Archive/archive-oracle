
async function fetchLatestTag() {
  const url = `https://api.github.com/repos/SingularityNET-Archive/archive-oracle/tags`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}`);
    }
    const tags = await response.json();
    if (tags.length > 0) {
      return tags[0].name;
    } else {
      return 'No tags found';
    }
  } catch (error) {
    console.error('Failed to fetch the latest tag:', error);
    return 'Error fetching tag';
  }
}

export { fetchLatestTag };
