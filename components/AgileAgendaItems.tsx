import { useState, useEffect } from 'react';
import { useMyVariable } from '../context/MyVariableContext';
import styles from '../styles/typea.module.css';
import SelectNames from '../components/SelectNames'
import Item from '../components/Item';

const AgileAgendaItems = ({onUpdate}: any) => {
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
                                   narrative: "",
                                   issues: [""],
                                   actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }],
                                   decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
                                   discussionPoints: [""],
                                   learningPoints: [""]
                               },
                               ...item
                             }))
                           : [{
                               agenda: "",
                               status: "carry over",
                               narrative: "",
                               issues: [""],
                               actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }],
                               decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
                               discussionPoints: [""],
                               learningPoints: [""]
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
        narrative: "",
        issues: [""],
        actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }],
        decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
        discussionPoints: [""],
        learningPoints: [""]
      },
      ...item
    }))
     || [{
      agenda: "",
      status: "carry over",
      narrative: "",
      issues: [""],
      actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }],
      decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
      discussionPoints: [""],
      learningPoints: [""]
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
    } else if (type === 'issues' || type === 'discussionPoints' || type === 'learningPoints') {  // Update here
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

  const handleItemUpdate = (type: any, agendaIdx: any, itemIdx: any, updatedItem: any) => {
    setAgendaItems((prevAgendaItems: any) => {
      // Deep copy the current agenda items
      const newAgendaItems = JSON.parse(JSON.stringify(prevAgendaItems));
  
      // Make sure the type is valid and exists in the current item
      if(newAgendaItems[agendaIdx] && newAgendaItems[agendaIdx][type]) {
        // Update the specific item
        newAgendaItems[agendaIdx][type][itemIdx] = updatedItem;
      }
  
      return newAgendaItems;
    });
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
            <h3>Narrative</h3>
            <div className={styles['action-item']}> 
            <Item
                type="narrative"
                item={item.narrative}
                agendaIndex={agendaIndex}
                itemIndex={0} 
                onUpdate={(agendaIdx: any, itemIdx: any, updatedItem: any) => handleItemUpdate('narrative', agendaIdx, itemIdx, updatedItem)}
                onRemove={removeItem}
            />
            </div>
            </>
          )} 
          {myVariable.workgroup.preferred_template.agendaItems[0].issues == 1 && (
            <>
              <h3>Issues</h3>
              <div className={styles['action-item']}>    
                {item?.issues?.map((issue: any, issueIndex: any) => (
                  <Item
                  key={issueIndex}
                  type="issues"
                  item={issue}
                  agendaIndex={agendaIndex}
                  itemIndex={issueIndex}
                  onUpdate={(agendaIdx: any, itemIdx: any, updatedItem: any) => handleItemUpdate('issues', agendaIdx, itemIdx, updatedItem)}
                  onRemove={removeItem}
                />
                ))}
                <button className={styles['add-button']} type="button" onClick={() => addItem('issues', agendaIndex)}>Add Issue</button>
              </div>
            </>
          )} 
          {myVariable.workgroup.preferred_template.agendaItems[0].actionItems == 1 && (<h3>Action items</h3>)}  
          {myVariable.workgroup.preferred_template.agendaItems[0].actionItems == 1 && item?.actionItems?.map((action: any, actionIndex: any) => ( 
            <Item
              key={actionIndex}
              type="actionItems"
              item={action}
              agendaIndex={agendaIndex}
              itemIndex={actionIndex}
              onUpdate={(agendaIdx: any, itemIdx: any, updatedItem: any) => handleItemUpdate('actionItems', agendaIdx, itemIdx, updatedItem)}
              onRemove={removeItem}
            />
          ))} 
          {myVariable.workgroup.preferred_template.agendaItems[0].actionItems == 1 && (<button className={styles['add-button']} type="button" onClick={() => addItem('actionItems', agendaIndex)}>Add Action</button>)}
          {myVariable.workgroup.preferred_template.agendaItems[0].decisionItems == 1 &&(<h3>Decisions</h3>)}
          {myVariable.workgroup.preferred_template.agendaItems[0].decisionItems == 1 && item?.decisionItems?.map((decision: any, decisionIndex: any) => (
            <Item
            key={decisionIndex}
            type="decisionItems"
            item={decision}
            agendaIndex={agendaIndex}
            itemIndex={decisionIndex}
            onUpdate={(agendaIdx: any, itemIdx: any, updatedItem: any) => handleItemUpdate('decisionItems', agendaIdx, itemIdx, updatedItem)}
            onRemove={removeItem}
          />
          ))}
          {myVariable.workgroup.preferred_template.agendaItems[0].decisionItems == 1 && (<button className={styles['add-button']} type="button" onClick={() => addItem('decisionItems', agendaIndex)}>Add Decision</button>)}
          {myVariable.workgroup.preferred_template.agendaItems[0].discussionPoints == 1 && (<h3>Discussion Points</h3>)} 
          {myVariable.workgroup.preferred_template.agendaItems[0].discussionPoints == 1 && (<div className={styles['discussion-points']}>
            {myVariable.workgroup.preferred_template.agendaItems[0].discussionPoints == 1 && item.discussionPoints.map((point: any, pointIndex: any) => (
              <Item
                  key={pointIndex}
                  type="discussionPoints"
                  item={point}
                  agendaIndex={agendaIndex}
                  itemIndex={pointIndex}
                  onUpdate={(agendaIdx: any, itemIdx: any, updatedItem: any) => handleItemUpdate('discussionPoints', agendaIdx, itemIdx, updatedItem)}
                  onRemove={removeItem}
              />
            ))}
          </div>)}
          {myVariable.workgroup.preferred_template.agendaItems[0].discussionPoints == 1 && (<button className={styles['add-button']} type="button" onClick={() => addItem('discussionPoints', agendaIndex)}>Add Discussion Point</button>)}
          {myVariable.workgroup.preferred_template.agendaItems[0].learningPoints == 1 && (<h3>Learning Points</h3>)} 
          {myVariable.workgroup.preferred_template.agendaItems[0].learningPoints == 1 && (<div className={styles['discussion-points']}>
            {myVariable.workgroup.preferred_template.agendaItems[0].learningPoints == 1 && item.learningPoints.map((point: any, pointIndex: any) => (
              <Item
                  key={pointIndex}
                  type="learningPoints"
                  item={point}
                  agendaIndex={agendaIndex}
                  itemIndex={pointIndex}
                  onUpdate={(agendaIdx: any, itemIdx: any, updatedItem: any) => handleItemUpdate('learningPoints', agendaIdx, itemIdx, updatedItem)}
                  onRemove={removeItem}
              />
            ))}
          </div>)}
          {myVariable.workgroup.preferred_template.agendaItems[0].learningPoints == 1 && (<button className={styles['add-button']} type="button" onClick={() => addItem('learningPoints', agendaIndex)}>Add Learning Point</button>)}
          {myVariable.workgroup.preferred_template.agendaItems[0].agenda == 1 && item.agenda == '' && (<button className={styles['remove-button']} type="button" onClick={() => removeAgendaItem(agendaIndex)}>Remove Agenda</button>)}
        </div>
      ))}
      {myVariable.workgroup.preferred_template.agendaItems[0].agenda == 1 && (<button className={styles['add-button']} type="button" onClick={addAgendaItem}>Add Agenda Item</button>)}
    </div>
  );
};

export default AgileAgendaItems;
