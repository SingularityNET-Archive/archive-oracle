import { useState, useEffect } from 'react';
import styles from '../styles/timestampedVideo.module.css';

type TimestampedVideoProps = {
  onUpdate: (videoData: any) => void;
  initialData?: {
    url: string;
    intro: string;
    timestamps: string; 
  };
};

const TimestampedVideo: React.FC<TimestampedVideoProps> = ({ onUpdate, initialData }) => {
  const [videoData, setVideoData] = useState({
    url: initialData?.url || '',
    intro: initialData?.intro || '',
    timestamps: initialData?.timestamps || '',
  });

  useEffect(() => {
    // Update videoData when initialData changes
    setVideoData({
      url: initialData?.url || '',
      intro: initialData?.intro || '',
      timestamps: initialData?.timestamps || '',
    });
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVideoData((prevVideoData: any) => {
      const updatedVideoData = { ...prevVideoData, [name]: value };
      if (prevVideoData[name] !== value) {
        setTimeout(() => onUpdate(updatedVideoData), 0); // Delay the onUpdate call
      }
      return updatedVideoData;
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <label className={styles.label}>Video URL:</label>
        <input
          className={styles.input}
          type="text"
          name="url"
          value={videoData.url}
          onChange={handleChange}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Video description (Optional):</label>
        <textarea
          className={styles.textarea}
          name="intro"
          value={videoData.intro}
          onChange={handleChange}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Timestamps:</label>
        <textarea
          className={styles.textarea}
          name="timestamps"
          value={videoData.timestamps}
          onChange={handleChange}
          placeholder="Paste timestamps here"
        />
      </div>
    </div>
  );
};

export default TimestampedVideo;
