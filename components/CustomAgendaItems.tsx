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
                                   actionItems: [{ text: "", assignee: "", dueDate: "" }],
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
                               actionItems: [{ text: "", assignee: "", dueDate: "" }],
                               decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
                               discussionPoints: [""]
                             }];

  const [agendaItems, setAgendaItems] = useState(initialAgendaItems);
      
  useEffect(() => {
    onUpdate(agendaItems);
  }, [agendaItems]);

  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, { agenda: "", status: "carry over",  narrative: '', issues: [], actionItems: [{ text: "", assignee: "", dueDate: "" }], decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }], discussionPoints: [""] }]);
  };

  const removeAgendaItem = (index: number) => {
    const newAgendaItems = [...agendaItems];
    newAgendaItems.splice(index, 1);
    setAgendaItems(newAgendaItems);
  };

  const addItem = (type: string, agendaIndex: number) => {
    const newAgendaItems: any = [...agendaItems];
    if (type === 'actionItems') {
      newAgendaItems[agendaIndex][type].push({ text: "", assignee: "", dueDate: "" });
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
      {myVariable.workgroup.preferred_template.agendaItems[0].agenda == 1 && (<h3>Agenda Items</h3>)}
      {agendaItems.map((item: any, agendaIndex: any) => (
        <div key={agendaIndex}>
          {myVariable.workgroup.preferred_template.agendaItems[0].agenda == 1 && (
            <>
            <h4>Agenda item {agendaIndex + 1}</h4>
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
            </>
          )}
          {myVariable.workgroup.preferred_template.agendaItems[0].agenda == 1 && (<label>
              <input 
                  type="radio"
                  name={`agendaStatus-${agendaIndex}`}
                  value="carry over"
                  checked={item.status === "carry over"}
                  onChange={(e) => {
                      const newAgendaItems = [...agendaItems];
                      newAgendaItems[agendaIndex].status = e.target.value;
                      setAgendaItems(newAgendaItems);
                  }}
              />
              Carry over
          </label>)}
          {myVariable.workgroup.preferred_template.agendaItems[0].agenda == 1 && (<label>
              <input 
                  type="radio"
                  name={`agendaStatus-${agendaIndex}`}
                  value="resolved"
                  checked={item.status === "resolved"}
                  onChange={(e) => {
                      const newAgendaItems = [...agendaItems];
                      newAgendaItems[agendaIndex].status = e.target.value;
                      setAgendaItems(newAgendaItems);
                  }}
              />
              Resolved
          </label>)}
          {myVariable.workgroup.preferred_template.agendaItems[0].narrative == 1 && (
            <>
            <h2>Narrative</h2>
            <textarea
              className={styles['form-input']}
              placeholder="Describe what happened..."
              value={item.narrative}
              onChange={(e) => {
                const newAgendaItems = [...agendaItems];
                newAgendaItems[agendaIndex].narrative = e.target.value;
                setAgendaItems(newAgendaItems);
            }}
            />
            </>
          )} 
          {myVariable.workgroup.preferred_template.agendaItems[0].issues == 1 && (
            <div>
              <h3>Issues</h3>
              {item?.issues?.map((issue: any, issueIndex: any) => (
                <div key={issueIndex}>
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
                 <button type="button" onClick={() => removeItem('issues', agendaIndex, issueIndex)}>Remove Issue</button>
                </div>
              ))}
              <button type="button" onClick={() => addItem('issues', agendaIndex)}>Add Issue</button>
            </div>
          )}   
          {myVariable.workgroup.preferred_template.agendaItems[0].actionItems == 1 && item?.actionItems?.map((action: any, actionIndex: any) => (
            <div key={actionIndex}>
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
          
              <SelectNames 
                onSelect={(selectedNames: string) => {
                  const newAgenda = [...agendaItems];
                  newAgenda[agendaIndex].actionItems[actionIndex].assignee = selectedNames;
                  setAgendaItems(newAgenda);
                }}
                initialValue={action.assignee}
              />
          
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
          
              <button type="button" onClick={() => removeItem('actionItems', agendaIndex, actionIndex)}>Remove Action</button>
            </div>
          ))}

          {myVariable.workgroup.preferred_template.agendaItems[0].actionItems == 1 && (<button type="button" onClick={() => addItem('actionItems', agendaIndex)}>Add Action</button>)}
          {myVariable.workgroup.preferred_template.agendaItems[0].decisionItems == 1 && item?.decisionItems?.map((decision: any, decisionIndex: any) => (
            <div key={decisionIndex}>
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
              <label>
                  <input 
                      type="radio"
                      name={`decisionEffect-${agendaIndex}-${decisionIndex}`}
                      value="affectsAllWorkgroups"
                      checked={decision.effect === "affectsAllWorkgroups"}
                      onChange={(e) => {
                          const newAgenda = [...agendaItems];
                          newAgenda[agendaIndex].decisionItems[decisionIndex].effect = e.target.value;
                          setAgendaItems(newAgenda);
                      }}
                  />
                  Affects all workgroups
              </label>
              <label>
                  <input 
                      type="radio"
                      name={`decisionEffect-${agendaIndex}-${decisionIndex}`}
                      value="affectsOnlyThisWorkgroup"
                      checked={decision.effect === "affectsOnlyThisWorkgroup"}
                      onChange={(e) => {
                          const newAgenda = [...agendaItems];
                          newAgenda[agendaIndex].decisionItems[decisionIndex].effect = e.target.value;
                          setAgendaItems(newAgenda);
                      }}
                  />
                  Affects only this workgroup
              </label>
              <button type="button" onClick={() => removeItem('decisionItems', agendaIndex, decisionIndex)}>Remove Decision</button>
            </div>
          ))}
          {myVariable.workgroup.preferred_template.agendaItems[0].decisionItems == 1 && (<button type="button" onClick={() => addItem('decisionItems', agendaIndex)}>Add Decision</button>)}

          {myVariable.workgroup.preferred_template.agendaItems[0].discussionPoints == 1 && item.discussionPoints.map((point: any, pointIndex: any) => (
            <div key={pointIndex}>
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
              <button type="button" onClick={() => removeItem('discussionPoints', agendaIndex, pointIndex)}>Remove Point</button>
            </div>
          ))}
          {myVariable.workgroup.preferred_template.agendaItems[0].discussionPoints == 1 && (<button type="button" onClick={() => addItem('discussionPoints', agendaIndex)}>Add Discussion Point</button>)}
          {myVariable.workgroup.preferred_template.agendaItems[0].agenda == 1 && (<button type="button" onClick={() => removeAgendaItem(agendaIndex)}>Remove Agenda</button>)}
        </div>
      ))}
      {myVariable.workgroup.preferred_template.agendaItems[0].agenda == 1 && (<button type="button" onClick={addAgendaItem}>Add Agenda Item</button>)}
    </div>
  );
};

export default CustomAgendaItems;