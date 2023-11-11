import { useState, useEffect } from 'react';
import { useMyVariable } from '../context/MyVariableContext';
import styles from '../styles/typea.module.css';
import SelectNames from '../components/SelectNames'
import Item from '../components/Item';
import { getDefaultAgendaItem } from '../utils/getDefaultAgendaItem';

const AgileAgendaItems = ({onUpdate}: any) => {
    const { myVariable, setMyVariable } = useMyVariable();
    const firstAgendaItem = myVariable?.summary?.agendaItems?.[0] || {};
    const [mode, setMode] = useState(firstAgendaItem.mode || 'Narrative');
    const [narrative, setNarrative] = useState(firstAgendaItem.narrative || '');
    const [issues, setIssues] = useState(firstAgendaItem.issues || ['']);
    const initialAgendaItems = myVariable?.summary?.agendaItems?.map((item: any) => ({
      ...getDefaultAgendaItem(),
      ...item
    })) || [getDefaultAgendaItem()];

  const [agendaItems, setAgendaItems] = useState(initialAgendaItems);
      
  useEffect(() => {
    onUpdate(agendaItems);
    //console.log("agendaItems", agendaItems)
  }, [agendaItems]);

  useEffect(() => {
    const agendaItemsFromVariable = myVariable.summary?.agendaItems?.map((item: any) => ({
      ...getDefaultAgendaItem(),
      ...item
    })) || [getDefaultAgendaItem()];
  
    setAgendaItems(agendaItemsFromVariable);
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
    } else if (type === 'decisionItems') {  
      newAgendaItems[agendaIndex][type].push({ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" });
    } else if (type === 'issues' || type === 'discussionPoints' || type === 'learningPoints') {  
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

  const itemTypesConfig = [
  {
    type: "narrative",
    isEnabled: (template: any) => template.narrative === 1,
    render: (item: any, agendaIndex: any) => (
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
    )
  },
  {
    type: "issues",
    isEnabled: (template: any) => template.issues === 1,
    render: (item: any, agendaIndex: any) => (
      <>
        <h3>Issues</h3>
        <div className={styles['action-item']}>    
          {item?.issues?.map((issue: any, issueIndex: any) => (
            <Item
            key={`${agendaIndex}-issue-${issueIndex}`}
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
    )
  },
  {
    type: "actionItems",
    isEnabled: (template: any) => template.actionItems === 1,
    render: (item: any, agendaIndex: any) => (
      <>
        <h3>Action items</h3>
        {item?.actionItems?.map((action: any, actionIndex: any) => ( 
          <Item
            key={`${agendaIndex}-action-${actionIndex}`}
            type="actionItems"
            item={action}
            agendaIndex={agendaIndex}
            itemIndex={actionIndex}
            onUpdate={(agendaIdx: any, itemIdx: any, updatedItem: any) => handleItemUpdate('actionItems', agendaIdx, itemIdx, updatedItem)}
            onRemove={removeItem}
          />
        ))}
        <button className={styles['add-button']} type="button" onClick={() => addItem('actionItems', agendaIndex)}>Add Action</button>
      </>
    )
  },
  {
    type: "decisionItems",
    isEnabled: (template: any) => template.decisionItems === 1,
    render: (item: any, agendaIndex: any) => (
      <>
        <h3>Decisions</h3>
        {item?.decisionItems?.map((decision: any, decisionIndex: any) => (
            <Item
            key={`${agendaIndex}-decision-${decisionIndex}`}
            type="decisionItems"
            item={decision}
            agendaIndex={agendaIndex}
            itemIndex={decisionIndex}
            onUpdate={(agendaIdx: any, itemIdx: any, updatedItem: any) => handleItemUpdate('decisionItems', agendaIdx, itemIdx, updatedItem)}
            onRemove={removeItem}
          />
        ))}
        <button className={styles['add-button']} type="button" onClick={() => addItem('decisionItems', agendaIndex)}>Add Decision</button>
      </>
    )
  },
  {
    type: "discussionPoints",
    isEnabled: (template: any) => template.discussionPoints === 1,
    render: (item: any, agendaIndex: any) => (
      <>
        <h3>Discussion Points</h3>
        <div className={styles['discussion-points']}>
        {item.discussionPoints.map((point: any, pointIndex: any) => (
              <Item
                  key={`${agendaIndex}-discussion-${pointIndex}`}
                  type="discussionPoints"
                  item={point}
                  agendaIndex={agendaIndex}
                  itemIndex={pointIndex}
                  onUpdate={(agendaIdx: any, itemIdx: any, updatedItem: any) => handleItemUpdate('discussionPoints', agendaIdx, itemIdx, updatedItem)}
                  onRemove={removeItem}
              />
            ))}
        </div>
        <button className={styles['add-button']} type="button" onClick={() => addItem('discussionPoints', agendaIndex)}>Add Discussion Point</button>
      </>
    )
  },
  {
    type: "learningPoints",
    isEnabled: (template: any) => template.learningPoints === 1,
    render: (item: any, agendaIndex: any) => (
      <>
        <h3>Learning Points</h3>
        <div className={styles['discussion-points']}>
          {item.learningPoints.map((point: any, pointIndex: any) => (
              <Item
                  key={`${agendaIndex}-learning-${pointIndex}`}
                  type="learningPoints"
                  item={point}
                  agendaIndex={agendaIndex}
                  itemIndex={pointIndex}
                  onUpdate={(agendaIdx: any, itemIdx: any, updatedItem: any) => handleItemUpdate('learningPoints', agendaIdx, itemIdx, updatedItem)}
                  onRemove={removeItem}
              />
            ))}
        </div>
        <button className={styles['add-button']} type="button" onClick={() => addItem('learningPoints', agendaIndex)}>Add Learning Point</button>
      </>
    )
  },
  /*{
    type: "issues",
    isEnabled: (template: any) => template.issues === 1,
    render: (item: any, agendaIndex: any) => (
      // ... rendering logic for issues ...
    )
  },*/
];


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
          
          {itemTypesConfig.map(({ type, isEnabled, render }) => {
          if (isEnabled(myVariable.workgroup.preferred_template.agendaItems[0])) {
            return render(item, agendaIndex);
          }
          return null;
          })}

          {myVariable.workgroup.preferred_template.agendaItems[0].agenda == 1 && item.agenda == '' && (<button className={styles['remove-button']} type="button" onClick={() => removeAgendaItem(agendaIndex)}>Remove Agenda</button>)}
        </div>
      ))}
      {myVariable.workgroup.preferred_template.agendaItems[0].agenda == 1 && (<button className={styles['add-button']} type="button" onClick={addAgendaItem}>Add Agenda Item</button>)}
    </div>
  );
};

export default AgileAgendaItems;
