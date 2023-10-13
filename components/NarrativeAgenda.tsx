import { useState, useEffect } from 'react';
import { useMyVariable } from '../context/MyVariableContext';
import styles from '../styles/typea.module.css';

const NarrativeAgenda = ({ onUpdate }: any) => {
  const { myVariable, setMyVariable } = useMyVariable();
  const firstAgendaItem = myVariable?.summary?.agendaItems?.[0] || {};

  const [mode, setMode] = useState(firstAgendaItem.mode || 'Narrative');
  const [narrative, setNarrative] = useState(firstAgendaItem.narrative || '');
  const [issues, setIssues] = useState(firstAgendaItem.issues || ['']);
  const [actionItems, setActionItems] = useState(firstAgendaItem.actionItems || [{ text: "", assignee: "", dueDate: "" }]);
  const [decisionItems, setDecisionItems] = useState(firstAgendaItem.decisionItems || [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }]);

  useEffect(() => {
    if (mode === 'Narrative') {
      setIssues([]);
    } else {
      setNarrative('');
    }
  }, [mode]);

  useEffect(() => {
    onUpdate([{ mode, narrative, issues, actionItems, decisionItems }]);
  }, [mode, narrative, issues, actionItems, decisionItems]);

  const addIssue = () => {
    setIssues([...issues, '']);
  };

  const removeIssue = (index: number) => {
    const newIssues = [...issues];
    newIssues.splice(index, 1);
    setIssues(newIssues);
  };

  const addActionItem = () => {
    setActionItems([...actionItems, { text: "", assignee: "", dueDate: "" }]);
  };

  const removeActionItem = (index: number) => {
    const newActionItems = [...actionItems];
    newActionItems.splice(index, 1);
    setActionItems(newActionItems);
  };

  const addDecisionItem = () => {
    setDecisionItems([...decisionItems, { decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }]);
  };

  const removeDecisionItem = (index: number) => {
    const newDecisionItems = [...decisionItems];
    newDecisionItems.splice(index, 1);
    setDecisionItems(newDecisionItems);
  };

  return (
    <div>
      <h3>Narrative or List of Issues</h3>
      <select onChange={(e) => setMode(e.target.value)} value={mode}>
        <option value="Narrative">Narrative</option>
        <option value="List of Issues">List of Issues</option>
      </select>

      {mode === 'Narrative' ? (
        <textarea
          className={styles['form-input']}
          placeholder="Describe what happened..."
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
        />
      ) : (
        <div>
          <h3>Issues</h3>
          {issues.map((issue: any, index: any) => (
            <div key={index}>
              <input
                className={styles['form-input']}
                type="text"
                placeholder="Issue"
                value={issue}
                onChange={(e) => {
                  const newIssues = [...issues];
                  newIssues[index] = e.target.value;
                  setIssues(newIssues);
                }}
              />
              <button onClick={() => removeIssue(index)}>Remove Issue</button>
            </div>
          ))}
          <button onClick={addIssue}>Add Issue</button>
        </div>
      )}

<h3>Action Items</h3>
      {actionItems.map((item: any, index: any) => (
        <div key={index}>
          <input
            className={styles['form-input']}
            type="text"
            placeholder="Action Text"
            value={item.text}
            onChange={(e) => {
              const newActionItems = [...actionItems];
              newActionItems[index].text = e.target.value;
              setActionItems(newActionItems);
            }}
          />
          <input
            className={styles['form-input']}
            type="text"
            placeholder="Assignee"
            value={item.assignee}
            onChange={(e) => {
              const newActionItems = [...actionItems];
              newActionItems[index].assignee = e.target.value;
              setActionItems(newActionItems);
            }}
          />
          <input
            className={styles['form-input']}
            type="date"
            placeholder="Due Date"
            value={item.dueDate}
            onChange={(e) => {
              const newActionItems = [...actionItems];
              newActionItems[index].dueDate = e.target.value;
              setActionItems(newActionItems);
            }}
          />
          <button onClick={() => removeActionItem(index)}>Remove Action</button>
        </div>
      ))}
      <button onClick={addActionItem}>Add Action</button>

      <h3>Decision Items</h3>
      {decisionItems.map((item: any, index: any) => (
        <div key={index}>
          <input
            className={styles['form-input']}
            type="text"
            placeholder="Decision"
            value={item.decision}
            onChange={(e) => {
              const newDecisionItems = [...decisionItems];
              newDecisionItems[index].decision = e.target.value;
              setDecisionItems(newDecisionItems);
            }}
          />
          <input
            className={styles['form-input']}
            type="text"
            placeholder="Rationale"
            value={item.rationale}
            onChange={(e) => {
              const newDecisionItems = [...decisionItems];
              newDecisionItems[index].rationale = e.target.value;
              setDecisionItems(newDecisionItems);
            }}
          />
          <input
            className={styles['form-input']}
            type="text"
            placeholder="Opposing"
            value={item.opposing}
            onChange={(e) => {
              const newDecisionItems = [...decisionItems];
              newDecisionItems[index].opposing = e.target.value;
              setDecisionItems(newDecisionItems);
            }}
          />
          <label>
            <input 
                type="radio"
                name={`decisionEffect-${index}`}
                value="affectsAllWorkgroups"
                checked={item.effect === "affectsAllWorkgroups"}
                onChange={(e) => {
                    const newDecisionItems = [...decisionItems];
                    newDecisionItems[index].effect = e.target.value;
                    setDecisionItems(newDecisionItems);
                }}
            />
            Affects all workgroups
          </label>
          <label>
              <input 
                  type="radio"
                  name={`decisionEffect-${index}`}
                  value="affectsOnlyThisWorkgroup"
                  checked={item.effect === "affectsOnlyThisWorkgroup"}
                  onChange={(e) => {
                      const newDecisionItems = [...decisionItems];
                      newDecisionItems[index].effect = e.target.value;
                      setDecisionItems(newDecisionItems);
                  }}
              />
              Affects only this workgroup
          </label>
          <button onClick={() => removeDecisionItem(index)}>Remove Decision</button>
        </div>
      ))}
      <button onClick={addDecisionItem}>Add Decision</button>
    </div>
  );
};

export default NarrativeAgenda;
