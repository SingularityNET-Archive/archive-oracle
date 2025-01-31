import { useState, useEffect } from 'react';
import { useMyVariable } from '../context/MyVariableContext';
import styles from '../styles/agendaitems.module.css';
import Item from './Item';
import { getDefaultAgendaItem } from '../utils/getDefaultAgendaItem';
import { filterFormData } from '../utils/filterFormData';

const SummaryAgendaItems = ({ onUpdate }: any) => {
  const { myVariable } = useMyVariable();

  // Track current `meeting_id` in local state so we only
  // re‐initialize agenda items when the ID changes.
  const [localMeetingId, setLocalMeetingId] = useState(myVariable.summary?.meeting_id || null);

  // Run `filterFormData` once for our initial agenda items:
  const initialFilteredData = myVariable.summary
    ? filterFormData(myVariable.summary)
    : {};

  const [agendaItems, setAgendaItems] = useState(
    initialFilteredData.agendaItems?.map((item: any) => ({
      ...getDefaultAgendaItem(),
      ...item
    })) || [getDefaultAgendaItem()]
  );

  /**
   * If the meeting_id in context changes (meaning user selected
   * a new summary or the backend assigned a new ID),
   * then we re-run `filterFormData` and re‐init local state.
   */
  useEffect(() => {
    const currentId = myVariable.summary?.meeting_id;
    if (currentId && currentId !== localMeetingId) {
      const newFiltered = filterFormData(myVariable.summary);
      const newAgendaItems = newFiltered.agendaItems?.map((item: any) => ({
        ...getDefaultAgendaItem(),
        ...item
      })) || [getDefaultAgendaItem()];

      setAgendaItems(newAgendaItems);
      setLocalMeetingId(currentId);
    }
  }, [myVariable.summary?.meeting_id, localMeetingId]);

  /**
   * Notify the parent component (`SummaryTemplate`) whenever
   * local `agendaItems` change.
   */
  useEffect(() => {
    onUpdate(agendaItems);
  }, [agendaItems, onUpdate]);

  // Utility to add an entire new "agenda item" section
  const addAgendaItem = () => {
    setAgendaItems((prev) => [
      ...prev,
      { ...getDefaultAgendaItem() }
    ]);
  };

  // Remove one entire "agenda item" section
  const removeAgendaItem = (index: number) => {
    setAgendaItems((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  // Add a sub‐item (actionItems, discussionPoints, etc.)
  const addItem = (type: string, agendaIndex: number) => {
    setAgendaItems((prev) => {
      const updated = [...prev];
      if (type === 'actionItems') {
        updated[agendaIndex][type].push({
          text: "",
          assignee: "",
          dueDate: "",
          status: "todo"
        });
      } else if (type === 'decisionItems') {
        updated[agendaIndex][type].push({
          decision: "",
          rationale: "",
          opposing: "",
          effect: ""
        });
      } else {
        // e.g. discussionPoints, issues, meetingTopics, leaderboard
        updated[agendaIndex][type].push("");
      }
      return updated;
    });
  };

  // Remove a sub‐item
  const removeItem = (type: string, agendaIndex: number, itemIndex: number) => {
    setAgendaItems((prev) => {
      const updated = [...prev];
      updated[agendaIndex][type].splice(itemIndex, 1);
      return updated;
    });
  };

  // Update a sub‐item (like one actionItem, or one discussionPoint, etc.)
  const handleItemUpdate = (
    type: string,
    agendaIdx: number,
    itemIdx: number,
    updatedItem: any
  ) => {
    setAgendaItems((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));

      // Some fields (narrative, discussion, etc.) are single text fields
      // stored directly rather than in an array.
      if (
        type === 'townHallUpdates' ||
        type === 'narrative' ||
        type === 'gameRules' ||
        type === 'townHallSummary' ||
        type === 'discussion'
      ) {
        cloned[agendaIdx][type] = updatedItem[type];
      } else {
        // Arrays: discussionPoints, actionItems, etc.
        cloned[agendaIdx][type][itemIdx] = updatedItem;
      }
      return cloned;
    });
  };

  // You have your "template" logic to show/hide sections:
  const itemTypesConfig = [
    {
      type: "townHallUpdates",
      isEnabled: (t: any) => t?.townHallUpdates === 1,
      render: (item: any, agendaIndex: number) => (
        <>
          <h3>Town Hall Updates from this meeting</h3>
          <div className={styles['action-item']}>
            <Item
              type="townHallUpdates"
              item={item.townHallUpdates}
              agendaIndex={agendaIndex}
              itemIndex={0}
              onUpdate={(aIdx, iIdx, updated) =>
                handleItemUpdate("townHallUpdates", aIdx, iIdx, updated)
              }
              onRemove={removeItem}
            />
          </div>
        </>
      )
    },
    {
      type: "narrative",
      isEnabled: (t: any) => t?.narrative === 1,
      render: (item: any, agendaIndex: number) => (
        <>
          <h3>Narrative</h3>
          <div className={styles['action-item']}>
            <Item
              type="narrative"
              item={item.narrative}
              agendaIndex={agendaIndex}
              itemIndex={0}
              onUpdate={(aIdx, iIdx, updated) =>
                handleItemUpdate("narrative", aIdx, iIdx, updated)
              }
              onRemove={removeItem}
            />
          </div>
        </>
      )
    },
    {
      type: "discussion",
      isEnabled: (t: any) => t?.discussion === 1,
      render: (item: any, agendaIndex: number) => (
        <>
          <h3>Discussion</h3>
          <div className={styles['action-item']}>
            <Item
              type="discussion"
              item={item.discussion}
              agendaIndex={agendaIndex}
              itemIndex={0}
              onUpdate={(aIdx, iIdx, updated) =>
                handleItemUpdate("discussion", aIdx, iIdx, updated)
              }
              onRemove={removeItem}
            />
          </div>
        </>
      )
    },
    {
      type: "meetingTopics",
      isEnabled: (t: any) => t?.meetingTopics === 1,
      render: (item: any, agendaIndex: number) => (
        <>
          <h3>Meeting Topics</h3>
          <div className={styles['discussion-points']}>
            {item.meetingTopics.map((topic: any, idx: number) => (
              <Item
                key={`${agendaIndex}-meetingtopic-${idx}`}
                type="meetingTopics"
                item={topic}
                agendaIndex={agendaIndex}
                itemIndex={idx}
                onUpdate={(aIdx, iIdx, updated) =>
                  handleItemUpdate("meetingTopics", aIdx, iIdx, updated)
                }
                onRemove={removeItem}
              />
            ))}
          </div>
          <button
            className={styles['add-button']}
            type="button"
            onClick={() => addItem('meetingTopics', agendaIndex)}
          >
            Add Item
          </button>
        </>
      )
    },
    {
      type: "discussionPoints",
      isEnabled: (t: any) => t?.discussionPoints === 1,
      render: (item: any, agendaIndex: number) => (
        <>
          <h3>Discussion Points</h3>
          <div className={styles['discussion-points']}>
            {item.discussionPoints?.map((pt: any, idx: number) => (
              <Item
                key={`${agendaIndex}-discussion-${idx}`}
                type="discussionPoints"
                item={pt}
                agendaIndex={agendaIndex}
                itemIndex={idx}
                onUpdate={(aIdx, iIdx, updated) =>
                  handleItemUpdate("discussionPoints", aIdx, iIdx, updated)
                }
                onRemove={removeItem}
              />
            ))}
          </div>
          <button
            className={styles['add-button']}
            type="button"
            onClick={() => addItem('discussionPoints', agendaIndex)}
          >
            Add Discussion Point
          </button>
        </>
      )
    },
    {
      type: "actionItems",
      isEnabled: (t: any) => t?.actionItems === 1,
      render: (item: any, agendaIndex: number) => (
        <>
          <h3>Action items</h3>
          {item.actionItems?.map((action: any, actionIdx: number) => (
            <Item
              key={`${agendaIndex}-action-${actionIdx}`}
              type="actionItems"
              item={action}
              agendaIndex={agendaIndex}
              itemIndex={actionIdx}
              onUpdate={(aIdx, iIdx, updated) =>
                handleItemUpdate("actionItems", aIdx, iIdx, updated)
              }
              onRemove={removeItem}
            />
          ))}
          <button
            className={styles['add-button']}
            type="button"
            onClick={() => addItem('actionItems', agendaIndex)}
          >
            Add Action
          </button>
        </>
      )
    },
    {
      type: "decisionItems",
      isEnabled: (t: any) => t?.decisionItems === 1,
      render: (item: any, agendaIndex: number) => (
        <>
          <h3>Decisions</h3>
          {item.decisionItems?.map((dec: any, decIdx: number) => (
            <Item
              key={`${agendaIndex}-decision-${decIdx}`}
              type="decisionItems"
              item={dec}
              agendaIndex={agendaIndex}
              itemIndex={decIdx}
              onUpdate={(aIdx, iIdx, updated) =>
                handleItemUpdate("decisionItems", aIdx, iIdx, updated)
              }
              onRemove={removeItem}
            />
          ))}
          <button
            className={styles['add-button']}
            type="button"
            onClick={() => addItem('decisionItems', agendaIndex)}
          >
            Add Decision
          </button>
        </>
      )
    },
    {
      type: "gameRules",
      isEnabled: (t: any) => t?.gameRules === 1,
      render: (item: any, agendaIndex: number) => (
        <>
          <h3>Game Rules</h3>
          <div className={styles['action-item']}>
            <Item
              type="gameRules"
              item={item.gameRules}
              agendaIndex={agendaIndex}
              itemIndex={0}
              onUpdate={(aIdx, iIdx, updated) =>
                handleItemUpdate("gameRules", aIdx, iIdx, updated)
              }
              onRemove={removeItem}
            />
          </div>
        </>
      )
    },
    {
      type: "townHallSummary",
      isEnabled: (t: any) => t?.townHallSummary === 1,
      render: (item: any, agendaIndex: number) => (
        <>
          <h3>Town Hall Summary (Optional)</h3>
          <div className={styles['action-item']}>
            <Item
              type="townHallSummary"
              item={item.townHallSummary}
              agendaIndex={agendaIndex}
              itemIndex={0}
              onUpdate={(aIdx, iIdx, updated) =>
                handleItemUpdate("townHallSummary", aIdx, iIdx, updated)
              }
              onRemove={removeItem}
            />
          </div>
        </>
      )
    },
    {
      type: "leaderboard",
      isEnabled: (t: any) => t?.leaderboard === 1,
      render: (item: any, agendaIndex: number) => (
        <>
          <h3>Leaderboard</h3>
          <div className={styles['discussion-points']}>
            {item.leaderboard.map((lb: any, lbIdx: number) => (
              <Item
                key={`${agendaIndex}-leaderboard-${lbIdx}`}
                type="leaderboard"
                item={lb}
                agendaIndex={agendaIndex}
                itemIndex={lbIdx}
                onUpdate={(aIdx, iIdx, updated) =>
                  handleItemUpdate("leaderboard", aIdx, iIdx, updated)
                }
                onRemove={removeItem}
              />
            ))}
          </div>
          <button
            className={styles['add-button']}
            type="button"
            onClick={() => addItem('leaderboard', agendaIndex)}
          >
            Add Gamer
          </button>
        </>
      )
    },
    {
      type: "learningPoints",
      isEnabled: (t: any) => t?.learningPoints === 1,
      render: (item: any, agendaIndex: number) => (
        <>
          <h3>Learning Points</h3>
          <div className={styles['discussion-points']}>
            {item.learningPoints.map((lp: any, lpIdx: number) => (
              <Item
                key={`${agendaIndex}-learning-${lpIdx}`}
                type="learningPoints"
                item={lp}
                agendaIndex={agendaIndex}
                itemIndex={lpIdx}
                onUpdate={(aIdx, iIdx, updated) =>
                  handleItemUpdate("learningPoints", aIdx, iIdx, updated)
                }
                onRemove={removeItem}
              />
            ))}
          </div>
          <button
            className={styles['add-button']}
            type="button"
            onClick={() => addItem('learningPoints', agendaIndex)}
          >
            Add Learning Point
          </button>
        </>
      )
    },
    {
      type: "issues",
      isEnabled: (t: any) => t?.issues === 1,
      render: (item: any, agendaIndex: number) => (
        <>
          <h3>Issues</h3>
          <div className={styles['action-item']}>
            {item.issues?.map((issue: any, issueIdx: number) => (
              <Item
                key={`${agendaIndex}-issue-${issueIdx}`}
                type="issues"
                item={issue}
                agendaIndex={agendaIndex}
                itemIndex={issueIdx}
                onUpdate={(aIdx, iIdx, updated) =>
                  handleItemUpdate("issues", aIdx, iIdx, updated)
                }
                onRemove={removeItem}
              />
            ))}
            <button
              className={styles['add-button']}
              type="button"
              onClick={() => addItem('issues', agendaIndex)}
            >
              Add Item
            </button>
          </div>
        </>
      )
    },
  ];

  // If the user’s workgroup is in `agendaItemOrder`, reorder itemTypes accordingly
  const orderMapping = myVariable?.agendaItemOrder;
  type WorkgroupKey = keyof typeof orderMapping;
  if (
    typeof myVariable.workgroup?.workgroup === 'string' &&
    myVariable.workgroup?.workgroup in orderMapping
  ) {
    const orderKey = myVariable.workgroup.workgroup as WorkgroupKey;
    const order = orderMapping[orderKey];
    if (order) {
      itemTypesConfig.sort((a, b) => {
        const indexA = order.indexOf(a.type);
        const indexB = order.indexOf(b.type);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }
  } else {
    console.warn("Invalid or unmapped workgroup key - using default item order.");
  }

  return (
    <div>
      {myVariable.workgroup?.preferred_template?.agendaItems[0]?.agenda === 1 && (
        <h1>Agenda Items</h1>
      )}

      {agendaItems.map((item: any, agendaIndex: number) => (
        <div key={agendaIndex} className={styles['agenda-item']}>

          {/* If your template says "agenda=1", show agenda title + status */}
          {myVariable.workgroup?.preferred_template?.agendaItems[0]?.agenda === 1 && (
            <>
              <h2>Agenda item {agendaIndex + 1}</h2>
              <div className={styles['row-flex-start']}>
                <div className={styles['agenda-title']}>
                  <label className={styles['form-label']}>Agenda Title</label>
                  <input
                    className={styles['form-select']}
                    type="text"
                    placeholder="Agenda Item"
                    value={item.agenda}
                    autoComplete="off"
                    onChange={(e) => {
                      const updated = [...agendaItems];
                      updated[agendaIndex].agenda = e.target.value;
                      setAgendaItems(updated);
                    }}
                  />
                </div>
                <div className={styles['column-flex']}>
                  <label className={styles['form-label']}>Status</label>
                  <select
                    className={styles['form-select']}
                    value={item.status}
                    onChange={(e) => {
                      const updated = [...agendaItems];
                      updated[agendaIndex].status = e.target.value;
                      setAgendaItems(updated);
                    }}
                  >
                    <option value="carry over">Carry Over</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Render sub‐sections based on the template flags */}
          {itemTypesConfig.map(({ type, isEnabled, render }) => {
            if (isEnabled(myVariable.workgroup?.preferred_template?.agendaItems[0])) {
              return (
                <div key={`${type}-${agendaIndex}`}>
                  {render(item, agendaIndex)}
                </div>
              );
            }
            return null;
          })}

          {/* If agenda=1 is enabled, let them remove this agenda if empty */}
          {myVariable.workgroup?.preferred_template?.agendaItems[0]?.agenda === 1 &&
            item.agenda === '' && (
              <button
                className={styles['remove-button']}
                type="button"
                onClick={() => removeAgendaItem(agendaIndex)}
              >
                Remove Agenda
              </button>
          )}
        </div>
      ))}

      {(
        // Show "Add Agenda Item" if the template says agenda=1,
        // or if there are no agenda items yet
        (myVariable.workgroup?.preferred_template?.agendaItems[0]?.agenda === 0 &&
          agendaItems.length === 0) ||
        (myVariable.workgroup?.preferred_template?.agendaItems[0]?.agenda === 1)
      ) && (
        <button
          className={styles['add-button']}
          type="button"
          onClick={addAgendaItem}
        >
          Add Agenda Item
        </button>
      )}
    </div>
  );
};

export default SummaryAgendaItems;
