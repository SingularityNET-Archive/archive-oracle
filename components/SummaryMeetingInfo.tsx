import { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../styles/meetinginfo.module.css';
import { useMyVariable } from '../context/MyVariableContext';
import SelectNames from './SelectNames';
import WorkingDocs from './WorkingDocs';
import TimestampedVideo from './TimestampedVideo';
import { MeetingTypeSelect } from './meeting/MeetingTypeSelect';

type SummaryMeetingInfoProps = {
  workgroup: string;
  onUpdate: (info: any) => void;
};

const SummaryMeetingInfo: React.FC<SummaryMeetingInfoProps> = ({ workgroup, onUpdate }) => {
  const { myVariable } = useMyVariable();

  // Track which meeting_id we have "locally"
  const [localMeetingId, setLocalMeetingId] = useState(myVariable.summary?.meeting_id || null);

  // Pull initial meeting info:
  const initialInfo = myVariable.summary?.meetingInfo || {};
  // Save the initial docs array:
  const initialDocs = initialInfo.workingDocs || [];

  // This is how many docs came from the DB initially
  // (as opposed to newly added on the client).
  const [originalDocsCount] = useState(initialDocs.length);

  // Keep the entire meetingInfo in local state
  const [meetingInfo, setMeetingInfo] = useState({
    name: initialInfo.name || "Weekly",
    date: initialInfo.date || "",
    host: initialInfo.host || "",
    documenter: initialInfo.documenter || "",
    translator: initialInfo.translator || "",
    peoplePresent: initialInfo.peoplePresent || "",
    purpose: initialInfo.purpose || "",
    townHallNumber: initialInfo.townHallNumber || "",
    googleSlides: initialInfo.googleSlides || "",
    meetingVideoLink: initialInfo.meetingVideoLink || "",
    miroBoardLink: initialInfo.miroBoardLink || "",
    otherMediaLink: initialInfo.otherMediaLink || "",
    transcriptLink: initialInfo.transcriptLink || "",
    mediaLink: initialInfo.mediaLink || "",
    workingDocs: initialDocs.length === 0 ? [{ title: "", link: "" }] : initialDocs,
    timestampedVideo: initialInfo.timestampedVideo || { url: "", intro: "", timestamps: "" }
  });

  /**
   * If `meeting_id` changes in context, re‐init from the updated context
   * once (rather than every time summary updates).
   */
  useEffect(() => {
    const currentId = myVariable.summary?.meeting_id;
    if (currentId && currentId !== localMeetingId) {
      const newInfo = myVariable.summary?.meetingInfo || {};
      const newDocs = newInfo.workingDocs || [];

      setMeetingInfo({
        name: newInfo.name || "Weekly",
        date: newInfo.date || "",
        host: newInfo.host || "",
        documenter: newInfo.documenter || "",
        translator: newInfo.translator || "",
        peoplePresent: newInfo.peoplePresent || "",
        purpose: newInfo.purpose || "",
        townHallNumber: newInfo.townHallNumber || "",
        googleSlides: newInfo.googleSlides || "",
        meetingVideoLink: newInfo.meetingVideoLink || "",
        miroBoardLink: newInfo.miroBoardLink || "",
        otherMediaLink: newInfo.otherMediaLink || "",
        transcriptLink: newInfo.transcriptLink || "",
        mediaLink: newInfo.mediaLink || "",
        workingDocs: newDocs,
        timestampedVideo: newInfo.timestampedVideo || { url: "", intro: "", timestamps: "" }
      });

      setLocalMeetingId(currentId);
      // If you want to reset originalDocsCount whenever you load a new summary,
      // you could do that here, but that implies re-setting state, etc.
      // For now, we'll just leave it as is.
    }
  }, [myVariable.summary?.meeting_id, localMeetingId]);


  // For auto‐resizing the Purpose textarea
  const purposeRef = useRef<HTMLTextAreaElement>(null);
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  useEffect(() => {
    adjustTextareaHeight(purposeRef.current);
  }, [meetingInfo.purpose]);

  // Generic handler for top-level text fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setMeetingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    onUpdate(meetingInfo);
  }, [meetingInfo, onUpdate]);

  // For Facilitator, Documenter, etc. using <SelectNames />
  const handleSelection = (fieldName: string, selectedNames: string) => {
    setMeetingInfo((prev) => ({
      ...prev,
      [fieldName]: selectedNames
    }));
  };

  // For <TimestampedVideo />
  const handleVideoDataUpdate = useCallback((newVideoData: any) => {
    setMeetingInfo((prev) => ({
      ...prev,
      timestampedVideo: newVideoData
    }));
  }, []);

  // For <WorkingDocs />: updates the entire array of docs
  const handleWorkingDocsChange = (updatedDocs: any[]) => {
    setMeetingInfo((prev) => ({
      ...prev,
      workingDocs: updatedDocs
    }));
  };

  // Simple example: add a new doc (client-side) 
  const addNewDoc = () => {
    setMeetingInfo((prev) => ({
      ...prev,
      workingDocs: [...prev.workingDocs, { title: "", link: "" }]
    }));
  };

  // Example: remove a new doc (one above originalDocsCount)
  const removeDoc = (newDocIndex: number) => {
    setMeetingInfo((prev) => {
      const updated = [...prev.workingDocs];
      // Because newDocIndex references only the newly added items
      // after the old ones. So the actual array index is oldDocsCount + newDocIndex
      const removeIndex = originalDocsCount + newDocIndex;
      updated.splice(removeIndex, 1);
      return { ...prev, workingDocs: updated };
    });
  };

  // Example: handle updating a newly added doc
  const handleNewDocChange = (e: any, newDocIndex: number) => {
    const { name, value } = e.target;
    setMeetingInfo((prev) => {
      const updated = [...prev.workingDocs];
      // actual array index:
      const arrayIndex = originalDocsCount + newDocIndex;
      updated[arrayIndex] = {
        ...updated[arrayIndex],
        [name]: value
      };
      return { ...prev, workingDocs: updated };
    });
  };

  // Example: handle updating an old doc
  const updateMyVariableForOldDoc = (e: any | null, oldDocIndex: number) => {
    if (e === null) {
      // Means remove
      setMeetingInfo((prev) => {
        const updated = [...prev.workingDocs];
        updated.splice(oldDocIndex, 1);
        return { ...prev, workingDocs: updated };
      });
      // TODO: Make an API call or store something to actually remove from DB
    } else {
      // It's a change event
      const { name, value } = e.target;
      setMeetingInfo((prev) => {
        const updated = [...prev.workingDocs];
        updated[oldDocIndex] = {
          ...updated[oldDocIndex],
          [name]: value
        };
        return { ...prev, workingDocs: updated };
      });
      // TODO: Possibly do an API call to update DB in real-time, etc.
    }
  };

  return (
    <div className={styles['form-column-flex']}>
      <div className={styles['row-flex-start']}>
        <div className={styles['form-column-flex']}>
          <div className={styles['row-flex-space-between']}>
            <div className={styles['column-flex']}>
              {myVariable.workgroup?.preferred_template?.meetingInfo?.name == 1 && (
                <MeetingTypeSelect
                  workgroup={workgroup}
                  value={meetingInfo.name}
                  onChange={handleChange}
                />
              )}
            </div>
            <div className={styles['column-flex']}>
              {myVariable.workgroup?.preferred_template?.meetingInfo?.date == 1 && (
                <>
                  <label className={styles['form-label']}>Meeting Date:</label>
                  <input
                    type="date"
                    name="date"
                    value={meetingInfo.date || ""}
                    onChange={handleChange}
                    className={styles['form-select']}
                  />
                </>
              )}
            </div>
          </div>

          <div className={styles['row-flex-start']}>
            {/* Facilitator */}
            {myVariable.workgroup?.preferred_template?.meetingInfo?.host == 1 && (
              <div className={styles.people1}>
                <label className={styles['form-label']}>Facilitator:</label>
                <SelectNames
                  key={meetingInfo.host}
                  onSelect={(selected: any) => handleSelection('host', selected)}
                  initialValue={meetingInfo.host || ""}
                />
              </div>
            )}

            {/* Documenter */}
            {myVariable.workgroup?.preferred_template?.meetingInfo?.documenter == 1 && (
              <div className={styles.people2}>
                <label className={styles['form-label']}>Documenter:</label>
                <SelectNames
                  key={meetingInfo.documenter}
                  onSelect={(selected: any) => handleSelection('documenter', selected)}
                  initialValue={meetingInfo.documenter || ""}
                />
              </div>
            )}

            {/* Translator */}
            {myVariable.workgroup?.preferred_template?.meetingInfo?.translator == 1 && (
              <div className={styles.people3}>
                <label className={styles['form-label']}>Translator:</label>
                <SelectNames
                  key={meetingInfo.translator}
                  onSelect={(selected: any) => handleSelection('translator', selected)}
                  initialValue={meetingInfo.translator || ""}
                />
              </div>
            )}
          </div>

          {/* People present */}
          <div className={styles['row-flex-start']}>
            {myVariable.workgroup?.preferred_template?.meetingInfo?.peoplePresent == 1 && (
              <div className={styles.people2}>
                <label className={styles['form-label']}>Present:</label>
                <SelectNames
                  key={meetingInfo.peoplePresent}
                  onSelect={(selected: any) => handleSelection('peoplePresent', selected)}
                  initialValue={meetingInfo.peoplePresent || ""}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right‐side links column */}
        <div className={styles['links-column-flex']}>
          {myVariable.workgroup?.preferred_template?.meetingInfo?.purpose == 1 && (
            <>
              <label className={styles['form-label']}>Purpose:</label>
              <textarea
                ref={purposeRef}
                name="purpose"
                value={meetingInfo.purpose || ""}
                onChange={(e) => {
                  handleChange(e);
                  adjustTextareaHeight(purposeRef.current);
                }}
                className={styles['form-input']}
                autoComplete="off"
              />
            </>
          )}

          {myVariable.workgroup?.preferred_template?.meetingInfo?.townHallNumber == 1 && (
            <>
              <label className={styles['form-label']}>Town Hall Number:</label>
              <input
                type="text"
                name="townHallNumber"
                value={meetingInfo.townHallNumber || ""}
                onChange={handleChange}
                className={styles['form-select']}
                autoComplete="off"
              />
            </>
          )}

          {myVariable.workgroup?.preferred_template?.meetingInfo?.meetingVideoLink == 1 && (
            <>
              <label className={styles['form-label']}>Meeting video (link):</label>
              <input
                type="text"
                name="meetingVideoLink"
                value={meetingInfo.meetingVideoLink || ""}
                onChange={handleChange}
                className={styles['form-select']}
                autoComplete="off"
              />
            </>
          )}

          {myVariable.workgroup?.preferred_template?.meetingInfo?.miroBoardLink == 1 && (
            <>
              <label className={styles['form-label']}>Miro board (link):</label>
              <input
                type="text"
                name="miroBoardLink"
                value={meetingInfo.miroBoardLink || ""}
                onChange={handleChange}
                className={styles['form-select']}
                autoComplete="off"
              />
            </>
          )}

          {myVariable.workgroup?.preferred_template?.meetingInfo?.otherMediaLink == 1 && (
            <>
              <label className={styles['form-label']}>Other media (link):</label>
              <input
                type="text"
                name="otherMediaLink"
                value={meetingInfo.otherMediaLink || ""}
                onChange={handleChange}
                className={styles['form-select']}
                autoComplete="off"
              />
            </>
          )}

          {myVariable.workgroup?.preferred_template?.meetingInfo?.transcriptLink == 1 && (
            <>
              <label className={styles['form-label']}>Transcript (link):</label>
              <input
                type="text"
                name="transcriptLink"
                value={meetingInfo.transcriptLink || ""}
                onChange={handleChange}
                className={styles['form-select']}
                autoComplete="off"
              />
            </>
          )}

          {myVariable.workgroup?.preferred_template?.meetingInfo?.mediaLink == 1 && (
            <>
              <label className={styles['form-label']}>Media (link):</label>
              <input
                type="text"
                name="mediaLink"
                value={meetingInfo.mediaLink || ""}
                onChange={handleChange}
                className={styles['form-select']}
                autoComplete="off"
              />
            </>
          )}
        </div>
      </div>

      {myVariable.workgroup?.preferred_template?.meetingInfo?.workingDocs == 1 && (
        <WorkingDocs
          /** Pass the entire docs array from state */
          docs={meetingInfo.workingDocs}
          /** 
           * This is how many came from DB originally. 
           * We stored that as a state above. 
           */
          originalDocsCount={originalDocsCount}
          /** 
           * Called when a newly added doc changes:
           * We'll define a function that updates 
           * the doc at array index (originalDocsCount + newDocIdx).
           */
          handleChange={handleNewDocChange}
          /** Called to add a new doc to the array: */
          addNewDoc={addNewDoc}
          /** Called to remove a newly added doc from the array: */
          removeDoc={removeDoc}
          /** 
           * Called to update or remove an old doc 
           * (where index < originalDocsCount).
           */
          updateMyVariable={updateMyVariableForOldDoc}
        />
      )}

      {myVariable.workgroup?.preferred_template?.meetingInfo?.googleSlides == 1 && (
        <>
          <label className={styles['form-label']}>Google Slides (Optional):</label>
          <input
            type="text"
            name="googleSlides"
            value={meetingInfo.googleSlides || ""}
            onChange={handleChange}
            className={styles['form-select']}
            autoComplete="off"
          />
        </>
      )}

      {myVariable.workgroup?.preferred_template?.meetingInfo?.timestampedVideo == 1 && (
        <TimestampedVideo
          onUpdate={handleVideoDataUpdate}
          initialData={meetingInfo.timestampedVideo}
        />
      )}
    </div>
  );
};

export default SummaryMeetingInfo;
