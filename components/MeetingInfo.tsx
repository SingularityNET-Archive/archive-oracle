import { useState, useEffect } from 'react';
import styles from '../styles/typea.module.css'; 
import { useMyVariable } from '../context/MyVariableContext';

type MeetingInfoProps = {
  workgroup: string;
  onUpdate: (info: any) => void;
};

const MeetingInfo: React.FC<MeetingInfoProps> = ({ workgroup, onUpdate }) => {
  const { myVariable, setMyVariable } = useMyVariable();
  const initialMeetingInfo = myVariable && myVariable.summary && myVariable.summary.meetingInfo 
                           ? myVariable.summary.meetingInfo
                           : {
                               host:'',
                               documenter:'',
                               peoplePresent: '',
                               purpose: '',
                               meetingVideoLink: '',
                               miroBoardLink: '',
                               otherMediaLink: '',
                               transcriptLink: '',
                             };

  const [meetingInfo, setMeetingInfo] = useState(initialMeetingInfo);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    const updatedInfo = { ...meetingInfo, [name]: value };
    setMeetingInfo(updatedInfo);
  };

  // useEffect to call onUpdate whenever meetingInfo changes
  useEffect(() => {
    onUpdate(meetingInfo);
  }, [meetingInfo]);

  return (
    <>
      <div className={styles.peoplediv}>
        <div className={styles.people}>
          <label className={styles['form-label']}>
            Host:
          </label>
          <input
            type="text"
            name="host"
            value={meetingInfo.host || ""}
            onChange={handleChange}
            className={styles['form-input']}
          />
        </div>
        <div className={styles.people}>
          <label className={styles['form-label']}>
            Documenter:
          </label>
          <input
            type="text"
            name="documenter"
            value={meetingInfo.documenter || ""}
            onChange={handleChange}
            className={styles['form-input']}
          />
        </div>  
      </div>
      <label className={styles['form-label']}>
        People present (Comma separated):
      </label>
      <input
        type="text"
        name="peoplePresent"
        value={meetingInfo.peoplePresent || ""}
        onChange={handleChange}
        className={styles['form-input']}
      />
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
    </>
  );
};

export default MeetingInfo;
