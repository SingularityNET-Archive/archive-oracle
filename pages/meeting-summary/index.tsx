import { useState } from "react";
import type { NextPage } from "next";
import styles from '../../styles/meetingsummary.module.css';
import TypeA from '../../components/TypeA';
import TypeB from '../../components/TypeB';

const MeetingSummary: NextPage = () => {
  const [activeComponent, setActiveComponent] = useState('one');

  const getComponent = () => {
    switch (activeComponent) {
      case 'one': return <TypeA />;
      case 'two': return <TypeB />;
      default: return <div>Select a component</div>;
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <button className={styles.navButton} onClick={() => setActiveComponent('one')}>Summary type A</button>
        <button className={styles.navButton} onClick={() => setActiveComponent('two')}>Summary type B</button>
      </div>
      <div className={styles.mainContent}>
        {getComponent()}
      </div>
    </div>
  );
};

export default MeetingSummary;