import { useState, useEffect } from "react";
import type { NextPage } from "next";
import styles from '../styles/home.module.css';
import axios from 'axios';

const Home: NextPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
 /*useEffect(() => {
    const fetchMeetingSummaries = async () => {
      const SERVER_API_URL = 'https://archive-oracle.netlify.app/api/getMeetingSummaries';
      const API_KEY = process.env.SERVER_API_KEY; 

      setLoading(true); // Start loading
      try {
        const response = await axios.get(SERVER_API_URL, {
          headers: {
            'api_key': API_KEY,
          },
        });

        console.log(response.data);
        // Handle your data here
      } catch (error) {
        console.error('Error fetching meeting summaries:', error);
        // Handle error here
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchMeetingSummaries();
  }, []);*/

  return (
    <div className={styles.container}>
      {!loading && (
        <div>
          <div>
            <h1>Archive Tool</h1>
            <h2 className={styles.heading2}>A few things to note when editing meeting summaries</h2>
          </div>
          <div>
            <ul>
              <li className={styles.listItem}>When you select your workgroup to submit a meeting summary, it will load all the data from the previous meeting</li>
              <li className={styles.listItem}>{`Please select the date the meeting happened in the "Meeting Date:" dropdown`}</li>
              <li className={styles.listItem}>{`Any changes you save will be saved to the date you selected in the "Meeting Date:" dropdown`}</li>
              <li className={styles.listItem}>Please remember to click the save button when you are done</li>
              <li className={styles.listItem}>Meeting summaries will be reviewed by an Archive member</li>
              <li className={styles.listItem}>When the Archive member approves the data, the GitBook and database will be updated</li>
              <li className={styles.listItem}>...and finally the Discord message will be sent to the Meeting-Summary channel</li>
            </ul>
          </div>
          <div>
          <a 
              href="https://github.com/SingularityNET-Archive/archive-oracle" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.link} // Optional: Add this if you have specific styles for links
            >
              Visit the GitHub Repository for this tool
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
