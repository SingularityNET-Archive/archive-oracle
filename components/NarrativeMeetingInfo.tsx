import { useState, useEffect } from 'react';
import styles from '../styles/typea.module.css'; 
import { useMyVariable } from '../context/MyVariableContext';

type NarrativeMeetingInfoProps = {
  workgroup: string;
  onUpdate: (info: any) => void;
};

const NarrativeMeetingInfo: React.FC<NarrativeMeetingInfoProps> = ({ workgroup, onUpdate }) => {
  const { myVariable, setMyVariable } = useMyVariable();
  const initialMeetingInfo = myVariable?.summary?.meetingInfo || {
    host:'',
    documenter:'',
    peoplePresent: '',
    mediaLink: '',
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
        Media (link):
      </label>
      <input
        type="text"
        name="mediaLink"
        value={meetingInfo.mediaLink || ""}
        onChange={handleChange}
        className={styles['form-input']}
      />
    </>
  );
};

export default NarrativeMeetingInfo;
