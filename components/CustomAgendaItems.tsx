import { useState, useEffect } from 'react';
import { useMyVariable } from '../context/MyVariableContext';
import styles from '../styles/typea.module.css';
import SelectNames from '../components/SelectNames'

const CustomAgendaItems = ({onUpdate}: any) => {
    const { myVariable, setMyVariable } = useMyVariable();
    const firstAgendaItem = myVariable?.summary?.agendaItems?.[0] || {};
    const [mode, setMode] = useState(firstAgendaItem.mode || 'Narrative');
    const [narrative, setNarrative] = useState(firstAgendaItem.narrative || '');
    const [issues, setIssues] = useState(firstAgendaItem.issues || ['']);
    const initialAgendaItems = myVariable && myVariable.summary && myVariable.summary.agendaItems 
                           ? myVariable.summary.agendaItems.map((item: any) => ({
                               ...{
                                   agenda: "",
                                   status: "carry over",
                                   narrative: '',
                                   issues: [],
                                   actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }],
                                   decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
                                   discussionPoints: [""]
                               },
                               ...item
                             }))
                           : [{
                               agenda: "",
                               status: "carry over",
                               narrative: '',
                               issues: [],
                               actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }],
                               decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
                               discussionPoints: [""]
                             }];

  const [agendaItems, setAgendaItems] = useState(initialAgendaItems);
      
  useEffect(() => {
    onUpdate(agendaItems);
    //console.log("agendaItems", agendaItems)
  }, [agendaItems]);

  useEffect(() => {
    // Update local agenda items state when myVariable.summary.agendaItems changes
    const initialAgendaItems = myVariable.summary?.agendaItems?.map((item: any) => ({
      ...{
        agenda: "",
        status: "carry over",
        narrative: '',
        issues: [],
        actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }],
        decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
        discussionPoints: [""]
      },
      ...item
    })) || [{
      agenda: "",
      status: "carry over",
      narrative: '',
      issues: [],
      actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }],
      decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
      discussionPoints: [""]
    }];
  
    setAgendaItems(initialAgendaItems);
  }, [myVariable.summary?.agendaItems]);  

  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, { agenda: "", status: "carry over",  narrative: '', issues: [], actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }], decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }], discussionPoints: [""] }]);
  };

  const removeAgendaItem = (index: number) => {
    const newAgendaItems = [...agendaItems];
    newAgendaItems.splice(index, 1);
    setAgendaItems(newAgendaItems);
  };

  const addItem = (type: string, agendaIndex: number) => {
    const newAgendaItems: any = [...agendaItems];
    if (type === 'actionItems') {
      newAgendaItems[agendaIndex][type].push({ text: "", assignee: "", dueDate: "", status: "todo" });
    } else if (type === 'decisionItems') {  // Update here
      newAgendaItems[agendaIndex][type].push({ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" });
    } else if (type === 'issues') {  // Update here
      newAgendaItems[agendaIndex][type].push("");
    } else {
      newAgendaItems[agendaIndex][type].push("");
    }
    setAgendaItems(newAgendaItems);
  };
  

  const removeItem = (type: string, agendaIndex: number, itemIndex: number) => {
    const newAgendaItems: any = [...agendaItems];
    newAgendaItems[agendaIndex][type].splice(itemIndex, 1);
    setAgendaItems(newAgendaItems);
  };

  return (
    <div>
      {myVariable.workgroup.preferred_template.agendaItems[0].agenda == 1 && (<h1>Agenda Items</h1>)}
      {agendaItems.map((item: any, agendaIndex: any) => (
        <div key={agendaIndex} className={styles['agenda-item']}>
          {myVariable.workgroup.preferred_template.agendaItems[0].agenda == 1 && (
            <>
              <h2>Agenda item {agendaIndex + 1}</h2>
                <div className={styles['row-flex-start']}>
                  <div className={styles['agenda-title']}>
                  <label className={styles['form-label']}>
                    Agenda Title
                  </label>
                    <input 
                      className={styles['form-input']}
                      type="text"
                      placeholder="Agenda Item"
                      value={item.agenda}
                      onChange={(e) => {
                        const newAgenda = [...agendaItems];
                        newAgenda[agendaIndex].agenda = e.target.value;
                        setAgendaItems(newAgenda);
                      }}
                    />
                  </div>
                  <div className={styles['column-flex']}>
                    <label className={styles['form-label']}>
                      Status
                    </label>
                    <select
                      className={styles['form-select']}
                      value={item.status} 
                      onChange={(e) => {
                        const newAgenda = [...agendaItems];
                        newAgenda[agendaIndex].status = e.target.value;  
                        setAgendaItems(newAgenda);
                      }}
                      >
                      <option value="carry over">Carry Over</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
              </div>
            </>
          )}
          
          {myVariable.workgroup.preferred_template.agendaItems[0].narrative == 1 && (
            <>
            <h2>Narrative</h2>
            <div className={styles['action-item']}>
            <textarea
              className={styles['form-textarea']}
              placeholder="Describe what happened..."
              value={item.narrative}
              onChange={(e) => {
                const newAgendaItems = [...agendaItems];
                newAgendaItems[agendaIndex].narrative = e.target.value;
                setAgendaItems(newAgendaItems);
            }}
            />
            </div>
            </>
          )} 
          {myVariable.workgroup.preferred_template.agendaItems[0].issues == 1 && (
            <>
              <h3>Issues</h3>
              <div className={styles['action-item']}>    
                {item?.issues?.map((issue: any, issueIndex: any) => (
                  <div className={styles['column-flex']} key={issueIndex}>
                    <div className={styles['row-flex-start']}>
                      <div className={styles['links-column-flex']}>
                        <label className={styles['form-label']}>
                          Issue {issueIndex+1}
                        </label>
                        <input
                          className={styles['form-input']}
                          type="text"
                          placeholder="Issue"
                          value={issue}
                          onChange={(e) => {
                              const newAgenda = [...agendaItems];
                              newAgenda[agendaIndex].issues[issueIndex] = e.target.value;  
                              setAgendaItems(newAgenda);
                            }}
                        />
                      </div>
                      <div>
                        {issue == '' && (<button className={styles['remove-button']} type="button" onClick={() => removeItem('issues', agendaIndex, issueIndex)}>Remove Issue</button>)}
                      </div>
                    </div>
                  </div>
                ))}
                <button className={styles['add-button']} type="button" onClick={() => addItem('issues', agendaIndex)}>Add Issue</button>
              </div>
            </>
          )} 
          {myVariable.workgroup.preferred_template.agendaItems[0].actionItems == 1 && (<h3>Action items</h3>)}  
          {myVariable.workgroup.preferred_template.agendaItems[0].actionItems == 1 && item?.actionItems?.map((action: any, actionIndex: any) => (
            <div key={actionIndex} className={styles['action-item']}>
              <div className={styles['agenda-title']}>
                <label className={styles['form-label']}>
                  Action item {actionIndex+1}
                </label>
                <input 
                  className={styles['form-input']}
                  type="text"
                  placeholder="Action Item"
                  value={action.text} 
                  onChange={(e) => {
                    const newAgenda = [...agendaItems];
                    newAgenda[agendaIndex].actionItems[actionIndex].text = e.target.value;  
                    setAgendaItems(newAgenda);
                  }}
                />
              </div>
              <div className={styles['row-flex-start']}>
                <div className={styles['action-assignee-column-flex']}>
                  <label className={styles['form-label']}>
                    Assignee
                  </label>
                  <SelectNames 
                    onSelect={(selectedNames: string) => {
                      const newAgenda = [...agendaItems];
                      newAgenda[agendaIndex].actionItems[actionIndex].assignee = selectedNames;
                      setAgendaItems(newAgenda);
                    }}
                    initialValue={action.assignee}
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
                    value={action.dueDate}  
                    onChange={(e) => {
                      const newAgenda = [...agendaItems];
                      newAgenda[agendaIndex].actionItems[actionIndex].dueDate = e.target.value;  
                      setAgendaItems(newAgenda);
                    }}
                  />
                </div>
                <div className={styles['column-flex']}>
                  <label className={styles['form-label']}>
                    Status
                  </label>
                  <select
                  className={styles['form-select']}
                  value={action.status} 
                  onChange={(e) => {
                    const newAgenda = [...agendaItems];
                    newAgenda[agendaIndex].actionItems[actionIndex].status = e.target.value;  
                    setAgendaItems(newAgenda);
                  }}
                  >
                    <option value="todo">To do</option>
                    <option value="in progress">In Progress</option>
                    <option value="done">Done</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className={styles['remove-button-container']}>
                  {action.text == '' && action.assignee == '' && (<button className={styles['remove-button']} type="button" onClick={() => removeItem('actionItems', agendaIndex, actionIndex)}>Remove Action</button>)}
                </div>
              </div>
              
            </div>
          ))} 
          {myVariable.workgroup.preferred_template.agendaItems[0].actionItems == 1 && (<button className={styles['add-button']} type="button" onClick={() => addItem('actionItems', agendaIndex)}>Add Action</button>)}
          {myVariable.workgroup.preferred_template.agendaItems[0].decisionItems == 1 &&(<h3>Decisions</h3>)}
          {myVariable.workgroup.preferred_template.agendaItems[0].decisionItems == 1 && item?.decisionItems?.map((decision: any, decisionIndex: any) => (
            <div className={styles['decision-item']} key={decisionIndex}>
              <div className={styles['row-flex-start']}>
                <div className={styles['links-column-flex']}>
                  <label className={styles['form-label']}>
                    Decision Item {decisionIndex + 1}
                  </label>
                  <input 
                    className={styles['form-input']}
                    type="text"
                    placeholder="Decision Item"
                    value={decision.decision} 
                    onChange={(e) => {
                      const newAgenda = [...agendaItems];
                      newAgenda[agendaIndex].decisionItems[decisionIndex].decision = e.target.value; // Update here
                      setAgendaItems(newAgenda);
                    }}
                  />
                </div>
                <div className={styles['column-flex']}>
                  <label className={styles['form-label']}>
                    Who does this decision affect?
                  </label>
                  <select
                  className={styles['form-select']}
                  value={decision.effect} 
                  onChange={(e) => {
                    const newAgenda = [...agendaItems];
                    newAgenda[agendaIndex].decisionItems[decisionIndex].effect = e.target.value;  
                    setAgendaItems(newAgenda);
                  }}
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
                    value={decision.rationale} 
                    onChange={(e) => {
                      const newAgenda = [...agendaItems];
                      newAgenda[agendaIndex].decisionItems[decisionIndex].rationale = e.target.value; 
                      setAgendaItems(newAgenda);
                    }}
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
                    value={decision.opposing} 
                    onChange={(e) => {
                      const newAgenda = [...agendaItems];
                      newAgenda[agendaIndex].decisionItems[decisionIndex].opposing = e.target.value; 
                      setAgendaItems(newAgenda);
                    }}
                  />
                </div>
              
              {decision.rationale == '' && decision.decision == '' && (<button className={styles['remove-button']} type="button" onClick={() => removeItem('decisionItems', agendaIndex, decisionIndex)}>Remove Decision</button>)}
            </div>
          ))}
          {myVariable.workgroup.preferred_template.agendaItems[0].decisionItems == 1 && (<button className={styles['add-button']} type="button" onClick={() => addItem('decisionItems', agendaIndex)}>Add Decision</button>)}
          {myVariable.workgroup.preferred_template.agendaItems[0].discussionPoints == 1 && (<h3>Discussion Points</h3>)} 
        {myVariable.workgroup.preferred_template.agendaItems[0].discussionPoints == 1 && (<div className={styles['discussion-points']}>
          {myVariable.workgroup.preferred_template.agendaItems[0].discussionPoints == 1 && item.discussionPoints.map((point: any, pointIndex: any) => (
            <div key={pointIndex}>
              <div className={styles['row-flex-start']}>
                <div className={styles['links-column-flex']}>
                  <label className={styles['form-label']}>
                      Discussion Point {pointIndex + 1}
                  </label>
                  <input 
                    className={styles['form-input']}
                    type="text"
                    placeholder="Discussion Point"
                    value={point}
                    onChange={(e) => {
                      const newAgenda = [...agendaItems];
                      newAgenda[agendaIndex].discussionPoints[pointIndex] = e.target.value;
                      setAgendaItems(newAgenda);
                    }}
                  />
                </div> 
                <div>
                  {point == '' && (<button className={styles['remove-button']} type="button" onClick={() => removeItem('discussionPoints', agendaIndex, pointIndex)}>Remove Point</button>)}
                </div>
              </div>
            </div>
          ))}
        </div>)}
          {myVariable.workgroup.preferred_template.agendaItems[0].discussionPoints == 1 && (<button className={styles['add-button']} type="button" onClick={() => addItem('discussionPoints', agendaIndex)}>Add Discussion Point</button>)}
          {myVariable.workgroup.preferred_template.agendaItems[0].agenda == 1 && item.agenda == '' && (<button className={styles['remove-button']} type="button" onClick={() => removeAgendaItem(agendaIndex)}>Remove Agenda</button>)}
        </div>
      ))}
      {myVariable.workgroup.preferred_template.agendaItems[0].agenda == 1 && (<button className={styles['add-button']} type="button" onClick={addAgendaItem}>Add Agenda Item</button>)}
    </div>
  );
};

export default CustomAgendaItems;
