import { useState } from "react";
import type { NextPage } from "next";
import styles from '../../styles/meetingsummary.module.css';
import TypeA from '../../components/TypeA';
import TypeB from '../../components/TypeB';
import UpdateGitbook from '../../components/UpdateGitbook';

const MeetingSummary: NextPage = () => {
  const [activeComponent, setActiveComponent] = useState('one');

  const getComponent = () => {
    switch (activeComponent) {
      case 'one': return <TypeA />;
      case 'two': return <TypeB />;
      case 'three': return <UpdateGitbook />;
      default: return <div>Select a component</div>;
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <button className={styles.navButton} onClick={() => setActiveComponent('one')}>Summary type A</button>
        <button className={styles.navButton} onClick={() => setActiveComponent('two')}>Summary type B</button>
        <button className={styles.navButton} onClick={() => setActiveComponent('three')}>Update GitBook</button>
      </div>
      <div className={styles.mainContent}>
        {getComponent()}
      </div>
    </div>
  );
};

export default MeetingSummary;