import styles from '../styles/typea.module.css';
import SelectNames from '../components/SelectNames'
import ActionItem from '../components/ActionItem';
import DecisionItem from '../components/DecisionItem';

const Narrative = ({ value, onChange }: any) => (
  <div className={styles['column-flex']}>
      <textarea
          className={styles['form-textarea']}
          placeholder="Describe the narrative..."
          value={value}
          onChange={(e) => onChange('narrative', e.target.value)}
      />
  </div>
);

// Generic input component for text fields
const TextInput: any = ({ label, placeholder, value, onChange, type, itemIndex }: any) => (
  <div className={styles['links-column-flex']}>
      <label className={styles['form-label']}>
          {label} {itemIndex + 1}
      </label>
      <input
          className={styles['form-input']}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
      />
  </div>
);

// Higher-order function to create common item structure
const createItem = (type: any, agendaIndex: any, itemIndex: any, item: any, handleUpdate: any, onRemove: any) => {
  const commonInput = (itemType: any, placeholder: any) => (
      <TextInput
          label={itemType}
          placeholder={placeholder}
          value={item}
          onChange={(e: any) => handleUpdate(itemType, e.target.value)}
          itemIndex={itemIndex}
      />
  );

  const removeButton = item === '' && (
      <button className={styles['remove-button']} onClick={() => onRemove(type, agendaIndex, itemIndex)}>
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
        if (type === 'issues' || type === 'discussionPoints' || type === 'learningPoints') {
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
        case 'learningPoints':
        case 'discussionPoints':
          return createItem(type, agendaIndex, itemIndex, item, handleUpdate, onRemove);
        case 'narrative':
          return <Narrative value={item} onChange={handleUpdate} />;
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