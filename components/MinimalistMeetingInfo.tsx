import { useState, useEffect } from 'react';
import styles from '../styles/typea.module.css'; 
import { useMyVariable } from '../context/MyVariableContext';
import SelectNames from '../components/SelectNames'

type MinimalistMeetingInfoProps = {
  workgroup: string;
  onUpdate: (info: any) => void;
};

const MinimalistMeetingInfo: React.FC<MinimalistMeetingInfoProps> = ({ workgroup, onUpdate }) => {
  const { myVariable, setMyVariable } = useMyVariable();
  const {
    host = '',
    documenter = '',
    peoplePresent = ''
  } = myVariable?.summary?.meetingInfo || {};

  const [meetingInfo, setMeetingInfo] = useState({
    host,
    documenter,
    peoplePresent
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
      <div className={styles.peoplediv}>
        <div className={styles.people}>
          <label className={styles['form-label']}>
            Host:
          </label>
          <SelectNames 
            onSelect={(selectedNames: any) => handleSelection('host', selectedNames)} 
            initialValue={meetingInfo.host || ""} 
          />
        </div>
        <div className={styles.people}>
          <label className={styles['form-label']}>
            Documenter:
          </label>
          <SelectNames 
            onSelect={(selectedNames: any) => handleSelection('documenter', selectedNames)} 
            initialValue={meetingInfo.documenter || ""} 
          />
        </div>  
      </div>
      <label className={styles['form-label']}>
        People present:
      </label>
      <SelectNames 
        onSelect={(selectedNames: any) => handleSelection('peoplePresent', selectedNames)} 
        initialValue={meetingInfo.peoplePresent || ""} 
      />
    </>
  );
};

export default MinimalistMeetingInfo;
