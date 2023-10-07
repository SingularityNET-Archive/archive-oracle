import { useState, useEffect } from 'react';

const MinimalistAgenda = ({ onUpdate }: any) => {
  const [discussionPoints, setDiscussionPoints] = useState([""]);

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
      {discussionPoints.map((point, pointIndex) => (
        <div key={pointIndex}>
          <input
            type="text"
            placeholder="Discussion Point"
            value={point}
            onChange={(e) => {
              const newDiscussionPoints = [...discussionPoints];
              newDiscussionPoints[pointIndex] = e.target.value;
              setDiscussionPoints(newDiscussionPoints);
            }}
          />
          <button onClick={() => removeDiscussionPoint(pointIndex)}>Remove Point</button>
        </div>
      ))}
      <button onClick={addDiscussionPoint}>Add Point</button>
    </div>
  );
};

export default MinimalistAgenda;
