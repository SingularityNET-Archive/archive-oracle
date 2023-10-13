import React from 'react';
import { useMyVariable } from '../context/MyVariableContext';
import styles from '../styles/typea.module.css';

type TagsProps = {
  tags: { topicsCovered: string, references: string, emotions: string, other: string },
  setTags: React.Dispatch<React.SetStateAction<{ topicsCovered: string, references: string, emotions: string, other: string }>>
}

const Tags: React.FC<TagsProps> = ({ tags, setTags }) => {
  const { myVariable } = useMyVariable();

  // Set the initial state using myVariable.summary.tags
  const initialState = myVariable.summary && myVariable.summary.tags ? myVariable.summary.tags : {
    topicsCovered: "",
    references: "",
    emotions: "",
    other: ""
  };
  const [localTags, setLocalTags] = React.useState(initialState);

  React.useEffect(() => {
    setTags(localTags);
  }, [localTags, setTags]);

  return (
    <div>
      <h3>Tags</h3>
      <input 
        className={styles['form-input']}
        type="text"
        placeholder="Topics Covered"
        value={localTags.topicsCovered}
        onChange={(e) => setLocalTags({ ...localTags, topicsCovered: e.target.value })}
      />
      <input 
        className={styles['form-input']}
        type="text"
        placeholder="References"
        value={localTags.references}
        onChange={(e) => setLocalTags({ ...localTags, references: e.target.value })}
      />
      <input 
        className={styles['form-input']}
        type="text"
        placeholder="Emotions"
        value={localTags.emotions}
        onChange={(e) => setLocalTags({ ...localTags, emotions: e.target.value })}
      />
      <input 
        className={styles['form-input']}
        type="text"
        placeholder="Other / General"
        value={localTags.other}
        onChange={(e) => setLocalTags({ ...localTags, other: e.target.value })}
      />
    </div>
  );
};

export default Tags;
