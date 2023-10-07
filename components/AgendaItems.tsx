import { useState, useEffect } from 'react';

const AgendaItems = ({onUpdate}: any) => {
    const [agendaItems, setAgendaItems] = useState([
        { 
          agenda: "", 
          status: "carry over", 
          actionItems: [{ text: "", assignee: "", dueDate: "" }],  
          decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
          discussionPoints: [""] 
        }
      ]);
      
  useEffect(() => {
    onUpdate(agendaItems);
  }, [agendaItems]);

  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, { agenda: "", status: "carry over",  actionItems: [{ text: "", assignee: "", dueDate: "" }], decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }], discussionPoints: [""] }]);
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
          <label>
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
          </label>
          <label>
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
          </label>   
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
