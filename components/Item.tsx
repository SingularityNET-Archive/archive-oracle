import styles from '../styles/typea.module.css';
import ActionItem from '../components/ActionItem';
import DecisionItem from '../components/DecisionItem';

const TextAreaInput = ({ value, onChange, placeholder, type }: any) => {
  // Define titles for different types
  const titles: any = {
    narrative: 'Meeting narrative: Try to make your narrative concise and information-dense, and avoid filler',
    townHallUpdates: 'Write down Weekly Town Hall updates',
    gameRules: 'Write down Game Rules'
  };

  // Determine the title based on the type
  const title = titles[type] || 'Meeting narrative: Try to make your narrative concise and information-dense, and avoid filler';

  return (
    <div className={styles['column-flex']}>
        <textarea
            className={styles['form-textarea']}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(type, e.target.value)}
            autoComplete="off"
            title={title}
        />
    </div>
  );
};

// Generic input component for text fields
const TextInput: any = ({ label, placeholder, value, onChange, type, itemIndex }: any) => (
  <div className={styles['links-column-flex']}>
      <label className={styles['form-label']}>
          {label}
      </label>
      <input
          className={styles['form-input']}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
      />
  </div>
);

function getOrdinal(n: any) {
  const ordinals = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (ordinals[(v - 20) % 10] || ordinals[v] || ordinals[0]);
}
// Higher-order function to create common item structure
const createItem = (type: any, agendaIndex: any, itemIndex: any, item: any, handleUpdate: any, onRemove: any) => {
  let label = ''
  if (type === 'leaderboard') { label = (getOrdinal(itemIndex + 1)) + ' place' }
  else if (type === 'discussionPoints') { label = 'Discussion Point ' + (itemIndex + 1)}
  else if (type === 'learningPoints') { label = 'Learning Point ' + (itemIndex + 1)}
  else if (type === 'issues') { label = 'Item ' + (itemIndex + 1)}
  else { label = type + ' ' + (itemIndex + 1)}
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
    // Determine what inputs to render based on item type
    const handleUpdate = (key: any, value: any) => {
        if (type === 'issues' || type === 'discussionPoints' || type === 'learningPoints' || type === 'leaderboard') {
            // For 'issues', since it's an array of strings, update directly
            onUpdate(agendaIndex, itemIndex, value);
        } else {
            // For other types, use the existing logic
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
        case 'leaderboard':
        case 'learningPoints':
        case 'discussionPoints':
          return createItem(type, agendaIndex, itemIndex, item, handleUpdate, onRemove);
        case 'townHallUpdates':
        case 'narrative':
        case 'gameRules':
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