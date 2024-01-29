import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from 'next/router';
import styles from '../../styles/meetingsummary.module.css';
import SummaryTemplate from '../../components/SummaryTemplate';
import ArchiveSummaries from '../../components/ArchiveSummaries'
import { useMyVariable } from '../../context/MyVariableContext';
import { getWorkgroups } from '../../utils/getWorkgroups'
import { updateWorkgroups } from '../../utils/updateWorkgroups'
import { getSummaries } from '../../utils/getsummaries';
import { getNames } from '../../utils/getNames'
import { getTags } from '../../utils/getTags'

type Workgroup = {
  workgroup_id: string;
  workgroup: string;
  last_meeting_id: string;
  preferred_template: string;
};

type Names = {
  value: any;
  label: any;
};

const SubmitMeetingSummary: NextPage = () => {
  const router = useRouter();
  const [activeComponent, setActiveComponent] = useState('two');
  const [workgroups, setWorkgroups] = useState<Workgroup[]>([]);
  const [meetings, setMeetings] = useState([]);
  const [showNewWorkgroupInput, setShowNewWorkgroupInput] = useState(false);
  const [newWorkgroup, setNewWorkgroup] = useState('');
  const { myVariable, setMyVariable } = useMyVariable();
  const [selectedWorkgroupId, setSelectedWorkgroupId] = useState('');
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [names, setNames] = useState<Names[]>([])
  const [tags, setTags] = useState({})

  async function getWorkgroupList() {
    setIsLoading(true);
    const workgroupList: any = await getWorkgroups();
    const names1 = await getNames(); 
    const tags1 = await getTags(); 

    let newNames = names1.map((value) => ({ value: value.name, label: value.name }));

    let otherTags = tags1
      .filter(tag => tag.type === 'other')
      .map(tag => ({ value: tag.tag, label: tag.tag }));

    let emotionTags = tags1
      .filter(tag => tag.type === 'emotions')
      .map(tag => ({ value: tag.tag, label: tag.tag }));

    let topicTags = tags1
      .filter(tag => tag.type === 'topicsCovered')
      .map(tag => ({ value: tag.tag, label: tag.tag }));

    let referenceTags = tags1
      .filter(tag => tag.type === 'references')
      .map(tag => ({ value: tag.tag, label: tag.tag }));
    
    let gamesPlayedTags = tags1
      .filter(tag => tag.type === 'gamesPlayed')
      .map(tag => ({ value: tag.tag, label: tag.tag }));
     
    setWorkgroups(workgroupList);
    setNames(newNames);
    setTags({ other: otherTags, emotions: emotionTags, topicsCovered: topicTags, references: referenceTags, gamesPlayed: gamesPlayedTags });
    setIsLoading(false);
  }
  const orderMapping = {
    "Gamers Guild": ["narrative", "decisionItems", "actionItems", "gameRules", "leaderboard"],
    "Writers Workgroup": ["narrative", "decisionItems", "actionItems", "learningPoints"],
    "Video Workgroup": ["discussionPoints", "decisionItems", "actionItems"],
    "Archival Workgroup": ["decisionItems", "actionItems", "learningPoints"],
    "Treasury Guild": ["discussionPoints", "decisionItems", "actionItems"],
    "Dework PBL": ["discussionPoints", "decisionItems", "actionItems"],
    "Knowledge Base Workgroup": ["discussionPoints", "decisionItems", "actionItems"],
    "Onboarding Workgroup": ["townHallUpdates", "discussionPoints", "decisionItems", "actionItems", "learningPoints", "issues"],
    "Research and Development Guild": ["meetingTopics", "discussionPoints", "decisionItems", "actionItems"],
    "Governance Workgroup": ["narrative", "discussionPoints", "decisionItems", "actionItems"],
    //"Education Guild": ["meetingTopics", "discussionPoints", "decisionItems", "actionItems"]
  };
  
useEffect(() => {
  async function fetchInitialData(workgroupId: string) {
    setIsLoading(true);
    const summaries: any = await getSummaries(workgroupId);
    setMeetings(summaries)
    if (summaries && summaries[0]?.type) {
      setActiveComponent('two');
    }
      setShowNewWorkgroupInput(false);
      setSelectedWorkgroupId(workgroupId); 
      const selectedWorkgroup = workgroups.find(workgroup => workgroup.workgroup_id === workgroupId);
      if (selectedWorkgroup) {
        setMyVariable({ ...myVariable, workgroup: selectedWorkgroup, summaries, summary: summaries[0], names, tags, agendaItemOrder: orderMapping});
      }
      setIsLoading(false);
  }

  if (router.query.workgroup && workgroups.length > 0) {
    fetchInitialData(router.query.workgroup as string);
  }
}, [router.query, workgroups]);

  useEffect(() => {
    getWorkgroupList();
  }, []);

  async function handleSelectChange(e: any) {
    const selectedWorkgroupId = e.target.value;
    const summaries: any = selectedWorkgroupId != 'add_new' ? await getSummaries(selectedWorkgroupId) : null;
    setMeetings(summaries)
    if (summaries && summaries[0]?.type) {
      setActiveComponent('two');
    }

    if (selectedWorkgroupId === 'add_new') {
      setNewWorkgroup('');
      setShowNewWorkgroupInput(true);
    } else {
      setShowNewWorkgroupInput(false);
      setSelectedWorkgroupId(selectedWorkgroupId); 
      const selectedWorkgroup = workgroups.find(workgroup => workgroup.workgroup_id === selectedWorkgroupId);
      if (selectedWorkgroup) {
        setMyVariable({ ...myVariable, workgroup: selectedWorkgroup, summaries, summary: summaries[0], names, tags });
      }
    }
    if (selectedWorkgroupId !== 'add_new') {
      router.push(`/submit-meeting-summary?workgroup=${selectedWorkgroupId}`, undefined, { shallow: true });
    }
    //console.log("myVariable", myVariable );
  }  
  async function handleSelectChange2(e: any) {
    const newSelectedMeetingId = e.target.value;
    setSelectedMeetingId(newSelectedMeetingId); // Correctly set the selectedMeetingId

    // Find the selected summary using the new selectedMeetingId
    const selectedSummary = meetings.find((meeting: any) => meeting.meeting_id === newSelectedMeetingId);
    
    // If there's a selected summary, update the myVariable state with that summary
    if (selectedSummary) {
      setMyVariable(prevMyVariable => ({
        ...prevMyVariable,
        summary: selectedSummary // Set the selected summary here
      }));
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
        setMyVariable(prev => ({ ...prev, workgroup: newWorkgroupEntry, names, tags })); // updating myVariable with new workgroup
      }
      setShowNewWorkgroupInput(false);
    }
    setIsLoading(false);
  };   

  const getComponent = () => {
    switch (activeComponent) {
      case 'two': return <SummaryTemplate key={selectedWorkgroupId} updateMeetings={updateMeetings} />;
      case 'four': return <ArchiveSummaries key={selectedWorkgroupId} />;
      default: return <div>Select a component</div>;
    }
  }  

  function formatDate(isoString: any) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  
    const date = new Date(isoString);
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
  
    return `${day} ${months[monthIndex]} ${year}`;
  }
  
  const updateMeetings = (newMeetingSummary: any) => {
    //console.log("Before update, meetings:", meetings, newMeetingSummary); // Log the current state before update
  
    setMeetings(prevMeetings => {
      let updatedMeetings: any = [...prevMeetings];
      const meetingIndex: any = updatedMeetings.findIndex((meeting: any) => meeting.meeting_id === newMeetingSummary.meeting_id);
  
      if (meetingIndex !== -1) {
        // Replace existing summary
        updatedMeetings[meetingIndex] = newMeetingSummary;
      } else {
        // Add new summary
        updatedMeetings.unshift(newMeetingSummary);
      }
      updatedMeetings = updatedMeetings.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSelectedMeetingId(newMeetingSummary.meeting_id);
      //console.log("After update, meetings:", updatedMeetings); // Log the new state
      return updatedMeetings;
    });
  };
  

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
      {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {workgroups.length > 0 && (
              <>
                <div className={styles['column-flex']}>
                  <label className={styles['form-label']} htmlFor="">Select Workgroup</label>
                  <select
                    name="" id="" 
                    className={`${styles.select} ${selectedWorkgroupId === '' ? styles.selectGreen : ''}`} 
                    value={selectedWorkgroupId} onChange={handleSelectChange}
                    title="Select a workgroup">
                    <option value="" disabled>Please select Workgroup</option>
                    {workgroups.map((workgroup: any) => (
                      <option key={workgroup.workgroup_id} value={workgroup.workgroup_id}>{workgroup.workgroup}</option>
                    ))}
                    {myVariable.roles?.isAdmin && (<option value="add_new">Add new WG</option>)}
                  </select>
                </div>
              </>
            )}
            {workgroups.length > 0 && meetings?.length > 0 && (
              <>
              <div className={styles['column-flex']}>
                <label className={styles['form-label']} htmlFor="">Select previous meeting data</label>
                <select
                  name="" id="" 
                  className={styles.select} 
                  value={selectedMeetingId} onChange={handleSelectChange2}
                  title="Defaults to latest meeting, only change this when you want to use a previous meeting as template">
                  {meetings.map((meeting: any) => (
                    <option 
                      key={`${meeting.meeting_id}-${meeting.updated_at}`} 
                      value={meeting.meeting_id}>
                        {formatDate(meeting.date)} {meeting.username}
                    </option>
                  ))}
                </select>
              </div>
              </>
            )}
            {showNewWorkgroupInput && (
              <>
                <input className={styles.register} type="text" value={newWorkgroup} autoComplete="off" onChange={handleNewWorkgroupChange} />
                <button className={styles.registerbutton} onClick={handleRegisterNewWorkgroup}>Register New Workgroup</button>
              </>
            )}
          </>
        )}
        {selectedWorkgroupId  && (<>
        {myVariable.roles?.isAdmin && (<button className={styles.navButton} onClick={() => setActiveComponent('two')}>Summary</button>)}
        {myVariable.roles?.isAdmin && <button className={styles.navButton} onClick={() => setActiveComponent('four')}>Archive Summaries</button>}
        </>)}
      </div>
      {myVariable.isLoggedIn && selectedWorkgroupId  && (<div className={styles.mainContent}>
        {getComponent()}
      </div>)}
      {myVariable.isLoggedIn && !selectedWorkgroupId && !isLoading && (<div className={styles.nomainContent}>
        <h2>Please select workgroup</h2>
      </div>)}
      {!myVariable.isLoggedIn && (<div className={styles.pleaseSignIn}>
        <div>
          <h3>Please sign in with Discord</h3>
        </div>
      </div>)}
    </div>
  );
};

export default SubmitMeetingSummary;