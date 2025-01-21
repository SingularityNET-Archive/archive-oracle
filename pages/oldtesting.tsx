import { useState } from "react";
import axios from 'axios';
import type { NextPage } from "next";
import styles from '../styles/home.module.css';

const OldTesting: NextPage = () => {
  const [loading, setLoading] = useState<boolean>(false);

  async function fetchDocs() {
    let archives = {};
    console.log("Fetching Docs");
    await axios.get('/api/fetchDocs')
    .then((response) => {
      archives = response.data;
      // Handle the archives data here
    })
    .catch((error) => {
      console.error('An error occurred while fetching the documents:', error);
    });
    console.log("info", archives)
  }

  return (
    <div className={styles.container}>
      {loading && (<div>
        <div>
          <h1>Home</h1>
        </div>
        <div>
          <button onClick={fetchDocs} disabled={loading}>
            {loading ? "Loading..." : "GetDocs"}
          </button>
        </div>
      </div>)}
    </div>
  );
};

export default OldTesting;
