import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { fetchIssues } from '../utils/fetchIssues';
import styles from '../styles/issues.module.css';

interface Issue {
  id: number;
  title: string;
  html_url: string;
  state: string;
}

const StatusOfSummaries: NextPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [openIssues, setOpenIssues] = useState<Issue[]>([]);
  const [closedIssues, setClosedIssues] = useState<Issue[]>([]);

  const newIssueUrl = `https://github.com/SingularityNET-Archive/archive-oracle/issues/new?assignees=Andre-Diamond&labels=tool-issue&projects=SingularityNET-Archive%2F3&template=testing_issue.yml&title=%2AEnter+title+here%2A+-+%5BDate%3A+${getCurrentFormattedDate()}%5D`;

  async function getIssues() {
    setLoading(true);
    const issues = await fetchIssues();
    console.log(issues)
    const open = issues.filter((issue: Issue) => issue.state === 'open');
    const closed = issues.filter((issue: Issue) => issue.state === 'closed');
    setOpenIssues(open);
    setClosedIssues(closed);
    setLoading(false);
  }

  useEffect(() => { 
    getIssues()   
  }, []); 

  function getCurrentFormattedDate() {
    const today = new Date();
    const yyyy = today.getFullYear().toString();
    let mm = (today.getMonth() + 1).toString(); // January is 0!
    let dd = today.getDate().toString();
  
    if (dd.length < 2) dd = '0' + dd;
    if (mm.length < 2) mm = '0' + mm;
  
    return yyyy + '-' + mm + '-' + dd;
  }
  
  return (
    <div className={styles.container}>
      <h1>Issues</h1>
      <a href={newIssueUrl} target="_blank" rel="noopener noreferrer">
        <button className={styles.createIssueButton}>Create New Issue</button>
      </a>
      <div className={styles.issuesTableContainer}>
  
        {/* Open Issues Table */}
        <table className={styles.issuesTable}>
          <thead>
            <tr>
              <th colSpan={2}>Open Issues</th>
            </tr>
          </thead>
          <tbody>
            {openIssues.map(issue => (
              <tr key={issue.id} className={styles.openIssue}>
                <td>
                  <a className={styles.openIssueLink} href={issue.html_url} target="_blank" rel="noopener noreferrer">
                    {issue.title}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
        {/* Closed Issues Table */}
        <table className={styles.issuesTable}>
          <thead>
            <tr>
                <th colSpan={2}>Closed Issues</th>
            </tr>
          </thead>
          <tbody>
            {closedIssues.map(issue => (
              <tr key={issue.id}>
                <td>
                  <a className={styles.closedIssueLink} href={issue.html_url} target="_blank" rel="noopener noreferrer">
                    {issue.title}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
      </div>
    </div>
  );
    
};

export default StatusOfSummaries;