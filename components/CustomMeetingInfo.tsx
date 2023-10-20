import { useState, useEffect } from 'react';
import styles from '../styles/typea.module.css'; 
import { useMyVariable } from '../context/MyVariableContext';
import SelectNames from '../components/SelectNames'

type CustomMeetingInfoProps = {
  workgroup: string;
  onUpdate: (info: any) => void;
};

const CustomMeetingInfo: React.FC<CustomMeetingInfoProps> = ({ workgroup, onUpdate }) => {
  const { myVariable, setMyVariable } = useMyVariable();

  const {
    name = 'Weekly Meeting',
    date = '',
    host = '',
    documenter = '',
    peoplePresent = '',
    purpose = '',
    meetingVideoLink = '',
    miroBoardLink = '',
    otherMediaLink = '',
    transcriptLink = '',
    mediaLink = '',
  } = myVariable?.summary?.meetingInfo || {};

  const [meetingInfo, setMeetingInfo] = useState({
    name,
    date: "",
    host,
    documenter,
    peoplePresent,
    purpose,
    meetingVideoLink,
    miroBoardLink,
    otherMediaLink,
    transcriptLink,
    mediaLink
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    const updatedInfo = { ...meetingInfo, [name]: value };
    setMeetingInfo(updatedInfo);
  };
  const handleSelection = (name: any, selectedNames: any) => {
    const updatedInfo = { ...meetingInfo, [name]: selectedNames };
    setMeetingInfo(updatedInfo);
  };

  // useEffect to call onUpdate whenever meetingInfo changes
  useEffect(() => {
    onUpdate(meetingInfo);
  }, [meetingInfo]);

  return (
    <>
      {myVariable.workgroup.preferred_template.meetingInfo.name == 1 && (<>
      <label className={styles['form-label']}>
        Name:
      </label>
      <input
        type="name"
        name="name"
        value={meetingInfo.name || ""}
        onChange={handleChange}
        className={styles['form-input']}
      />
      </>)}
      {myVariable.workgroup.preferred_template.meetingInfo.date == 1 && (<>
      {myVariable.summary?.meetingInfo?.date && (<label className={styles['form-label']}>Date:  (previous meeting {myVariable.summary.meetingInfo.date})</label>)}
      {!myVariable.summary?.meetingInfo?.date && (<label className={styles['form-label']}>Date: </label>)}
      <input
        type="date"
        name="date"
        value={meetingInfo.date || ""}
        onChange={handleChange}
        className={styles['form-input']}
      />
      </>)}
      <div className={styles.peoplediv}>
        {myVariable.workgroup.preferred_template.meetingInfo.host == 1 && (
        <div className={styles.people}>
          <label className={styles['form-label']}>
            Host:
          </label>
          <SelectNames 
            onSelect={(selectedNames: any) => handleSelection('host', selectedNames)} 
            initialValue={meetingInfo.host || ""} 
          />
        </div>)}
        {myVariable.workgroup.preferred_template.meetingInfo.documenter == 1 && (<div className={styles.people}>
          <label className={styles['form-label']}>
            Documenter:
          </label>
          <SelectNames 
            onSelect={(selectedNames: any) => handleSelection('documenter', selectedNames)} 
            initialValue={meetingInfo.documenter || ""} 
          />
        </div>)}  
      </div>
      {myVariable.workgroup.preferred_template.meetingInfo.peoplePresent == 1 && (<>
      <label className={styles['form-label']}>
        People present:
      </label>
      <SelectNames 
        onSelect={(selectedNames: any) => handleSelection('peoplePresent', selectedNames)} 
        initialValue={meetingInfo.peoplePresent || ""} 
      />
      </>)}
      {myVariable.workgroup.preferred_template.meetingInfo.purpose == 1 && (<>
      <label className={styles['form-label']}>
        Purpose:
      </label>
      <input
        type="text"
        name="purpose"
        value={meetingInfo.purpose || ""}
        onChange={handleChange}
        className={styles['form-input']}
      />
      </>)}
      {myVariable.workgroup.preferred_template.meetingInfo.meetingVideoLink == 1 && (<>
      <label className={styles['form-label']}>
        Meeting video (link):
      </label>
      <input
        type="text"
        name="meetingVideoLink"
        value={meetingInfo.meetingVideoLink || ""}
        onChange={handleChange}
        className={styles['form-input']}
      />
      </>)}
      {myVariable.workgroup.preferred_template.meetingInfo.miroBoardLink == 1 && (<>
      <label className={styles['form-label']}>
        Miro board (link):
      </label>
      <input
        type="text"
        name="miroBoardLink"
        value={meetingInfo.miroBoardLink || ""}
        onChange={handleChange}
        className={styles['form-input']}
      />
      </>)}
      {myVariable.workgroup.preferred_template.meetingInfo.otherMediaLink == 1 && (<>
      <label className={styles['form-label']}>
        Other media (link):
      </label>
      <input
        type="text"
        name="otherMediaLink"
        value={meetingInfo.otherMediaLink || ""}
        onChange={handleChange}
        className={styles['form-input']}
      />
      </>)}
      {myVariable.workgroup.preferred_template.meetingInfo.transcriptLink == 1 && (<>
      <label className={styles['form-label']}>
        Transcript (link):
      </label>
      <input
        type="text"
        name="transcriptLink"
        value={meetingInfo.transcriptLink || ""}
        onChange={handleChange}
        className={styles['form-input']}
      />
      </>)}
      {myVariable.workgroup.preferred_template.meetingInfo.mediaLink == 1 && (<>
      <label className={styles['form-label']}>
        Media (link):
      </label>
      <input
        type="text"
        name="mediaLink"
        value={meetingInfo.mediaLink || ""}
        onChange={handleChange}
        className={styles['form-input']}
      />
      </>)}
    </>
  );
};

export default CustomMeetingInfo;
