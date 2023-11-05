import React from 'react';
import { useMyVariable } from '../context/MyVariableContext';
import styles from '../styles/typea.module.css';
import SelectTags from '../components/SelectTags';

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
      <div className={styles['row-flex-start']}>
        <div className={styles['links-column-flex']}>
        <div>
            <label className={styles['form-label']}>
            Topics Covered
            </label>
            <SelectTags 
              onSelect={(selectedNames: string) => {
                setLocalTags({ ...localTags, topicsCovered: selectedNames });
              }}
              initialValue={localTags.topicsCovered}
              type="topicsCovered" 
            />
          </div>
          <div>
            <label className={styles['form-label']}>
              References
            </label>
            <SelectTags 
              onSelect={(selectedNames: string) => {
                setLocalTags({ ...localTags, references: selectedNames });
              }}
              initialValue={localTags.references}
              type="references" 
            />
          </div>
        </div>
        <div className={styles['links-column-flex']}>
          <div>
            <label className={styles['form-label']}>
              Emotions
            </label>
            <SelectTags 
              onSelect={(selectedNames: string) => {
                setLocalTags({ ...localTags, emotions: selectedNames });
              }}
              initialValue={localTags.emotions}
              type="emotions" 
            />
          </div>
          <div>
            <label className={styles['form-label']}>
              Other / General
            </label>
            <SelectTags 
              onSelect={(selectedNames: string) => {
                setLocalTags({ ...localTags, other: selectedNames });
              }}
              initialValue={localTags.other}
              type="other" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tags;
