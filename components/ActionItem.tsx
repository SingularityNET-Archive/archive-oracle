import styles from '../styles/typea.module.css';
import SelectNames from '../components/SelectNames'

const ActionItem = ({ item, itemIndex, handleUpdate, onRemove, agendaIndex, type }: any) => (
    <div key={itemIndex} className={styles['action-item']}>
              <div className={styles['agenda-title']}>
                <label className={styles['form-label']}>
                  Action item {itemIndex+1}
                </label>
                <input 
                  className={styles['form-input']}
                  type="text"
                  placeholder="Action Item"
                  value={item.text || ""} 
                  onChange={(e) => handleUpdate('text', e.target.value)}
                />
              </div>
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
                  className={styles['form-input']}
                  type="date"
                  placeholder="Due Date"
                  value={item.dueDate || ""}  
                  onChange={(e) => handleUpdate('dueDate', e.target.value)}
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
                {item.text == '' && item.assignee == '' && (
                  <button className={styles['remove-button']} onClick={() => onRemove(type, agendaIndex, itemIndex)}>
                    Remove
                  </button>
                )}
              </div>
            </div>
    );

export default ActionItem;