import { useEffect, useState } from "react";
import type { NextPage } from "next";
import styles from "../styles/admintools.module.css";
import { supabase } from "../lib/supabaseClient";
import { getWorkgroups } from "../utils/getWorkgroups";
import { useMyVariable } from "../context/MyVariableContext";
import Modal from "react-modal";

type Workgroup = {
  workgroup_id: string;
  workgroup: string;
};

type AdminSummary = {
  meeting_id: string;
  user_id: string;
  date: string;
  updated_at: string;
  confirmed: boolean | null;
  summary: any;
};

const AdminUnconfirmedSummaries: NextPage = () => {
  const { myVariable } = useMyVariable();
  const isAdmin = myVariable.roles?.appRole === "admin";

  const [workgroups, setWorkgroups] = useState<Workgroup[]>([]);
  const [selectedWorkgroupId, setSelectedWorkgroupId] = useState<string>("");
  const [summaries, setSummaries] = useState<AdminSummary[]>([]);
  const [loadingWorkgroups, setLoadingWorkgroups] = useState<boolean>(false);
  const [loadingSummaries, setLoadingSummaries] = useState<boolean>(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [previewSummary, setPreviewSummary] = useState<AdminSummary | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const loadWorkgroups = async () => {
      setLoadingWorkgroups(true);
      setError("");
      try {
        const list: any = await getWorkgroups();
        const sorted = (list || []).sort((a: Workgroup, b: Workgroup) =>
          a.workgroup.localeCompare(b.workgroup)
        );
        setWorkgroups(sorted);
      } catch (e: any) {
        setError("Failed to load workgroups.");
        console.error(e);
      } finally {
        setLoadingWorkgroups(false);
      }
    };

    loadWorkgroups();
  }, [isAdmin]);

  useEffect(() => {
    // Configure react-modal for accessibility
    if (typeof window !== "undefined") {
      Modal.setAppElement("#__next");
    }
  }, []);

  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    return `${day} ${months[monthIndex]} ${year}`;
  };

  const handleWorkgroupChange = async (workgroupId: string) => {
    setSelectedWorkgroupId(workgroupId);
    setSummaries([]);
    if (!workgroupId) return;

    setLoadingSummaries(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("meetingsummaries")
        .select("date, meeting_id, user_id, confirmed, summary, updated_at")
        .eq("workgroup_id", workgroupId)
        .or("confirmed.is.null,confirmed.eq.false")
        .order("date", { ascending: false })
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setSummaries((data as any) || []);
    } catch (e: any) {
      setError("Failed to load summaries.");
      console.error(e);
    } finally {
      setLoadingSummaries(false);
    }
  };

  const makeKey = (s: AdminSummary) => `${s.meeting_id}-${s.user_id}-${s.date}-${s.updated_at}`;

  const handleDelete = async (summary: AdminSummary) => {
    if (!window.confirm("Are you sure you want to delete this summary?")) {
      return;
    }

    const key = makeKey(summary);
    setDeletingKey(key);
    setError("");
    try {
      const { error } = await supabase
        .from("meetingsummaries")
        .delete()
        .eq("workgroup_id", selectedWorkgroupId)
        .eq("meeting_id", summary.meeting_id)
        .eq("user_id", summary.user_id)
        .eq("date", summary.date)
        .eq("updated_at", summary.updated_at);

      if (error) throw error;

      setSummaries((prev) => prev.filter((s) => makeKey(s) !== key));
    } catch (e: any) {
      setError("Failed to delete summary.");
      console.error(e);
    } finally {
      setDeletingKey(null);
    }
  };

  const closePreview = () => setPreviewSummary(null);

  const renderPreviewContent = (summary: AdminSummary) => {
    const data = summary.summary || {};
    const meetingInfo = data.meetingInfo || {};
    const agendaItems = Array.isArray(data.agendaItems) ? data.agendaItems : [];
    const tags = data.tags || {};

    const infoRow = (label: string, value?: string) =>
      value ? (
        <p>
          <strong>{label}: </strong>
          {value}
        </p>
      ) : null;

    return (
      <div>
        <h2>
          {data.workgroup || "Workgroup"} – {meetingInfo.date || summary.date}
        </h2>

        <h3>Meeting Info</h3>
        {infoRow("Type", meetingInfo.name)}
        {infoRow("Host", meetingInfo.host)}
        {infoRow("Documenter", meetingInfo.documenter)}
        {infoRow("Translator", meetingInfo.translator)}
        {infoRow("People Present", meetingInfo.peoplePresent)}
        {infoRow("Purpose", meetingInfo.purpose)}
        {infoRow("Town Hall Number", meetingInfo.townHallNumber)}
        {infoRow("Google Slides", meetingInfo.googleSlides)}
        {infoRow("Meeting Video Link", meetingInfo.meetingVideoLink)}
        {infoRow("Miro Board Link", meetingInfo.miroBoardLink)}
        {infoRow("Other Media Link", meetingInfo.otherMediaLink)}
        {infoRow("Transcript Link", meetingInfo.transcriptLink)}
        {infoRow("Media Link", meetingInfo.mediaLink)}

        {Array.isArray(meetingInfo.workingDocs) && meetingInfo.workingDocs.length > 0 && (
          <div>
            <h4>Working Docs</h4>
            <ul>
              {meetingInfo.workingDocs.map((doc: any, idx: number) => (
                <li key={idx}>
                  {doc.title && <strong>{doc.title}: </strong>}
                  {doc.link}
                </li>
              ))}
            </ul>
          </div>
        )}

        {meetingInfo.timestampedVideo &&
          (meetingInfo.timestampedVideo.url ||
            meetingInfo.timestampedVideo.intro ||
            meetingInfo.timestampedVideo.timestamps) && (
            <div>
              <h4>Timestamped Video</h4>
              {infoRow("URL", meetingInfo.timestampedVideo.url)}
              {infoRow("Intro", meetingInfo.timestampedVideo.intro)}
              {infoRow("Timestamps", meetingInfo.timestampedVideo.timestamps)}
            </div>
          )}

        {agendaItems.length > 0 && (
          <div>
            <h3>Agenda Items</h3>
            {agendaItems.map((item: any, idx: number) => (
              <div key={idx} style={{ marginBottom: "1rem" }}>
                {(agendaItems.length > 1 || item.agenda) && (
                  <h4>
                    #{idx + 1} – {item.agenda || "(No agenda title)"}
                  </h4>
                )}
                {infoRow("Status", item.status)}
                {infoRow("Town Hall Updates", item.townHallUpdates)}
                {infoRow("Town Hall Summary", item.townHallSummary)}
                {infoRow("Narrative", item.narrative)}
                {infoRow("Discussion", item.discussion)}
                {infoRow("Game Rules", item.gameRules)}

                {Array.isArray(item.meetingTopics) && item.meetingTopics.length > 0 && (
                  <p>
                    <strong>Meeting Topics: </strong>
                    {item.meetingTopics.join(", ")}
                  </p>
                )}

                {Array.isArray(item.issues) && item.issues.length > 0 && (
                  <div>
                    <strong>Issues:</strong>
                    <ul>
                      {item.issues.map((issue: any, iIdx: number) => (
                        <li key={iIdx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(item.discussionPoints) && item.discussionPoints.length > 0 && (
                  <div>
                    <strong>Discussion Points:</strong>
                    <ul>
                      {item.discussionPoints.map((pt: any, pIdx: number) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(item.learningPoints) && item.learningPoints.length > 0 && (
                  <div>
                    <strong>Learning Points:</strong>
                    <ul>
                      {item.learningPoints.map((lp: any, lIdx: number) => (
                        <li key={lIdx}>{lp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(item.leaderboard) && item.leaderboard.length > 0 && (
                  <div>
                    <strong>Leaderboard:</strong>
                    <ul>
                      {item.leaderboard.map((entry: any, eIdx: number) => (
                        <li key={eIdx}>{entry}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(item.actionItems) && item.actionItems.length > 0 && (
                  <div>
                    <strong>Action Items:</strong>
                    <ul>
                      {item.actionItems.map((ai: any, aIdx: number) => (
                        <li key={aIdx}>
                          {ai.text && <span>{ai.text}</span>}
                          {ai.assignee && <span> – Assignee: {ai.assignee}</span>}
                          {ai.dueDate && <span> – Due: {ai.dueDate}</span>}
                          {ai.status && <span> – Status: {ai.status}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(item.decisionItems) && item.decisionItems.length > 0 && (
                  <div>
                    <strong>Decision Items:</strong>
                    <ul>
                      {item.decisionItems.map((di: any, dIdx: number) => (
                        <li key={dIdx}>
                          {di.decision && <span>{di.decision}</span>}
                          {di.rationale && <span> – Rationale: {di.rationale}</span>}
                          {di.opposing && <span> – Opposing: {di.opposing}</span>}
                          {di.effect && <span> – Effect: {di.effect}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <h3>Tags</h3>
        {infoRow("Topics Covered", tags.topicsCovered)}
        {infoRow("Emotions", tags.emotions)}
        {infoRow("Other", tags.other)}
        {infoRow("Games Played", tags.gamesPlayed)}
      </div>
    );
  };

  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.heading}>Manage Unconfirmed Summaries</h1>
        <p className={styles.subheading}>
          Select a workgroup to view and delete summaries where confirmed is
          null or false.
        </p>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {loadingWorkgroups ? (
          <p>Loading workgroups...</p>
        ) : (
          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="workgroup-select" style={{ marginRight: "0.5rem" }}>
              Workgroup:
            </label>
            <select
              id="workgroup-select"
              value={selectedWorkgroupId}
              onChange={(e) => handleWorkgroupChange(e.target.value)}
            >
              <option value="">Select a workgroup</option>
              {workgroups.map((wg) => (
                <option key={wg.workgroup_id} value={wg.workgroup_id}>
                  {wg.workgroup}
                </option>
              ))}
            </select>
          </div>
        )}

        {loadingSummaries && <p>Loading summaries...</p>}

        {selectedWorkgroupId && !loadingSummaries && summaries.length === 0 && (
          <p>No unconfirmed summaries found for this workgroup.</p>
        )}

        {!loadingSummaries && summaries.length > 0 && (
          <div>
            {summaries.map((s) => {
              const summaryData = s.summary || {};
              const meetingInfo = summaryData.meetingInfo || {};
              const displayDate = meetingInfo.date || s.date?.split("T")[0] || "";
              const displayName = meetingInfo.name || "Meeting";
              const rowKey = makeKey(s);

              return (
                <div
                  key={rowKey}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "0.75rem 1rem",
                    marginBottom: "0.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <div>
                      <strong>{displayName}</strong>
                    </div>
                    <div>
                      Date: {formatDate(displayDate)} | Meeting ID: {s.meeting_id}
                    </div>
                    <div>
                      Confirmed: {s.confirmed === null ? "null" : String(s.confirmed)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className={styles.button}
                      type="button"
                      onClick={() => setPreviewSummary(s)}
                    >
                      Preview
                    </button>
                    <button
                      className={styles.button}
                      onClick={() => handleDelete(s)}
                      disabled={deletingKey === rowKey}
                    >
                      {deletingKey === rowKey ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!previewSummary}
        onRequestClose={closePreview}
        contentLabel="Summary Preview"
        style={{
          content: {
            maxWidth: "900px",
            margin: "auto",
            maxHeight: "80vh",
            overflow: "auto",
          },
        }}
      >
        <button
          type="button"
          onClick={closePreview}
          style={{ float: "right" }}
        >
          Close
        </button>
        {previewSummary && renderPreviewContent(previewSummary)}
      </Modal>
    </div>
  );
};

export default AdminUnconfirmedSummaries;
