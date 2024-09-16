import { useRef, useEffect } from 'react';
import styles from '../styles/items.module.css';
import ActionItem from '../components/ActionItem';
import DecisionItem from '../components/DecisionItem';

const TextAreaInput = ({ value, onChange, placeholder, type }: any) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Define titles for different types
  const titles: any = {
    narrative: 'Meeting narrative: Try to make your narrative concise and information-dense, and avoid filler',
    townHallUpdates: 'Write down Weekly Town Hall updates',
    gameRules: 'Write down Game Rules',
    townHallSummary: 'Write down Weekly Town Hall Summary',
    discussion: 'Discussion: Note the main points raised. Try to make your narrative concise and information-dense, and avoid filler',
  };

  const title = titles[type] || 'Meeting narrative: Try to make your narrative concise and information-dense, and avoid filler';

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
    }
  };

  useEffect(() => {
    adjustTextareaHeight(textAreaRef.current);
  }, [value]);

  return (
    <div className={styles['column-flex']}>
        <textarea
            ref={textAreaRef}
            className={styles['form-textarea']}
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              onChange(type, e.target.value);
              adjustTextareaHeight(textAreaRef.current);
            }}
            autoComplete="off"
            title={title}
        />
    </div>
  );
};

// Generic input component for text fields
const TextInput: any = ({ label, placeholder, value, onChange, type, itemIndex }: any) => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
    }
  };

  useEffect(() => {
    adjustTextareaHeight(textInputRef.current);
  }, [value]);

  return (
    <div className={styles['links-column-flex']}>
      <label className={styles['form-label']}>
          {label}
      </label>
      <textarea
          ref={textInputRef}
          className={styles['form-input']}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e);
            adjustTextareaHeight(textInputRef.current);
          }}
          autoComplete="off"
      />
    </div>
  );
};

function getOrdinal(n: any) {
  const ordinals = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (ordinals[(v - 20) % 10] || ordinals[v] || ordinals[0]);
}

const createItem = (type: any, agendaIndex: any, itemIndex: any, item: any, handleUpdate: any, onRemove: any) => {
  let label = '';
  if (type === 'leaderboard') { label = (getOrdinal(itemIndex + 1)) + ' place'; }
  else if (type === 'meetingTopics') { label = 'Item ' + (itemIndex + 1); }
  else if (type === 'discussionPoints') { label = 'Discussion Point ' + (itemIndex + 1); }
  else if (type === 'learningPoints') { label = 'Learning Point ' + (itemIndex + 1); }
  else if (type === 'issues') { label = 'Issue ' + (itemIndex + 1); }
  else { label = type + ' ' + (itemIndex + 1); }

  const commonInput = (itemType: any, placeholder: any) => (
      <TextInput
          label={label}
          placeholder={placeholder}
          value={item}
          onChange={(e: any) => handleUpdate(itemType, e.target.value)}
          itemIndex={itemIndex}
      />
  );

  const removeButton = item === '' && (
      <button type="button" className={styles['remove-button']} onClick={() => onRemove(type, agendaIndex, itemIndex)}>
          Remove
      </button>
  );

  return (
      <div className={styles['row-flex-start']}>
          {commonInput(type, `${type.charAt(0).toUpperCase() + type.slice(1)}`)}
          <div>{removeButton}</div>
      </div>
  );
};

const Item = ({ type, item, agendaIndex, itemIndex, onUpdate, onRemove }: any) => {
    const handleUpdate = (key: any, value: any) => {
        if (type === 'meetingTopics' || type === 'issues' || type === 'discussionPoints' || type === 'learningPoints' || type === 'leaderboard') {
            onUpdate(agendaIndex, itemIndex, value);
        } else {
            onUpdate(agendaIndex, itemIndex, { ...item, [key]: value });
        }
    };

    const renderInputs = () => {
      switch (type) {
        case 'actionItems':
          return <ActionItem 
                      item={item} 
                      itemIndex={itemIndex} 
                      handleUpdate={handleUpdate} 
                      onRemove={onRemove} 
                      agendaIndex={agendaIndex} 
                      type={type} 
                  />;
        case 'decisionItems':
          return <DecisionItem 
                      item={item} 
                      itemIndex={itemIndex} 
                      handleUpdate={handleUpdate} 
                      onRemove={onRemove} 
                      agendaIndex={agendaIndex} 
                      type={type} 
                  />;
        case 'issues':
        case 'meetingTopics':
        case 'leaderboard':
        case 'learningPoints':
        case 'discussionPoints':
          return createItem(type, agendaIndex, itemIndex, item, handleUpdate, onRemove);
        case 'townHallUpdates':
        case 'narrative':
        case 'townHallSummary':
        case 'gameRules':
        case 'discussion':
          return <TextAreaInput 
                     type={type} 
                     value={item} 
                     onChange={handleUpdate} 
                     placeholder={`Please enter the ${type}`}
                 />;
        default:
          return null;
      }
    };
  
    return (
        <div className={styles['item-container']}>
          {renderInputs()}
        </div>
    );
};
  
export default Item;
