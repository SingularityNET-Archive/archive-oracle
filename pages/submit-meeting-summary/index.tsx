// pages/submit-meeting-summary/index.tsx
import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from 'next/router';
import Modal from 'react-modal'; 
import styles from '../../styles/meetingsummary.module.css';
import SummaryTemplate from '../../components/SummaryTemplate';
import ArchiveSummaries from '../../components/ArchiveSummaries';
import { useMyVariable } from '../../context/MyVariableContext';
import { getWorkgroups } from '../../utils/getWorkgroups';
import { updateWorkgroups } from '../../utils/updateWorkgroups';
import { getSummaries } from '../../utils/getsummaries';
import { getNames } from '../../utils/getNames';
import { getTags } from '../../utils/getTags';

type Workgroup = {
  workgroup_id: string;
  workgroup: string;
  last_meeting_id: string;
  preferred_template: string;
};

type Names = {
  value: any;
  label: any;
};

// Configure ReactModal
Modal.setAppElement('#__next'); 

// Include new summary states in union
type SelectionMode = 
  | "edit"
  | "cleanNew"
  | "prefilledNew"
  | "noSummaryGiven"
  | "canceledSummary"
  | "";

const SubmitMeetingSummary: NextPage = () => {
  const router = useRouter();
  const { myVariable, setMyVariable } = useMyVariable();

  // Local state
  const [activeComponent, setActiveComponent] = useState('');
  const [workgroups, setWorkgroups] = useState<Workgroup[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [showNewWorkgroupInput, setShowNewWorkgroupInput] = useState(false);
  const [newWorkgroup, setNewWorkgroup] = useState('');
  const [selectedWorkgroupId, setSelectedWorkgroupId] = useState('');
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [names, setNames] = useState<Names[]>([]);
  const [tags, setTags] = useState({});

  // Modal-related state
  const [showModal, setShowModal] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("");
  const [selectedSummaryForEdit, setSelectedSummaryForEdit] = useState("");
  const [newSummaryDate, setNewSummaryDate] = useState("");

  // Agenda item order mapping
  const orderMapping = {
    "Gamers Guild": ["narrative", "discussionPoints", "decisionItems", "actionItems", "gameRules", "leaderboard"],
    "Writers Workgroup": ["narrative", "decisionItems", "actionItems", "learningPoints"],
    "Video Workgroup": ["discussionPoints", "decisionItems", "actionItems"],
    "Archives Workgroup": ["decisionItems", "actionItems", "learningPoints"],
    "Treasury Guild": ["discussionPoints", "decisionItems", "actionItems"],
    "Treasury Policy WG": ["discussionPoints", "decisionItems", "actionItems"],
    "Treasury Automation WG": ["discussionPoints", "decisionItems", "actionItems"],
    "Dework PBL": ["discussionPoints", "decisionItems", "actionItems"],
    "Knowledge Base Workgroup": ["discussionPoints", "decisionItems", "actionItems"],
    "Onboarding Workgroup": ["townHallUpdates", "discussionPoints", "decisionItems", "actionItems", "learningPoints", "issues"],
    "Research and Development Guild": ["meetingTopics", "discussionPoints", "decisionItems", "actionItems"],
    "Governance Workgroup": ["narrative", "discussionPoints", "decisionItems", "actionItems"],
    "Education Workgroup": ["meetingTopics", "discussionPoints", "decisionItems", "actionItems"],
    "Marketing Guild": ["discussionPoints", "decisionItems", "actionItems"],
    "Ambassador Town Hall": ["townHallSummary"],
    "Deep Funding Town Hall": ["townHallSummary"],
    "One-off Event": ["Narative"],
    "AI Ethics WG": ["narrative", "decisionItems", "actionItems"],
    "African Guild": ["narrative", "decisionItems", "actionItems"],
    "Strategy Guild": ["narrative", "decisionItems", "actionItems"],
    "LatAm Guild": ["narrative", "decisionItems", "actionItems"],
    "WG Sync Call": ["meetingTopics", "discussion", "decisionItems", "actionItems", "issues"],
    "AI Sandbox/Think-tank": ["townHallUpdates", "discussionPoints", "decisionItems", "actionItems", "learningPoints", "issues"],
    "GitHub PBL WG": ["discussionPoints", "decisionItems", "actionItems"]
  };

  // -----------------------------------------
  // Fetch the list of Workgroups on mount
  // -----------------------------------------
  useEffect(() => {
    getWorkgroupList();
  }, []);

  // useEffect to check URL for a workgroup_id and load the modal
  useEffect(() => {
    if (!router.isReady) return; // wait until router is ready
    const workgroupFromUrl = router.query.workgroup;
    if (workgroupFromUrl) {
      if (workgroupFromUrl === "add_new") {
        // Handle "add new" workgroup logic if needed
        setNewWorkgroup('');
        setShowNewWorkgroupInput(true);
        setSelectedWorkgroupId('');
        setActiveComponent('');
      } else {
        // Set the selected workgroup id from URL
        setSelectedWorkgroupId(workgroupFromUrl as string);
        setShowNewWorkgroupInput(false);
        setIsLoading(true);

        // Fetch existing summaries for the workgroup from URL
        getSummaries(workgroupFromUrl as string)
          .then((existingSummaries) => {
            setMeetings(existingSummaries);
            // Open the modal after fetching summaries
            setShowModal(true);
            setSelectionMode("");
            setSelectedSummaryForEdit("");
            setNewSummaryDate("");
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [router.isReady, router.query.workgroup]);

  async function getWorkgroupList() {
    setIsLoading(true);
    const workgroupList: any = await getWorkgroups();
    const names1 = await getNames();
    const tags1 = await getTags();

    // Sort alphabetically
    const sortedWorkgroups = workgroupList.sort((a: Workgroup, b: Workgroup) =>
      a.workgroup.localeCompare(b.workgroup)
    );

    let newNames = names1.map((value: any) => ({ value: value.name, label: value.name }));

    let otherTags = tags1
      .filter((tag: any) => tag.type === 'other')
      .map((tag: any) => ({ value: tag.tag, label: tag.tag }));

    let emotionTags = tags1
      .filter((tag: any) => tag.type === 'emotions')
      .map((tag: any) => ({ value: tag.tag, label: tag.tag }));

    let topicTags = tags1
      .filter((tag: any) => tag.type === 'topicsCovered')
      .map((tag: any) => ({ value: tag.tag, label: tag.tag }));

    let referenceTags = tags1
      .filter((tag: any) => tag.type === 'references')
      .map((tag: any) => ({ value: tag.tag, label: tag.tag }));

    let gamesPlayedTags = tags1
      .filter((tag: any) => tag.type === 'gamesPlayed')
      .map((tag: any) => ({ value: tag.tag, label: tag.tag }));

    setWorkgroups(sortedWorkgroups);
    setNames(newNames);
    setTags({
      other: otherTags,
      emotions: emotionTags,
      topicsCovered: topicTags,
      references: referenceTags,
      gamesPlayed: gamesPlayedTags
    });
    setIsLoading(false);
  }

  // -----------------------------------------
  // Handle Workgroup selection -> open modal
  // -----------------------------------------
  async function handleSelectChange(e: any) {
    const selectedId = e.target.value;

    // If the modal is open, close it first
    if (showModal) {
      setShowModal(false);
    }

    if (selectedId === 'add_new') {
      // Show new WG input
      setNewWorkgroup('');
      setShowNewWorkgroupInput(true);
      setSelectedWorkgroupId('');
      setActiveComponent('');
      router.push(`/submit-meeting-summary?workgroup=add_new`, undefined, { shallow: true });
      return;
    }

    setSelectedWorkgroupId(selectedId);
    setShowNewWorkgroupInput(false);
    setIsLoading(true);

    // fetch existing summaries for that WG
    const existingSummaries = await getSummaries(selectedId);
    setMeetings(existingSummaries);
    setIsLoading(false);

    // push route to reflect selected workgroup
    router.push(`/submit-meeting-summary?workgroup=${selectedId}`, undefined, { shallow: true });

    // Open modal
    setShowModal(true);
    setSelectionMode("");
    setSelectedSummaryForEdit("");
    setNewSummaryDate("");
  }

  // -----------------------------------------
  // (If used) for existing Meeting in UI
  // -----------------------------------------
  async function handleSelectChange2(e: any) {
    const newSelectedMeetingId = e.target.value;
    setSelectedMeetingId(newSelectedMeetingId);

    const selectedSummary = meetings.find((m: any) => m.meeting_id === newSelectedMeetingId);
    if (selectedSummary) {
      setMyVariable((prev) => ({
        ...prev,
        summary: selectedSummary
      }));
    }
  }

  // -----------------------------------------
  // Add New Workgroup logic
  // -----------------------------------------
  const handleNewWorkgroupChange = (e: any) => {
    setNewWorkgroup(e.target.value);
  };

  const handleRegisterNewWorkgroup = async () => {
    setIsLoading(true);
    const existingWorkgroup = workgroups.find(
      (w) => w.workgroup.toLowerCase() === newWorkgroup.toLowerCase()
    );
    if (existingWorkgroup) {
      setSelectedWorkgroupId(existingWorkgroup.workgroup_id);
      setShowNewWorkgroupInput(false);
    } else {
      await updateWorkgroups({ workgroup: newWorkgroup });
      const updatedWorkgroupList: any = await getWorkgroups();
      setWorkgroups(updatedWorkgroupList);
      const newWorkgroupEntry = updatedWorkgroupList.find(
        (w: any) => w.workgroup.toLowerCase() === newWorkgroup.toLowerCase()
      );
      if (newWorkgroupEntry) {
        setSelectedWorkgroupId(newWorkgroupEntry.workgroup_id);
        setMyVariable((prev) => ({
          ...prev,
          workgroup: newWorkgroupEntry,
          names,
          tags
        }));
      }
      setShowNewWorkgroupInput(false);
    }
    setIsLoading(false);
  };

  // -----------------------------------------
  // Utility functions
  // -----------------------------------------
  function formatDate(isoString: any) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const date = new Date(isoString);
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    return `${day} ${months[monthIndex]} ${year}`;
  }

  const updateMeetings = (newMeetingSummary: any) => {
    setMeetings((prevMeetings) => {
      let updated = [...prevMeetings];
      const meetingIndex = updated.findIndex((m: any) => m.meeting_id === newMeetingSummary.meeting_id);

      if (meetingIndex !== -1) {
        updated[meetingIndex] = newMeetingSummary;
      } else {
        updated.unshift(newMeetingSummary);
      }
      updated = updated.sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setSelectedMeetingId(newMeetingSummary.meeting_id);
      return updated;
    });
  };

  // Decides which component to show in main content
  function getComponent() {
    switch (activeComponent) {
      case 'two':
        // Replace this condition with your actual condition
        if (myVariable.summary?.noSummaryGiven || myVariable.summary?.canceledSummary) {
          window.location.reload();
          return null;
        }
        return (
          <SummaryTemplate
            key={selectedWorkgroupId}
            updateMeetings={updateMeetings}
          />
        );
      case 'four':
        return <ArchiveSummaries key={selectedWorkgroupId} />;
      default:
        return <div></div>;
    }
  }
  

  // -----------------------------------------
  // Confirm selection from Modal
  // -----------------------------------------
  const confirmModalSelection = () => {
    setShowModal(false);
    if (!selectedWorkgroupId) return;

    const chosenWorkgroup = workgroups.find((wg) => wg.workgroup_id === selectedWorkgroupId);

    if (selectionMode === "edit") {
      // Edit existing
      const existing = meetings.find((m) => m.meeting_id === selectedSummaryForEdit);
      if (existing) {
        setMyVariable((prev) => ({
          ...prev,
          workgroup: chosenWorkgroup,
          summary: existing,
          summaries: meetings,
          names,
          tags,
          agendaItemOrder: orderMapping
        }));
        setSelectedMeetingId(existing.meeting_id);
      }
      setActiveComponent('two');
    }
    else if (selectionMode === "cleanNew") {
      // New clean summary
      const newClean = {
        workgroup: chosenWorkgroup?.workgroup || "",
        workgroup_id: selectedWorkgroupId,
        meetingInfo: {
          name: "Weekly",
          date: newSummaryDate,
          host: "",
          documenter: "",
          translator: "",
          peoplePresent: "",
          purpose: "",
          townHallNumber: "",
          googleSlides: "",
          meetingVideoLink: "",
          miroBoardLink: "",
          otherMediaLink: "",
          transcriptLink: "",
          mediaLink: "",
          workingDocs: [{ title: "", link: "" }],
          timestampedVideo: { url: "", intro: "", timestamps: "" }
        },
        agendaItems: [],
        tags: {},
        type: "Custom",
        noSummaryGiven: false,
        canceledSummary: false,
        noSummaryGivenText: "No Summary Given",
        canceledSummaryText: "Meeting was cancelled",
        updated_at: new Date()
      };

      setMyVariable((prev) => ({
        ...prev,
        workgroup: chosenWorkgroup,
        summary: newClean,
        summaries: meetings,
        names,
        tags,
        agendaItemOrder: orderMapping
      }));
      setActiveComponent('two');
    }
    else if (selectionMode === "prefilledNew") {
      // New prefilled summary from last
      if (meetings.length > 0) {
        const lastSummary = meetings[0];
        const newPrefilled = {
          ...lastSummary,
          meeting_id: undefined,
          workgroup_id: selectedWorkgroupId,
          workgroup: chosenWorkgroup?.workgroup || "",
          meetingInfo: {
            ...lastSummary.meetingInfo,
            date: newSummaryDate
          },
          updated_at: new Date(),
          confirmed: false,
          noSummaryGiven: false,
          canceledSummary: false,
          noSummaryGivenText: "No Summary Given",
          canceledSummaryText: "Meeting was cancelled"
        };
        setMyVariable((prev) => ({
          ...prev,
          workgroup: chosenWorkgroup,
          summary: newPrefilled,
          summaries: meetings,
          names,
          tags,
          agendaItemOrder: orderMapping
        }));
      } else {
        // If no prior summaries, treat it like a clean summary
        const newClean = {
          workgroup: chosenWorkgroup?.workgroup || "",
          workgroup_id: selectedWorkgroupId,
          meetingInfo: {
            name: "Weekly",
            date: newSummaryDate,
            host: "",
            documenter: "",
            translator: "",
            peoplePresent: "",
            purpose: "",
            townHallNumber: "",
            googleSlides: "",
            meetingVideoLink: "",
            miroBoardLink: "",
            otherMediaLink: "",
            transcriptLink: "",
            mediaLink: "",
            workingDocs: [{ title: "", link: "" }],
            timestampedVideo: { url: "", intro: "", timestamps: "" }
          },
          agendaItems: [],
          tags: {},
          type: "Custom",
          noSummaryGiven: false,
          canceledSummary: false,
          noSummaryGivenText: "No Summary Given",
          canceledSummaryText: "Meeting was cancelled",
          updated_at: new Date()
        };
        setMyVariable((prev) => ({
          ...prev,
          workgroup: chosenWorkgroup,
          summary: newClean,
          summaries: meetings,
          names,
          tags,
          agendaItemOrder: orderMapping
        }));
      }
      setActiveComponent('two');
    }
    else if (selectionMode === "noSummaryGiven") {
      // Mark as noSummaryGiven
      const newNoSummary = {
        workgroup: chosenWorkgroup?.workgroup || "",
        workgroup_id: selectedWorkgroupId,
        meetingInfo: {
          name: "Weekly",
          date: newSummaryDate
        },
        agendaItems: [],
        tags: {},
        noSummaryGiven: true,
        canceledSummary: false,
        noSummaryGivenText: "No Summary Given",
        updated_at: new Date()
      };
      setMyVariable((prev) => ({
        ...prev,
        workgroup: chosenWorkgroup,
        summary: newNoSummary,
        summaries: meetings,
        names,
        tags,
        agendaItemOrder: orderMapping
      }));
      setActiveComponent('four');
    }
    else if (selectionMode === "canceledSummary") {
      // Mark as canceled
      const newCanceledSummary = {
        workgroup: chosenWorkgroup?.workgroup || "",
        workgroup_id: selectedWorkgroupId,
        meetingInfo: {
          name: "Weekly",
          date: newSummaryDate
        },
        agendaItems: [],
        tags: {},
        noSummaryGiven: false,
        canceledSummary: true,
        canceledSummaryText: "Meeting was cancelled",
        updated_at: new Date()
      };
      setMyVariable((prev) => ({
        ...prev,
        workgroup: chosenWorkgroup,
        summary: newCanceledSummary,
        summaries: meetings,
        names,
        tags,
        agendaItemOrder: orderMapping
      }));
      setActiveComponent('four');
    }
  };

  const currentWorkgroup = workgroups.find((wg) => wg.workgroup_id === selectedWorkgroupId);

  const hasDateConflict =
  selectionMode === "cleanNew" &&
  newSummaryDate &&
  meetings.some((m: any) => {
    // Use meetingInfo.date if available to avoid timezone conversion issues.
    const meetingDate = m.meetingInfo?.date || m.date.split("T")[0];
    return meetingDate === newSummaryDate && m.username === myVariable.currentUser;
  });
  
  return (
    <div className={styles.container}>
      {/* ---------- MODAL ---------- */}
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
        contentLabel="Select Summary Option"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          content: {
            position: "relative",
            inset: "unset",
            maxWidth: "500px",
            margin: "auto",
            borderRadius: "8px",
            padding: "1rem",
            backgroundColor: "#fff",
          },
        }}
      >
        <h2>Select how you want to proceed</h2>
        {currentWorkgroup && (
          <p>
            <strong>Workgroup:</strong> {currentWorkgroup.workgroup}
          </p>
        )}
        <div style={{ marginTop: "1rem" }}>
          {/* 1. Edit existing summary */}
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <input
              type="radio"
              value="edit"
              checked={selectionMode === 'edit'}
              onChange={() => setSelectionMode('edit')}
            />
            Edit an existing summary
          </label>
          {selectionMode === 'edit' && (
            <select
              style={{ display: 'block', marginBottom: '1rem' }}
              onChange={(e) => setSelectedSummaryForEdit(e.target.value)}
              value={selectedSummaryForEdit}
            >
              <option value="">Choose existing summary</option>
              {meetings.map((meeting) => (
                <option key={meeting.meeting_id} value={meeting.meeting_id} style={{ color: meeting.confirmed ? 'lightgreen' : 'black' }}>
                  {formatDate(meeting.date)} - {meeting.username} {meeting.confirmed ? 'Archived' : ''}
                </option>
              ))}
            </select>
          )}

          {/* 2. Clean new summary */}
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            <input
              type="radio"
              value="cleanNew"
              checked={selectionMode === "cleanNew"}
              onChange={() => setSelectionMode("cleanNew")}
            />
            Create a new <strong>clean</strong> summary
          </label>
          {selectionMode === "cleanNew" && (
            <div style={{ marginLeft: "1.5rem", marginBottom: "1rem" }}>
              <label>
                Select meeting date:{" "}
                <input
                  type="date"
                  value={newSummaryDate}
                  onChange={(e) => setNewSummaryDate(e.target.value)}
                />
              </label>
              {hasDateConflict && (
                <p style={{ color: "red", fontWeight: "bold" }}>
                  You already have a summary for this date. Please choose a
                  different date or choose to edit the existing summary above
                </p>
              )}
            </div>
          )}

          {/* Only show these if admin */}
          {myVariable.roles?.isAdmin && (
            <>
              {/* 4. No Summary Given */}
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                <input
                  type="radio"
                  value="noSummaryGiven"
                  checked={selectionMode === 'noSummaryGiven'}
                  onChange={() => setSelectionMode('noSummaryGiven')}
                />
                No summary was given (set “noSummaryGiven” flag)
              </label>
              {selectionMode === 'noSummaryGiven' && (
                <div style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                  <label>
                    Select meeting date:{" "}
                    <input
                      type="date"
                      value={newSummaryDate}
                      onChange={(e) => setNewSummaryDate(e.target.value)}
                    />
                  </label>
                </div>
              )}

              {/* 5. Canceled Summary */}
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                <input
                  type="radio"
                  value="canceledSummary"
                  checked={selectionMode === 'canceledSummary'}
                  onChange={() => setSelectionMode('canceledSummary')}
                />
                Meeting was canceled (set “canceledSummary” flag)
              </label>
              {selectionMode === 'canceledSummary' && (
                <div style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
                  <label>
                    Select meeting date:{" "}
                    <input
                      type="date"
                      value={newSummaryDate}
                      onChange={(e) => setNewSummaryDate(e.target.value)}
                    />
                  </label>
                </div>
              )}
            </>
          )}
        </div>

        <button
          style={{ marginTop: '1rem' }}
          onClick={confirmModalSelection}
          disabled={
            !selectionMode ||
            (selectionMode === 'edit' && !selectedSummaryForEdit) ||
            (
              (selectionMode === 'cleanNew' && (!newSummaryDate || hasDateConflict)) ||
              ((selectionMode === 'noSummaryGiven' || selectionMode === 'canceledSummary') && !newSummaryDate)
            )
          }
        >
          Confirm
        </button>

      </Modal>
      {/* ---------- /MODAL ---------- */}

      <div className={styles.navbar}>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {workgroups.length > 0 && (
              <div className={styles['column-flex']}>
                <label className={styles['form-label']} htmlFor="">
                  Select Workgroup
                </label>
                <select
                  className={`${styles.select} ${selectedWorkgroupId === '' ? styles.selectGreen : ''}`}
                  value={selectedWorkgroupId}
                  onChange={handleSelectChange}
                  title="Select a workgroup"
                >
                  <option value="" disabled>Please select Workgroup</option>
                  {workgroups.map((workgroup: any) => (
                    <option key={workgroup.workgroup_id} value={workgroup.workgroup_id}>
                      {workgroup.workgroup}
                    </option>
                  ))}
                  {myVariable.roles?.isAdmin && (
                    <option value="add_new">Add new WG</option>
                  )}
                </select>
              </div>
            )}

            {showNewWorkgroupInput && (
              <>
                <input
                  className={styles.register}
                  type="text"
                  value={newWorkgroup}
                  autoComplete="off"
                  onChange={handleNewWorkgroupChange}
                />
                <button
                  className={styles.registerbutton}
                  onClick={handleRegisterNewWorkgroup}
                >
                  Register New Workgroup
                </button>
              </>
            )}
          </>
        )}

        {/* Buttons for navigation if a WG is selected */}
        {selectedWorkgroupId && (
          <>
            {myVariable.roles?.isAdmin && (
              <button
                className={styles.navButton}
                onClick={() => setActiveComponent('two')}
              >
                Summary
              </button>
            )}
            {myVariable.roles?.isAdmin && (
              <button
                className={styles.navButton}
                onClick={() => setActiveComponent('four')}
              >
                Archive Summaries
              </button>
            )}
          </>
        )}
      </div>

      {/* Main content logic */}
      {myVariable.isLoggedIn && selectedWorkgroupId && (
        <div className={styles.mainContent}>{getComponent()}</div>
      )}
      {myVariable.isLoggedIn && !selectedWorkgroupId && !isLoading && (
        <div className={styles.nomainContent}>
          <h2>Please select workgroup</h2>
        </div>
      )}
      {!myVariable.isLoggedIn && (
        <div className={styles.pleaseSignIn}>
          <div>
            <h3>Please sign in with Discord</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitMeetingSummary;
