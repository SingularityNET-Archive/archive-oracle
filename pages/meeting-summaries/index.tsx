import { useState, useEffect } from "react";
import type { NextPage } from "next";
import styles from '../../styles/meetingsummary.module.css';
import FullArchivalTemplate from '../../components/FullArchivalTemplate';
import MinimalistTemplate from '../../components/MinimalistTemplate';
import NarrativeTemplate from '../../components/NarrativeTemplate';
import ConfirmSummaries from '../../components/ConfirmSummaries'
import { useMyVariable } from '../../context/MyVariableContext';
import { getWorkgroups } from '../../utils/getWorkgroups'
import { updateWorkgroups } from '../../utils/updateWorkgroups'
import { getSummaries } from '../../utils/getsummaries';

type Workgroup = {
  workgroup_id: string;
  workgroup: string;
  last_meeting_id: string;
  preferred_template: string;
};

const MeetingSummary: NextPage = () => {
  const [activeComponent, setActiveComponent] = useState('one');
  const [workgroups, setWorkgroups] = useState<Workgroup[]>([]);
  const [showNewWorkgroupInput, setShowNewWorkgroupInput] = useState(false);
  const [newWorkgroup, setNewWorkgroup] = useState('');
  const { myVariable, setMyVariable } = useMyVariable();
  const [selectedWorkgroupId, setSelectedWorkgroupId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function getWorkgroupList() {
    const workgroupList: any = await getWorkgroups();
    setWorkgroups(workgroupList);
  }

  useEffect(() => {
    getWorkgroupList();
  }, []);

  async function handleSelectChange(e: any) {
    const selectedWorkgroupId = e.target.value;
    const summary: any = await getSummaries(selectedWorkgroupId);

  // Adjust the active component based on summary.type
    if (summary && summary.type) {
      switch (summary.type) {
        case 'Minimalist':
          setActiveComponent('two');
          break;
        case 'Narrative':
          setActiveComponent('three');
          break;
        case 'FullArchival':
        default: // default to FullArchival if type is undefined or unexpected
          setActiveComponent('one');
          break;
      }
    } else {
      setActiveComponent('one'); // default to FullArchival if summary or summary.type is undefined
    }

    if (selectedWorkgroupId === 'add_new') {
      setNewWorkgroup('');
      setShowNewWorkgroupInput(true);
    } else {
      setShowNewWorkgroupInput(false);
      setSelectedWorkgroupId(selectedWorkgroupId); 
      const selectedWorkgroup = workgroups.find(workgroup => workgroup.workgroup_id === selectedWorkgroupId);
      if (selectedWorkgroup) {
        setMyVariable({ ...myVariable, workgroup: selectedWorkgroup, summary });
      }
    }
  }  

  const handleNewWorkgroupChange = (e: any) => {
    setNewWorkgroup(e.target.value);
  }

  const handleRegisterNewWorkgroup = async () => {
    setIsLoading(true);
    const existingWorkgroup = workgroups.find(workgroup => workgroup.workgroup.toLowerCase() === newWorkgroup.toLowerCase());
    if (existingWorkgroup) {
      setSelectedWorkgroupId(existingWorkgroup.workgroup_id);
      setShowNewWorkgroupInput(false);
    } else {
      await updateWorkgroups({ workgroup: newWorkgroup });
      const updatedWorkgroupList: any = await getWorkgroups();
      setWorkgroups(updatedWorkgroupList);
      const newWorkgroupEntry = updatedWorkgroupList.find((workgroup: any) => workgroup.workgroup.toLowerCase() === newWorkgroup.toLowerCase());
      if (newWorkgroupEntry) {
        setSelectedWorkgroupId(newWorkgroupEntry.workgroup_id);
        setMyVariable(prev => ({ ...prev, workgroup: newWorkgroupEntry })); // updating myVariable with new workgroup
      }
      setShowNewWorkgroupInput(false);
    }
    setIsLoading(false);
  };   

  const getComponent = () => {
    switch (activeComponent) {
      case 'one': return <FullArchivalTemplate key={selectedWorkgroupId} />;
      case 'two': return <MinimalistTemplate key={selectedWorkgroupId} />;
      case 'three': return <NarrativeTemplate key={selectedWorkgroupId} />;
      case 'four': return <ConfirmSummaries key={selectedWorkgroupId} />;
      default: return <div>Select a component</div>;
    }
  }  

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
      {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {workgroups.length > 0 && (
              <select
                name="" id="" 
                className={`${styles.select} ${selectedWorkgroupId === '' ? styles.selectGreen : ''}`} 
                value={selectedWorkgroupId} onChange={handleSelectChange}>
                <option value="" disabled>Please select Workgroup</option>
                {workgroups.map((workgroup: any) => (
                  <option key={workgroup.workgroup_id} value={workgroup.workgroup_id}>{workgroup.workgroup}</option>
                ))}
                <option value="add_new">Add new WG</option>
              </select>
            )}
            {showNewWorkgroupInput && (
              <>
                <input className={styles.register} type="text" value={newWorkgroup} autoComplete="off" onChange={handleNewWorkgroupChange} />
                <button className={styles.registerbutton} onClick={handleRegisterNewWorkgroup}>Register New Workgroup</button>
              </>
            )}
          </>
        )}
        {selectedWorkgroupId  && (<div>
        <button className={styles.navButton} onClick={() => setActiveComponent('one')}>Full Archival Template</button>
        <button className={styles.navButton} onClick={() => setActiveComponent('two')}>Minimalist Template</button>
        <button className={styles.navButton} onClick={() => setActiveComponent('three')}>Narrative Template</button>
        {myVariable.isAdmin && <button className={styles.navButton} onClick={() => setActiveComponent('four')}>Confirm Summaries</button>}
        </div>)}
        
      </div>
      {myVariable.isLoggedIn && selectedWorkgroupId  && (<div className={styles.mainContent}>
        {getComponent()}
      </div>)}
      {!myVariable.isLoggedIn && (<div className={styles.pleaseSignIn}>
        <div>
          <h3>Please sign in with Discord</h3>
        </div>
      </div>)}
    </div>
  );
};

export default MeetingSummary;