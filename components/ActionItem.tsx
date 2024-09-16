import { useEffect, useRef } from 'react';
import styles from '../styles/actionitems.module.css';
import SelectNames from '../components/SelectNames';

const formatDate = (dateString: any) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
};

const parseDate = (dateString: any) => {
  const parts = dateString.match(/(\d{1,2}) (\w+) (\d{4})/);
  if (!parts) return "";

  const day = parts[1];
  const month = new Date(`${parts[2]} 1 2021`).getMonth() + 1;
  const year = parts[3];

  return `${year}-${month.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const ActionItem = ({ item, itemIndex, handleUpdate, onRemove, agendaIndex, type }: any) => {
  const actionRef = useRef<HTMLTextAreaElement>(null);

  // Function to adjust height of the textarea
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
    }
  };

  // Auto-resize when content changes
  useEffect(() => {
    adjustTextareaHeight(actionRef.current);
  }, [item.text]);

  return (
    <div key={itemIndex} className={styles['action-item']}>
      <div className={styles['agenda-title']}>
        <label className={styles['form-label']}>
          Action item {itemIndex + 1}
        </label>
        <textarea
          ref={actionRef}
          className={styles['form-input']}
          placeholder="Action Item"
          value={item.text || ""}
          onChange={(e) => {
            handleUpdate('text', e.target.value);
            adjustTextareaHeight(actionRef.current);
          }}
          autoComplete="off"
        />
      </div>
      <div className={styles['row-flex-space-between']}>
        <div className={styles['row-flex-start']}>
          <div className={styles['action-assignee-column-flex']}>
            <label className={styles['form-label']}>
              Assignee
            </label>
            <SelectNames
              onSelect={(selectedNames) => handleUpdate('assignee', selectedNames)}
              initialValue={item.assignee}
            />
          </div>
          <div className={styles['column-flex']}>
            <label className={styles['form-label']}>
              Due Date
            </label>
            <input
              className={styles['form-select']}
              type="date"
              placeholder="Due Date"
              value={parseDate(item.dueDate || "")}
              onChange={(e) => handleUpdate('dueDate', formatDate(e.target.value))}
            />
          </div>
          <div className={styles['column-flex']}>
            <label className={styles['form-label']}>
              Status
            </label>
            <select
              className={styles['form-select']}
              value={item.status}
              onChange={(e) => handleUpdate('status', e.target.value)}
            >
              <option value="todo">To do</option>
              <option value="in progress">In Progress</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div>
          <button type="button" className={styles['remove-button']} onClick={() => onRemove(type, agendaIndex, itemIndex)}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionItem;
