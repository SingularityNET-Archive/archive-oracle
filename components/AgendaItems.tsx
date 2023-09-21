import { useState, useEffect } from 'react';

const AgendaItems = ({onUpdate}: any) => {
    const [agendaItems, setAgendaItems] = useState([
        { 
          agenda: "", 
          actionItems: [{ text: "", assignee: "", dueDate: "" }],  
          decisionItems: [{ decision: "", rationale: "", opposing: "" }],
          discussionPoints: [""] 
        }
      ]);
      
  useEffect(() => {
    onUpdate(agendaItems);
  }, [agendaItems]);

  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, { agenda: "", actionItems: [{ text: "", assignee: "", dueDate: "" }], decisionItems: [{ decision: "", rationale: "", opposing: "" }], discussionPoints: [""] }]);
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
      newAgendaItems[agendaIndex][type].push({ decision: "", rationale: "", opposing: "" });
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
      <h3>Agenda Items</h3>
      {agendaItems.map((item, agendaIndex) => (
        <div key={agendaIndex}>
          <h4>Agenda item {agendaIndex + 1}</h4>
          <input 
            type="text"
            placeholder="Agenda Item"
            value={item.agenda}
            onChange={(e) => {
              const newAgenda = [...agendaItems];
              newAgenda[agendaIndex].agenda = e.target.value;
              setAgendaItems(newAgenda);
            }}
          />
          
          {item.actionItems.map((action, actionIndex) => (
            <div key={actionIndex}>
              <input 
                type="text"
                placeholder="Action Item"
                value={action.text} 
                onChange={(e) => {
                  const newAgenda = [...agendaItems];
                  newAgenda[agendaIndex].actionItems[actionIndex].text = e.target.value;  
                  setAgendaItems(newAgenda);
                }}
              />
          
              <input 
                type="text"
                placeholder="Assignee"
                value={action.assignee}  
                onChange={(e) => {
                  const newAgenda = [...agendaItems];
                  newAgenda[agendaIndex].actionItems[actionIndex].assignee = e.target.value;  
                  setAgendaItems(newAgenda);
                }}
              />
          
              <input 
                type="date"
                placeholder="Due Date"
                value={action.dueDate}  
                onChange={(e) => {
                  const newAgenda = [...agendaItems];
                  newAgenda[agendaIndex].actionItems[actionIndex].dueDate = e.target.value;  
                  setAgendaItems(newAgenda);
                }}
              />
          
              <button onClick={() => removeItem('actionItems', agendaIndex, actionIndex)}>Remove Action</button>
            </div>
          ))}

          <button onClick={() => addItem('actionItems', agendaIndex)}>Add Action</button>
          {item.decisionItems.map((decision, decisionIndex) => (
            <div key={decisionIndex}>
              <input 
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
                type="text"
                placeholder="Opposing"
                value={decision.opposing} 
                onChange={(e) => {
                  const newAgenda = [...agendaItems];
                  newAgenda[agendaIndex].decisionItems[decisionIndex].opposing = e.target.value; 
                  setAgendaItems(newAgenda);
                }}
              />
              <button onClick={() => removeItem('decisionItems', agendaIndex, decisionIndex)}>Remove Decision</button>
            </div>
          ))}
          <button onClick={() => addItem('decisionItems', agendaIndex)}>Add Decision</button>

          {item.discussionPoints.map((point, pointIndex) => (
            <div key={pointIndex}>
              <input 
                type="text"
                placeholder="Discussion Point"
                value={point}
                onChange={(e) => {
                  const newAgenda = [...agendaItems];
                  newAgenda[agendaIndex].discussionPoints[pointIndex] = e.target.value;
                  setAgendaItems(newAgenda);
                }}
              />
              <button onClick={() => removeItem('discussionPoints', agendaIndex, pointIndex)}>Remove Point</button>
            </div>
          ))}
          <button onClick={() => addItem('discussionPoints', agendaIndex)}>Add Point</button>
          <button onClick={() => removeAgendaItem(agendaIndex)}>Remove Agenda</button>
        </div>
      ))}
      <button onClick={addAgendaItem}>Add Agenda Item</button>
    </div>
  );
};

export default AgendaItems;
