import { useState, useEffect } from "react";
import type { NextPage } from "next";
import styles from '../styles/summariestable.module.css';
import SubmitMissingSummary from '../components/SubmitMissingSummary'; 
import { getWorkgroups } from '../utils/getWorkgroups'; 
import { getMissingSummaries } from '../utils/getMissingSummaries';

interface SummaryData {
  meetingDate: string;
  status: string;
  workgroup: string;
  workgroupId: string;
}

const StatusOfSummaries: NextPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<SummaryData[]>([]);
  const [workgroups, setWorkgroups] = useState<any[]>([]); 
  const [allSummaries, setAllSummaries] = useState<any[]>([]);
  const [archivedSummaries, setArchivedSummaries] = useState<SummaryData[]>([]);

  async function fetchCsvData() {
    setLoading(true);
    try {
      const response = await fetch('/api/fetchCsv');
      const data = await response.json();
      console.log('Fetched CSV data:', data);
      setData(data); 
    } catch (error) {
      console.error("Failed to fetch CSV data:", error);
    }
    setLoading(false);
  }

  useEffect(() => { 
    //fetchCsvData();
    fetchWorkgroups(); // Add this line
  }, []);

  async function fetchWorkgroups() {
    try {
      const databaseWorkgroups = await getWorkgroups();
      const { finalSummaries, allArchivedSummaries } = await getMissingSummaries();
      const allSummaries = finalSummaries;
      setAllSummaries(allSummaries)
      setArchivedSummaries(allArchivedSummaries);
      //console.log("allSummaries", allSummaries)
      
      // Assuming databaseWorkgroups should be an array, check and handle accordingly
      if (Array.isArray(databaseWorkgroups)) {
        setWorkgroups(databaseWorkgroups);
      } else {
        console.error("Expected an array for workgroups, received:", databaseWorkgroups);
        // Handle the unexpected format, e.g., set to an empty array or a default value
        setWorkgroups([]);
      }
    } catch (error) {
      console.error("Error fetching workgroups:", error);
      setWorkgroups([]); // Handle error by setting workgroups to an empty array or another default state
    }
  }  

  return (
    <div className={styles.container}>
      <SubmitMissingSummary workgroups={workgroups} allSummaries={allSummaries} allArchivedSummaries={archivedSummaries}/>
      <h1>Status of Summaries</h1>
      {loading && <p>Loading...</p>}

      <div className={styles.issuesTableContainer}>
        {/* Missing Summaries Table */}
        <h2 className={styles.missingHeading}>Missing Summaries</h2>
        <table className={styles.issuesTable}>
          <thead>
            <tr className={styles.tableRow}>
              <th className={styles.tableHeader}>Meeting Date</th>
              <th className={styles.tableHeader}>Workgroup</th>
              <th className={styles.tableHeader}>Status</th>
            </tr>
          </thead>
          <tbody>
            {allSummaries.filter(row => row.status === "Missing").map((row, index) => (
              <tr key={index} className={styles.tableRow}>
                <td className={styles.tableData}>{row.meetingDate}</td>
                <td className={styles.tableData}>{row.workgroup}</td>
                <td className={styles.tableData}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Done Summaries Table */}
        <h2 className={styles.doneHeading}>Done Summaries (Needs to be archived)</h2>
        <table className={styles.issuesTable}>
          <thead>
            <tr className={styles.tableRow}>
              <th className={styles.tableHeader}>Meeting Date</th>
              <th className={styles.tableHeader}>Workgroup</th>
              <th className={styles.tableHeader}>Status</th>
            </tr>
          </thead>
          <tbody>
            {allSummaries.filter(row => row.status === "Done").map((row, index) => (
              <tr key={index} className={styles.tableRow}>
                <td className={styles.tableData}>{row.meetingDate}</td>
                <td className={styles.tableData}>{row.workgroup}</td>
                <td className={styles.tableData}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Archived Summaries Table */}
        <h2 className={styles.archivedHeading}>Archived Summaries</h2>
        <table className={styles.issuesTable}>
          <thead>
            <tr className={styles.tableRow}>
              <th className={styles.tableHeader}>Meeting Date</th>
              <th className={styles.tableHeader}>Workgroup</th>
              <th className={styles.tableHeader}>Status</th>
            </tr>
          </thead>
          <tbody>
            {archivedSummaries.map((row, index) => (
              <tr key={index} className={styles.tableRow}>
                <td className={styles.tableData}>{row.meetingDate}</td>
                <td className={styles.tableData}>{row.workgroup}</td>
                <td className={styles.tableData}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatusOfSummaries;
