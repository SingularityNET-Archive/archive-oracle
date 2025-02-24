import { useState, useEffect } from "react";
import type { NextPage } from "next";
import styles from '../styles/home.module.css';
import axios from 'axios';

const Home: NextPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
 /*useEffect(() => { // Used for testing the API
    const fetchMeetingSummaries = async () => {
      const SERVER_API_URL = '/api/getMeetingSummaries';
      const API_KEY = process.env.NEXT_PUBLIC_SERVER_API_KEY; 

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
              <li className={styles.listItem}>When you hover over input fields it will give you a tip on what is needed or how it works</li>
              <li className={styles.listItem}>When you select your workgroup it will ask how you want to proceed in creating the meeting summary</li>
              <li className={styles.listItem}>It will give you the following options - Edit existing summary, New clean summary or New prefilled Summary</li>
              <li className={styles.listItem}>For each of these options you need to select a date</li>
              <li className={styles.listItem}>The tool now autosaves</li>
              <li className={styles.listItem}>Bottom left of the save button you will find the date and time the summary was last saved</li>
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
