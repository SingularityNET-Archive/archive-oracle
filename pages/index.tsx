import { useState } from "react";
import type { NextPage } from "next";
import styles from '../styles/home.module.css';

const Home: NextPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  

  return (
    <div className={styles.container}>
      {!loading && (<div>
        <div>
          <h1>Archive Tool</h1>
          <h2>A few things to note when submitting summaries</h2>
          <div>
            <ul>
              <li>When you select your workgroup it will load all the data from the previous meeting</li>
              <li>Any changes you make will be saved to the date you select in the dropdown</li>
              <li>After you submit your summary it will be reviewed by an Archive member</li>
              <li>When Archive member approves the data, the GitBook and database will be updated</li>
              <li>...and finally the Discord message will be sent to the Meeting-Summary channel</li>
            </ul>
          </div>
        </div>
      </div>)}
    </div>
  );
};

export default Home;
