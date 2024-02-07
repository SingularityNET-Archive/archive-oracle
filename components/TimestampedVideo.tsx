import { useState, useEffect } from 'react';
import styles from '../styles/timestampedVideo.module.css';

type TimestampedVideoProps = {
    onUpdate: (videoData: any) => void;
    initialData?: {
      url: string;
      intro: string;
      timestamps: { title: string; timestamp: string }[];
    };
  };
  

const TimestampedVideo: React.FC<TimestampedVideoProps> = ({ onUpdate, initialData }) => {
  const [videoData, setVideoData] = useState({
    url: initialData?.url || '',
    intro: initialData?.intro || '',
    timestamps: initialData?.timestamps || [{ title: '', timestamp: '' }],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number | null) => {
    const { name, value } = e.target;
    if (index !== null) {
      // Handle change for timestamps
      const updatedTimestamps = [...videoData.timestamps];
      updatedTimestamps[index] = { ...updatedTimestamps[index], [name]: value };
      setVideoData({ ...videoData, timestamps: updatedTimestamps });
    } else {
      // Handle change for URL and Intro
      setVideoData({ ...videoData, [name]: value });
    }
  };

  const addTimestamp = () => {
    setVideoData({
      ...videoData,
      timestamps: [...videoData.timestamps, { title: '', timestamp: '' }],
    });
  };

  const removeTimestamp = (index: number) => {
    const filteredTimestamps = videoData.timestamps.filter((_, i) => i !== index);
    setVideoData({ ...videoData, timestamps: filteredTimestamps });
  };

  // useEffect hook to call onUpdate whenever videoData changes
  useEffect(() => {
    onUpdate(videoData); // Call onUpdate with the current state of videoData
  }, [videoData, onUpdate]); // Add videoData and onUpdate to the dependency array

  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <label>Video URL:</label>
        <input
          type="text"
          name="url"
          value={videoData.url}
          onChange={(e) => handleChange(e, null)}
        />
      </div>
    <div className={styles.field}>
        <label>Introduction:</label>
        <textarea
            name="intro"
            value={videoData.intro}
            onChange={(e) => handleChange(e, null)}
        />
    </div>
      <label>Timestamps:</label>
      {videoData.timestamps.map((item, index) => (
        <div key={index} className={styles.timestampField}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={item.title}
            onChange={(e) => handleChange(e, index)}
          />
          <input
            type="text"
            name="timestamp"
            placeholder="hh:mm:ss"
            value={item.timestamp}
            onChange={(e) => handleChange(e, index)}
            pattern="(?:\d{1,2}:)?[0-5]?\d:[0-5]\d|\d{1,2}"
            title="Timestamp format: ss or mm:ss or hh:mm:ss"
          />
          <button type="button" onClick={() => removeTimestamp(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={addTimestamp}>Add Timestamp</button>
    </div>
  );
};

export default TimestampedVideo;
