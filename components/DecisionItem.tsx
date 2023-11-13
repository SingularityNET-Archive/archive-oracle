import styles from '../styles/typea.module.css';

const DecisionItem = ({ item, itemIndex, handleUpdate, onRemove, agendaIndex, type }: any) => (
    <div className={styles['decision-item']} key={itemIndex}>
              <div className={styles['row-flex-start']}>
                <div className={styles['links-column-flex']}>
                  <label className={styles['form-label']}>
                    Decision Item {itemIndex + 1}
                  </label>
                  <input 
                    className={styles['form-input']}
                    type="text"
                    placeholder="Decision Item"
                    value={item.decision} 
                    onChange={(e) => handleUpdate('decision', e.target.value)}
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
                  >
                    <option value="affectsOnlyThisWorkgroup">Affects only this Workgroup</option>
                    <option value="affectsAllWorkgroups">Affects all Workgroups</option>
                  </select>
                </div>
                </div>
                <div className={styles['column-flex']}>
                  <label className={styles['form-label']}>
                    Rationale
                  </label>
                  <input 
                    className={styles['form-input']}
                    type="text"
                    placeholder="Rationale"
                    value={item.rationale} 
                    onChange={(e) => handleUpdate('rationale', e.target.value)}
                  />
                </div>
                <div className={styles['column-flex']}>
                  <label className={styles['form-label']}>
                    Opposing
                  </label>
                  <input 
                    className={styles['form-input']}
                    type="text"
                    placeholder="Opposing"
                    value={item.opposing} 
                    onChange={(e) => handleUpdate('opposing', e.target.value)}
                  />
                </div>
                {item.decision == '' && item.rationale == '' && (
                  <button className={styles['remove-button']} onClick={() => onRemove(type, agendaIndex, itemIndex)}>
                    Remove
                  </button>
                )}
            </div>
    );

export default DecisionItem;