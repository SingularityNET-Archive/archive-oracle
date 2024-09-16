import { useEffect, useRef } from 'react';
import styles from '../styles/typea.module.css';

const DecisionItem = ({ item, itemIndex, handleUpdate, onRemove, agendaIndex, type }: any) => {
  const decisionRef = useRef<HTMLTextAreaElement>(null);
  const rationaleRef = useRef<HTMLTextAreaElement>(null);
  const opposingRef = useRef<HTMLTextAreaElement>(null);

  // Function to adjust height of the textarea
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
    }
  };

  // Auto-resize when content changes
  useEffect(() => {
    adjustTextareaHeight(decisionRef.current);
    adjustTextareaHeight(rationaleRef.current);
    adjustTextareaHeight(opposingRef.current);
  }, [item.decision, item.rationale, item.opposing]);

  return (
    <div className={styles['decision-item']} key={itemIndex}>
      <div className={styles['row-flex-start']}>
        <div className={styles['links-column-flex']}>
          <label className={styles['form-label']}>
            Decision Item {itemIndex + 1}
          </label>
          <textarea
            ref={decisionRef}
            className={styles['form-input']}
            placeholder="Decision Item"
            value={item.decision || ""}
            onChange={(e) => {
              handleUpdate('decision', e.target.value);
              adjustTextareaHeight(decisionRef.current);
            }}
            autoComplete="off"
            title="Please provide details on the decision that is being made"
          />
        </div>
        <div className={styles['column-flex']}>
          <label className={styles['form-label']}>
            Who does this decision affect?
          </label>
          <select
            className={styles['form-select']}
            value={item.effect}
            onChange={(e) => handleUpdate('effect', e.target.value)}
            title="Please select who this decision will affect"
          >
            <option value="" disabled>Please select</option>
            <option value="affectsOnlyThisWorkgroup">Affects only this Workgroup</option>
            <option value="mayAffectOtherPeople">May affect other people</option>
          </select>
        </div>
      </div>
      <div className={styles['column-flex']}>
        <label className={styles['form-label']}>
          Rationale (Optional)
        </label>
        <textarea
          ref={rationaleRef}
          className={styles['form-input']}
          placeholder="Rationale"
          value={item.rationale || ""}
          onChange={(e) => {
            handleUpdate('rationale', e.target.value);
            adjustTextareaHeight(rationaleRef.current);
          }}
          autoComplete="off"
          title="Please provide the rationale for making this decision"
        />
      </div>
      <div className={styles['row-flex-start']}>
        <div className={styles['links-column-flex']}>
          <label className={styles['form-label']}>
            Opposing arguments (Optional)
          </label>
          <textarea
            ref={opposingRef}
            className={styles['form-input']}
            placeholder="Opposing"
            value={item.opposing || ""}
            onChange={(e) => {
              handleUpdate('opposing', e.target.value);
              adjustTextareaHeight(opposingRef.current);
            }}
            autoComplete="off"
            title="Please provide any opposing arguments"
          />
        </div>
        <div className={styles['column-flex']}>
          <button type="button" className={styles['remove-button']} onClick={() => onRemove(type, agendaIndex, itemIndex)}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default DecisionItem;
