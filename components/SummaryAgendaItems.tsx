import { useState, useEffect } from 'react';
import { useMyVariable } from '../context/MyVariableContext';
import styles from '../styles/typea.module.css';
import Item from './Item';
import { getDefaultAgendaItem } from '../utils/getDefaultAgendaItem';
import { filterFormData } from '../utils/filterFormData';

const SummaryAgendaItems = ({ onUpdate }: any) => {
  const { myVariable, setMyVariable } = useMyVariable();
  const formData = filterFormData(myVariable?.summary);
  const initialAgendaItems = formData.agendaItems?.map((item: any) => ({
    ...getDefaultAgendaItem(),
    ...item
  })) || [getDefaultAgendaItem()];

  const [agendaItems, setAgendaItems] = useState(initialAgendaItems);

  useEffect(() => {
    onUpdate(agendaItems);
    //console.log("agendaItems", agendaItems)
  }, [agendaItems]);

  useEffect(() => {
    const agendaItemsFromVariable = formData.agendaItems?.map((item: any) => ({
      ...getDefaultAgendaItem(),
      ...item
    })) || [getDefaultAgendaItem()];

    setAgendaItems(agendaItemsFromVariable);
  }, [myVariable.summary?.agendaItems]);

  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, { agenda: "", status: "carry over", townHallUpdates: "", narrative: "", gameRules: "", leaderboard: [""], issues: [""], actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }], decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "" }], discussionPoints: [""], learningPoints: [""] }]);
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
      newAgendaItems[agendaIndex][type].push({ decision: "", rationale: "", opposing: "", effect: "" });
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
      const newAgendaItems = JSON.parse(JSON.stringify(prevAgendaItems));

      // Check if the type is 'narrative'
      if (type === 'townHallUpdates' || type === 'narrative' || type === 'gameRules' || type === 'townHallSummary') {
        if (newAgendaItems[agendaIdx]) {
          newAgendaItems[agendaIdx][type] = updatedItem[type]; // Directly set the narrative or gameRules string
        }
      } else {
        // Handle other types as before
        if (newAgendaItems[agendaIdx] && newAgendaItems[agendaIdx][type]) {
          newAgendaItems[agendaIdx][type][itemIdx] = updatedItem;
        }
      }

      return newAgendaItems;
    });
  };


  const getHeading = (itemType: any, workgroup: any) => {
    switch (itemType) {
      case "issues":
        if (workgroup === "Onboarding Workgroup") return "To carry over for next meeting";
        // Add more specific conditions for "issues" if needed
        return "Issues"; // Default for "issues"

      case "discussionPoints":
        if (workgroup === "Onboarding Workgroup") return "In this meeting we discussed";
        return "Discussion Points";

      case "meetingTopics":
        if (workgroup === "Research and Development Guild") return "Agenda Items";
        if (workgroup === "Education Workgroup") return "In this meeting we discussed";
        return "Meeting Topics";
      // Add cases for other item types as needed

      default:
        return "Items";
    }
  }

  const itemTypesConfig = [
    {
      type: "townHallUpdates",
      isEnabled: (template: any) => template?.townHallUpdates === 1,
      render: (item: any, agendaIndex: any) => (
        <>
          <h3>Town Hall Updates from this meeting</h3>
          <div className={styles['action-item']}>
            <Item
              type="townHallUpdates"
              item={item.townHallUpdates}
              agendaIndex={agendaIndex}
              itemIndex={0}
              onUpdate={(agendaIdx: any, itemIdx: any, updatedItem: any) => handleItemUpdate('townHallUpdates', agendaIdx, itemIdx, updatedItem)}
              onRemove={removeItem}
            />
          </div>
        </>
      )
    },
    {
      type: "narrative",
      isEnabled: (template: any) => template?.narrative === 1,
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
      type: "meetingTopics",
      isEnabled: (template: any) => template?.meetingTopics === 1,
      render: (item: any, agendaIndex: any) => (
        <>
          <h3>{getHeading("meetingTopics", myVariable.workgroup?.preferred_template?.workgroup)}</h3>
          <div className={styles['discussion-points']}>
            {item.meetingTopics.map((point: any, pointIndex: any) => (
              <Item
                key={`${agendaIndex}-meetingtopic-${pointIndex}`}
                type="meetingTopics"
                item={point}
                agendaIndex={agendaIndex}
                itemIndex={pointIndex}
                onUpdate={(agendaIdx: any, itemIdx: any, updatedItem: any) => handleItemUpdate('meetingTopics', agendaIdx, itemIdx, updatedItem)}
                onRemove={removeItem}
              />
            ))}
          </div>
          <button className={styles['add-button']} type="button" onClick={() => addItem('meetingTopics', agendaIndex)}>Add Item</button>
        </>
      )
    },
    {
      type: "discussionPoints",
      isEnabled: (template: any) => template?.discussionPoints === 1,
      render: (item: any, agendaIndex: any) => (
        <>
          <h3>{getHeading("discussionPoints", myVariable.workgroup?.preferred_template?.workgroup)}</h3>
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
      type: "actionItems",
      isEnabled: (template: any) => template?.actionItems === 1,
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
      isEnabled: (template: any) => template?.decisionItems === 1,
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
      type: "gameRules",
      isEnabled: (template: any) => template?.gameRules === 1,
      render: (item: any, agendaIndex: any) => (
        <>
          <h3>Game Rules</h3>
          <div className={styles['action-item']}>
            <Item
              type="gameRules"
              item={item.gameRules}
              agendaIndex={agendaIndex}
              itemIndex={0}
              onUpdate={(agendaIdx: any, itemIdx: any, updatedItem: any) => handleItemUpdate('gameRules', agendaIdx, itemIdx, updatedItem)}
              onRemove={removeItem}
            />
          </div>
        </>
      )
    },
    {
      type: "townHallSummary",
      isEnabled: (template: any) => template?.townHallSummary === 1,
      render: (item: any, agendaIndex: any) => (
        <>
          <h3>Town Hall Summary (Optional)</h3>
          <div className={styles['action-item']}>
            <Item
              type="townHallSummary"
              item={item.townHallSummary}
              agendaIndex={agendaIndex}
              itemIndex={0}
              onUpdate={(agendaIdx: any, itemIdx: any, updatedItem: any) => handleItemUpdate('townHallSummary', agendaIdx, itemIdx, updatedItem)}
              onRemove={removeItem}
            />
          </div>
        </>
      )
    },
    {
      type: "leaderboard",
      isEnabled: (template: any) => template?.leaderboard === 1,
      render: (item: any, agendaIndex: any) => (
        <>
          <h3>Leaderboard</h3>
          <div className={styles['discussion-points']}>
            {item.leaderboard.map((point: any, pointIndex: any) => (
              <Item
                key={`${agendaIndex}-leaderboard-${pointIndex}`}
                type="leaderboard"
                item={point}
                agendaIndex={agendaIndex}
                itemIndex={pointIndex}
                onUpdate={(agendaIdx: any, itemIdx: any, updatedItem: any) => handleItemUpdate('leaderboard', agendaIdx, itemIdx, updatedItem)}
                onRemove={removeItem}
              />
            ))}
          </div>
          <button className={styles['add-button']} type="button" onClick={() => addItem('leaderboard', agendaIndex)}>Add Gamer</button>
        </>
      )
    },
    {
      type: "learningPoints",
      isEnabled: (template: any) => template?.learningPoints === 1,
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
    {
      type: "issues",
      isEnabled: (template: any) => template?.issues === 1,
      render: (item: any, agendaIndex: any) => (
        <>
          <h3>{getHeading("issues", myVariable.workgroup?.preferred_template?.workgroup)}</h3>
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
            <button className={styles['add-button']} type="button" onClick={() => addItem('issues', agendaIndex)}>Add Item</button>
          </div>
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

  type WorkgroupKey = keyof typeof orderMapping;

  const orderMapping = myVariable?.agendaItemOrder; 

  const reorderItemTypesConfig = (orderKey: WorkgroupKey) => {
    const order = orderMapping[orderKey];
    if (!order) {
      console.warn("Order key not found in mapping");
      return;
    }

    itemTypesConfig.sort((a, b) => {
      const indexA = order.indexOf(a.type);
      const indexB = order.indexOf(b.type);

      if (indexA === -1 && indexB === -1) return 0; // Both types are not in the order list, keep their relative order
      if (indexA === -1) return 1; // Type A is not in the list, move it towards the end
      if (indexB === -1) return -1; // Type B is not in the list, move it towards the end

      return indexA - indexB;
    });

  };

  if (typeof myVariable.workgroup?.workgroup === 'string' && myVariable.workgroup?.workgroup in orderMapping) {
    reorderItemTypesConfig(myVariable.workgroup?.workgroup as WorkgroupKey);
  } else {
    console.warn("Invalid workgroup key");
  }

  return (
    <div>
      {myVariable.workgroup?.preferred_template?.agendaItems[0]?.agenda == 1 && (<h1>Agenda Items</h1>)}
      {agendaItems.map((item: any, agendaIndex: any) => (
        <div key={agendaIndex} className={styles['agenda-item']}>
          {myVariable.workgroup?.preferred_template?.agendaItems[0]?.agenda == 1 && (
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
                    autoComplete="off"
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
            if (isEnabled(myVariable.workgroup?.preferred_template?.agendaItems[0])) {
              // Add a unique key prop to each rendered element
              return <div key={`${type}-${agendaIndex}`}>{render(item, agendaIndex)}</div>;
            }
            return null;
          })}

          {myVariable.workgroup?.preferred_template?.agendaItems[0]?.agenda == 1 && item.agenda == '' && (<button className={styles['remove-button']} type="button" onClick={() => removeAgendaItem(agendaIndex)}>Remove Agenda</button>)}
        </div>
      ))}
      {((myVariable.workgroup?.preferred_template?.agendaItems[0]?.agenda == 0 && agendaItems.length == 0) ||
      (myVariable.workgroup?.preferred_template?.agendaItems[0]?.agenda == 1))
      && (<button className={styles['add-button']} type="button" onClick={addAgendaItem}>Add Agenda Item</button>)}
    </div>
  );
};

export default SummaryAgendaItems;
