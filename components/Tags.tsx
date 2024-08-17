import React from 'react';
import { useMyVariable } from '../context/MyVariableContext';
import styles from '../styles/typea.module.css';
import SelectTags from '../components/SelectTags';

type TagsProps = {
  tags: { topicsCovered: string, emotions: string, other: string, gamesPlayed: string },
  setTags: React.Dispatch<React.SetStateAction<{ topicsCovered: string, emotions: string, other: string, gamesPlayed: string }>>
}

const Tags: React.FC<TagsProps> = ({ tags, setTags }) => {
  const { myVariable } = useMyVariable();
  // Set the initial state using myVariable.summary.tags
  const initialState = myVariable.summary && myVariable.summary.tags ? myVariable.summary.tags : {
    topicsCovered: "",
    emotions: "",
    other: "",
    gamesPlayed: ""
  };
  const [localTags, setLocalTags] = React.useState(initialState);

  React.useEffect(() => {
    if (myVariable.summary && myVariable.summary.tags) {
      setLocalTags(myVariable.summary.tags);
    }
  }, [myVariable.summary?.tags]);

  React.useEffect(() => {
    setTags(localTags);
  }, [localTags, setTags]);

  return (
    <div>
      <h3>Tags</h3>
      {myVariable.workgroup?.workgroup == 'Gamers Guild' && (<div className={styles['links-column-flex']}>
          <div>
            <label className={styles['form-label']}>
              Games Played
            </label>
            <SelectTags 
              onSelect={(selectedNames: string) => {
                setLocalTags({ ...localTags, gamesPlayed: selectedNames });
              }}
              initialValue={localTags.gamesPlayed}
              type="gamesPlayed" 
            />
          </div>
      </div>)}
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
        </div>
      </div>
      {!(myVariable.workgroup?.workgroup == 'WG Sync Call') && (<div className={styles['links-column-flex']}>
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
        </div>)}
    </div>
  );
};

export default Tags;
