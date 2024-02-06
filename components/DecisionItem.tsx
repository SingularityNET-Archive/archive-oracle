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
                    value={item.decision || ""} 
                    onChange={(e) => handleUpdate('decision', e.target.value)}
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
                  <input 
                    className={styles['form-input']}
                    type="text"
                    placeholder="Rationale"
                    value={item.rationale || ""} 
                    onChange={(e) => handleUpdate('rationale', e.target.value)}
                    autoComplete="off"
                    title="Please provide the rationale for making this decision"
                  />
                </div>
                <div className={styles['row-flex-start']}>
                  <div className={styles['links-column-flex']}>
                    <label className={styles['form-label']}>
                      Opposing arguments (Optional)
                    </label>
                    <input 
                      className={styles['form-input']}
                      type="text"
                      placeholder="Opposing"
                      value={item.opposing || ""} 
                      onChange={(e) => handleUpdate('opposing', e.target.value)}
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

export default DecisionItem;