// ../components/SummaryMeetingInfo.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../styles/meetinginfo.module.css'; 
import { useMyVariable } from '../context/MyVariableContext';
import SelectNames from './SelectNames';
import WorkingDocs from './WorkingDocs';
import TimestampedVideo from './TimestampedVideo'; 

type SummaryMeetingInfoProps = {
  workgroup: string;
  onUpdate: (info: any) => void;
};

const SummaryMeetingInfo: React.FC<SummaryMeetingInfoProps> = ({ workgroup, onUpdate }) => {
  const { myVariable, setMyVariable } = useMyVariable();

  const {
    name = 'Weekly',
    date = '',
    host = '',
    documenter = '',
    translator = '',
    peoplePresent = '',
    purpose = '',
    townHallNumber = '',
    googleSlides = '',
    meetingVideoLink = '',
    miroBoardLink = '',
    otherMediaLink = '',
    transcriptLink = '',
    mediaLink = '',
    workingDocs = [],
    timestampedVideo = {}
  } = myVariable?.summary?.meetingInfo || {};

  const [meetingInfo, setMeetingInfo] = useState({
    name,
    date,
    host,
    documenter,
    translator,
    peoplePresent,
    purpose,
    townHallNumber,
    googleSlides,
    meetingVideoLink,
    miroBoardLink,
    otherMediaLink,
    transcriptLink,
    mediaLink,
    workingDocs,
    timestampedVideo
  });

  const [displayedWorkingDocs, setDisplayedWorkingDocs] = useState(workingDocs.length > 0 ? [] : [{ title: '', link: '' }]);
  const allWorkingDocs = [...workingDocs, ...displayedWorkingDocs];

  const purposeRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
    }
  };

  useEffect(() => {
    adjustTextareaHeight(purposeRef.current);
  }, [meetingInfo.purpose]);

  const addNewDoc = () => {
    const newDoc = { title: '', link: '' };
    setDisplayedWorkingDocs([...displayedWorkingDocs, newDoc]);
  };

  const handleChange = (e: any, docIndex = null) => {
    const { name, value } = e.target;
  
    if (docIndex !== null) {
      setDisplayedWorkingDocs(prevDisplayedDocs => {
        const updatedDocs = [...prevDisplayedDocs];
        updatedDocs[docIndex] = { ...updatedDocs[docIndex], [name]: value };
        return updatedDocs;
      });
    } else {
      setMeetingInfo(prevMeetingInfo => {
        const updatedMeetingInfo = { ...prevMeetingInfo, [name]: value };
        return updatedMeetingInfo;
      });
    }
  };

  const updateMyVariable = (e: any, index: number) => {
    const updatedMyVariable = { ...myVariable };
    if (!updatedMyVariable.summary.meetingInfo.workingDocs) {
      updatedMyVariable.summary.meetingInfo.workingDocs = [];
    }
  
    if (e) {
      const { name, value } = e.target;
      updatedMyVariable.summary.meetingInfo.workingDocs[index] = { ...updatedMyVariable.summary.meetingInfo.workingDocs[index], [name]: value };
    } else {
      if (updatedMyVariable.summary.meetingInfo.workingDocs.length > 0) {
        updatedMyVariable.summary.meetingInfo.workingDocs.splice(index, 1);
      }
    }
    setMyVariable(updatedMyVariable);
  };  

  const removeDoc = (index: number) => {
    setDisplayedWorkingDocs(prevDocs => {
      const updatedDocs = prevDocs.filter((_, i) => i !== index);
      return updatedDocs;
    });
  };
  
  useEffect(() => {
    onUpdate({ ...meetingInfo, workingDocs: [...workingDocs, ...displayedWorkingDocs] });
  }, [meetingInfo, displayedWorkingDocs]);
  
  const handleSelection = (name: any, selectedNames: any) => {
    const updatedInfo = { ...meetingInfo, [name]: selectedNames };
    setMeetingInfo(updatedInfo);
  };

  useEffect(() => {
    const {
      name = 'Weekly',
      date = '',
      host = '',
      documenter = '',
      translator = '',
      peoplePresent = '',
      purpose = '',
      townHallNumber = '',
      googleSlides = '',
      meetingVideoLink = '',
      miroBoardLink = '',
      otherMediaLink = '',
      transcriptLink = '',
      mediaLink = '',
      workingDocs = [{ title: '', link: '' }],
      timestampedVideo = { url: '', intro: '', timestamps: '' }
    } = myVariable?.summary?.meetingInfo || {};
  
    setMeetingInfo({
      name,
      date,
      host,
      documenter,
      translator,
      peoplePresent,
      purpose,
      townHallNumber,
      googleSlides,
      meetingVideoLink,
      miroBoardLink,
      otherMediaLink,
      transcriptLink,
      mediaLink,
      workingDocs,
      timestampedVideo
    });
  }, [myVariable.summary?.meetingInfo]);
  
  const handleVideoDataUpdate = useCallback((newVideoData: any) => {
    setMeetingInfo(prevMeetingInfo => {
      if (JSON.stringify(prevMeetingInfo.timestampedVideo) === JSON.stringify(newVideoData)) {
        return prevMeetingInfo; 
      }
      return {
        ...prevMeetingInfo,
        timestampedVideo: newVideoData,
      };
    });
  }, []);  

  return (
    <>
    <div className={styles['form-column-flex']}>
    <div className={styles['row-flex-start']}>
      <div className={styles['form-column-flex']}>
        <div className={styles['row-flex-space-between']}>
            <div className={styles['column-flex']}>
              {myVariable.workgroup?.preferred_template?.meetingInfo?.name == 1 && (<>
              <label className={styles['form-label']}>
                Type of meeting:
              </label>
              <select
                  name="name"
                  value={meetingInfo.name || ""}
                  onChange={handleChange}
                  className={styles['form-select']}
                  title="Select the type of meeting. If it's a one-off event, please select 'One-off event'"
              >
                  <option value="Weekly">Weekly</option>
                  <option value="Biweekly">Biweekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="One-off event">One-off event</option>
              </select>
              </>)}
            </div>
            <div className={styles['column-flex']}>
              {myVariable.workgroup?.preferred_template?.meetingInfo?.date == 1 && (<>
              {myVariable.summary?.meetingInfo?.date && (<label className={styles['form-label']}>Meeting Date: (Summary gets saved to this meeting date)</label>)}
              {!myVariable.summary?.meetingInfo?.date && (<label className={styles['form-label']}>Meeting Date: </label>)}
              <input
                type="date"
                name="date"
                value={meetingInfo.date || ""}
                onChange={handleChange}
                className={styles['form-select']}
                title="Click the icon on the right to select a date"
              />
              </>)}
            </div>
          </div>
          <div className={styles['row-flex-start']}>
            {myVariable.workgroup?.preferred_template?.meetingInfo?.host == 1 && (
            <div className={styles.people1}>
              <label className={styles['form-label']}>
                Facilitator:
              </label>
              <SelectNames 
                key={meetingInfo.host}
                onSelect={(selectedNames: any) => handleSelection('host', selectedNames)} 
                initialValue={meetingInfo.host || ""} 
              />
            </div>)}
            {myVariable.workgroup?.preferred_template?.meetingInfo?.documenter == 1 && (
            <div className={styles.people2}>
              <label className={styles['form-label']}>
                Documenter:
              </label>
              <SelectNames 
                key={meetingInfo.documenter}
                onSelect={(selectedNames: any) => handleSelection('documenter', selectedNames)} 
                initialValue={meetingInfo.documenter || ""} 
              />
            </div>)}
            {myVariable.workgroup?.preferred_template?.meetingInfo?.translator == 1 && (
            <div className={styles.people3}>
              <label className={styles['form-label']}>
                Translator:
              </label>
              <SelectNames 
                key={meetingInfo.translator}
                onSelect={(selectedNames: any) => handleSelection('translator', selectedNames)} 
                initialValue={meetingInfo.translator || ""} 
              />
            </div>)}  
          </div>
          <div className={styles['row-flex-start']}>
            <div className={styles.people2}>
              {myVariable.workgroup?.preferred_template?.meetingInfo?.peoplePresent == 1 && (<>
              <label className={styles['form-label']}>
                Present:
              </label>
              <SelectNames 
                key={meetingInfo.peoplePresent}
                onSelect={(selectedNames: any) => handleSelection('peoplePresent', selectedNames)} 
                initialValue={meetingInfo.peoplePresent || ""} 
              />
            </>)}
          </div>
        </div>
      </div>
      <div className={styles['links-column-flex']}>
      {myVariable.workgroup?.preferred_template?.meetingInfo?.purpose == 1 && (<>
      <label className={styles['form-label']}>
        Purpose:
      </label>
      <textarea
        ref={purposeRef}
        name="purpose"
        value={meetingInfo.purpose || ""}
        onChange={(e) => {
          handleChange(e);
          adjustTextareaHeight(purposeRef.current);
        }}
        className={styles['form-input']}
        autoComplete="off"
        title="A sentence on what this group is about. Can be repeated for every summary"
      />
      </>)}
      {myVariable.workgroup?.preferred_template?.meetingInfo?.townHallNumber == 1 && (<>
      <label className={styles['form-label']}>
        Town Hall Number:
      </label>
      <input
        type="text"
        name="townHallNumber"
        value={meetingInfo.townHallNumber || ""}
        onChange={handleChange}
        className={styles['form-select']}
        autoComplete="off"
        title="The number of the town hall meeting"
      />
      </>)}
        {myVariable.workgroup?.preferred_template?.meetingInfo?.meetingVideoLink == 1 && (<>
        <label className={styles['form-label']}>
          Meeting video (link):
        </label>
        <input
          type="text"
          name="meetingVideoLink"
          value={meetingInfo.meetingVideoLink || ""}
          onChange={handleChange}
          className={styles['form-select']}
          autoComplete="off"
        />
        </>)}
        {myVariable.workgroup?.preferred_template?.meetingInfo?.miroBoardLink == 1 && (<>
        <label className={styles['form-label']}>
          Miro board (link):
        </label>
        <input
          type="text"
          name="miroBoardLink"
          value={meetingInfo.miroBoardLink || ""}
          onChange={handleChange}
          className={styles['form-select']}
          autoComplete="off"
        />
        </>)}
        {myVariable.workgroup?.preferred_template?.meetingInfo?.otherMediaLink == 1 && (<>
        <label className={styles['form-label']}>
          Other media (link):
        </label>
        <input
          type="text"
          name="otherMediaLink"
          value={meetingInfo.otherMediaLink || ""}
          onChange={handleChange}
          className={styles['form-select']}
          autoComplete="off"
        />
        </>)}
        {myVariable.workgroup?.preferred_template?.meetingInfo?.transcriptLink == 1 && (<>
        <label className={styles['form-label']}>
          Transcript (link):
        </label>
        <input
          type="text"
          name="transcriptLink"
          value={meetingInfo.transcriptLink || ""}
          onChange={handleChange}
          className={styles['form-select']}
          autoComplete="off"
        />
        </>)}
        {myVariable.workgroup?.preferred_template?.meetingInfo?.mediaLink == 1 && (<>
        <label className={styles['form-label']}>
          Media (link):
        </label>
        <input
          type="text"
          name="mediaLink"
          value={meetingInfo.mediaLink || ""}
          onChange={handleChange}
          className={styles['form-select']}
          autoComplete="off"
        />
        </>)}
      </div>
    </div>
    {myVariable.workgroup?.preferred_template?.meetingInfo?.workingDocs == 1 && (
        <WorkingDocs
        handleChange={handleChange}
        addNewDoc={addNewDoc}
        docs={allWorkingDocs}
        removeDoc={removeDoc}
        originalDocsCount={workingDocs.length}
        updateMyVariable={updateMyVariable}
      />
      )}
      {myVariable.workgroup?.preferred_template?.meetingInfo?.googleSlides == 1 && (<>
        <label className={styles['form-label']}>
          Google Slides (Optional):
        </label>
        <input
          type="text"
          name="googleSlides"
          value={meetingInfo.googleSlides || ""}
          onChange={handleChange}
          className={styles['form-select']}
          autoComplete="off"
        />
      </>)}
    {myVariable.workgroup?.preferred_template?.meetingInfo?.timestampedVideo == 1 && (
        <TimestampedVideo
        onUpdate={handleVideoDataUpdate}
        initialData={meetingInfo.timestampedVideo}
      />
      )}
    </div>
    </>
  );
};

export default SummaryMeetingInfo;
