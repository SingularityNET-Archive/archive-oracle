import axios from 'axios';
import { saveArchivesToDatabase } from '../utils/saveArchivesToDatabase'

const REPO_URL = 'https://api.github.com/repos/SingularityNET-Archive/SingularityNET-Archive-GitBook';

async function fetchFiles(path, archives) {
  const headers = {
    'Authorization': `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`
  };

  const { data: files } = await axios.get(`${REPO_URL}/contents/${path}`, { headers });

  for (const file of files) {
    if (file.type === 'dir') {
      // If it's a directory, explore it recursively
      await fetchFiles(file.path, archives);
    } else if (file.type === 'file') {
      // Get the last commit for the file
      const { data: commits } = await axios.get(`${REPO_URL}/commits`, { params: { path: file.path }, headers });
      const lastCommitDate = new Date(commits[0].commit.author.date);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 8);
      if (lastCommitDate >= twoWeeksAgo) {
        // Fetch the content of the file
        const { data: content } = await axios.get(file.download_url, { headers });
        // Organize the content in the archives object
        const pathKeys = file.path.split('/');
        let current = archives;
        pathKeys.forEach((key, index) => {
          if (index < pathKeys.length - 1) {
            current[key] = current[key] || {};
            current = current[key];
          } else {
            current[key] = content;
          }
        });
      }
    }
  }
}

export async function getDocs() {
  const archives = {};

  try {
    await fetchFiles('timeline', archives);
  } catch (error) {
    console.error('An error occurred:', error);
  }
  saveArchivesToDatabase(archives.timeline)
  .then(data => console.log('Data inserted successfully:', data))
  .catch(error => console.error('Error:', error));
  return archives;
}
