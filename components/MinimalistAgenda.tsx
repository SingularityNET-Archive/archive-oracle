import { useState, useEffect } from 'react';
import { useMyVariable } from '../context/MyVariableContext';
import styles from '../styles/typea.module.css';

const MinimalistAgenda = ({ onUpdate }: any) => {
  const { myVariable, setMyVariable } = useMyVariable();
  const [discussionPoints, setDiscussionPoints] = useState(myVariable?.summary?.agendaItems?.[0]?.discussionPoints || [""]);

  useEffect(() => {
    onUpdate([{discussionPoints: discussionPoints}]);
  }, [discussionPoints]);

  const addDiscussionPoint = () => {
    setDiscussionPoints([...discussionPoints, ""]);
  };

  const removeDiscussionPoint = (index: number) => {
    const newDiscussionPoints = [...discussionPoints];
    newDiscussionPoints.splice(index, 1);
    setDiscussionPoints(newDiscussionPoints);
  };

  return (
    <div>
      <h3>Discussion Points</h3>
      {discussionPoints.map((point: any, pointIndex: any) => (
        <div key={pointIndex}>
          <input
            className={styles['form-input']}
            type="text"
            placeholder="Discussion Point"
            value={point}
            onChange={(e) => {
              const newDiscussionPoints = [...discussionPoints];
              newDiscussionPoints[pointIndex] = e.target.value;
              setDiscussionPoints(newDiscussionPoints);
            }}
          />
          <button type="button" onClick={() => removeDiscussionPoint(pointIndex)}>Remove Point</button>
        </div>
      ))}
      <button type="button" onClick={addDiscussionPoint}>Add Point</button>
    </div>
  );
};

export default MinimalistAgenda;
