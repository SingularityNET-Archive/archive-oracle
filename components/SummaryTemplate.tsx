// ../components/SummaryTemplate.tsx
import { useState, useEffect, useMemo, useRef } from "react";
import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual"; 
import styles from '../styles/summarytemplate.module.css'; 
import { useMyVariable } from '../context/MyVariableContext';
import SummaryMeetingInfo from './SummaryMeetingInfo'
import SummaryAgendaItems from './SummaryAgendaItems'
import Tags from './Tags'
import { saveCustomAgenda } from '../utils/saveCustomAgenda';
import { generateMarkdown } from '../utils/generateMarkdown';
import axios from "axios";
import { filterFormData } from '../utils/filterFormData';
import { getQuarterOptions, generateQuarterlyReport } from '../utils/quarterlyReportGenerator';

type SummaryTemplateProps = {
  updateMeetings: (newMeetingSummary: any) => void;
};

const defaultFormData = {
  workgroup: "",
  workgroup_id: "",
  meetingInfo: {
    name: "Weekly",
    date: "",
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
  agendaItems: [
    { 
      agenda: "", 
      status: "carry over", 
      townHallUpdates: "",
      townHallSummary: "",
      narrative: "",
      discussion: "",
      gameRules: "",
      meetingTopics:[""],
      issues: [""],
      actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }],
      decisionItems: [
        { decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }
      ],
      discussionPoints: [""],
      learningPoints: [""],
    }
  ],
  tags: { topicsCovered: "", emotions: "", other: "", gamesPlayed: "" },
  type: "Custom",
  noSummaryGiven: false,
  canceledSummary: false
};

function formatTimestampForPdf(timestamp: any) {
  const date = new Date(timestamp);
  date.setHours(date.getHours() + 2);
  const day = date.getUTCDate();
  const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

function formatTimestamp(timestamp: any) {
  const date = new Date(timestamp);
  const formattedDate = date.toISOString().split('T')[0];
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${formattedDate} ${hours}:${minutes} UTC`;
}

const SummaryTemplate = ({ updateMeetings }: SummaryTemplateProps) => {
  const { myVariable, setMyVariable } = useMyVariable();

  const [formData, setFormData] = useState<any>(defaultFormData);
  const [tags, setTags] = useState({ 
    topicsCovered: "", 
    emotions: "", 
    other: "", 
    gamesPlayed: "" 
  });
  const [loading, setLoading] = useState(false);
  const [creatingDoc, setCreatingDoc] = useState(false);

  // For the quarterly doc dropdown
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const quarterOptions = getQuarterOptions();

  // A ref to track if we've initialized once from context:
  const initializedRef = useRef(false);

  // ------------------------------------------
  // Only set local formData from context once:
  // ------------------------------------------
  useEffect(() => {
    if (!initializedRef.current && myVariable.summary) {
      initializedRef.current = true;
      const filtered = filterFormData(myVariable.summary);
      setFormData(filtered);
      if (filtered.tags) {
        setTags(filtered.tags);
      }
    }
  }, [myVariable.summary]);

  // Keep formData.tags in sync with local tags:
  useEffect(() => {
    setFormData(prev => {
      if (isEqual(prev.tags, tags)) {
        return prev;
      }
      return { ...prev, tags };
    });
  }, [tags]);  

  // Debounced auto-save logic
  const debouncedAutoSave = useMemo(
    () => debounce(async (latestData) => {
      await autoSave(latestData);
    }, 1000),
    []
  );

  useEffect(() => {
    // Skip auto-save if date is empty or the summary is flagged noSummary/canceled
    if (!formData.meetingInfo?.date || formData.noSummaryGiven || formData.canceledSummary) {
      return;
    }
    debouncedAutoSave(formData);
    return () => {
      debouncedAutoSave.cancel();
    };
  }, [formData, debouncedAutoSave]);

  // 1) The autoSave function
  const autoSave = async (latestData: any) => {
    try {
      const cleanedData = prepareFormDataForSave(latestData);
      const result = await saveCustomAgenda(cleanedData);

      if (result !== false) {
        const dbRecord = result[0];
        // Merge new fields (IDs, timestamps) but DO NOT overwrite typed text
        const updatedSummary = {
          ...latestData, 
          meeting_id: dbRecord.meeting_id,
          updated_at: dbRecord.updated_at,
          date: dbRecord.date
        };

        // We update context so the rest of the app knows about the new ID, date, etc.
        setMyVariable((prev) => ({
          ...prev,
          summary: updatedSummary
        }));

        // Keep the parent's "meetings" list updated:
        updateMeetings(updatedSummary);
      }
    } catch (err) {
      console.error("AutoSave failed:", err);
    }
  };

  // 2) Helper: remove empty strings, etc.
  const prepareFormDataForSave = (rawData: any) => {
    const filteredWorkingDocs = rawData.meetingInfo.workingDocs.filter(
      (doc: any) => doc.title || doc.link
    );
    const newData = {
      ...rawData,
      meetingInfo: {
        ...rawData.meetingInfo,
        workingDocs: filteredWorkingDocs
      },
      noSummaryGiven: false,
      canceledSummary: false
    };
    return removeEmptyValues(newData);
  };

  const removeEmptyValues = (obj: any) => {
    if (typeof obj !== 'object' || !obj) return obj;
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        obj[key] = removeEmptyValues(obj[key]);
        if (Object.keys(obj[key]).length === 0) {
          delete obj[key];
        }
      } else if (Array.isArray(obj[key])) {
        obj[key] = obj[key]
          .map((item: any) => removeEmptyValues(item))
          .filter((item: any) => item !== '' &&
            !(Array.isArray(item) && item.length === 0) &&
            !(typeof item === 'object' && Object.keys(item).length === 0)
          );
        if (obj[key].length === 0) {
          delete obj[key];
        }
      } else {
        if (obj[key] === '') {
          delete obj[key];
        }
      }
    });
    return obj;
  };

  // 3) Manual "Save"
  const handleSubmit = async () => {
    if (!formData.meetingInfo.date) {
      alert("Please select the meeting date before saving.");
      return;
    }
    setLoading(true);
    try {
      const cleanedFormData = prepareFormDataForSave(formData);
      const data = await saveCustomAgenda(cleanedFormData);
      if (data !== false) {
        const [latest] = data;
        // Merge only ID, date, updated_at:
        const summary = {
          ...formData,
          date: latest.date,
          meeting_id: latest.meeting_id,
          updated_at: latest.updated_at,
          confirmed: false
        };
        updateMeetings(summary);
        setMyVariable(prev => ({
          ...prev,
          summary
        }));
      }
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("There was an error submitting the meeting summary.");
    } finally {
      setLoading(false);
    }
  };

  // 4) Create Google Docs
  const handleCreateGoogleDoc = async () => {
    setCreatingDoc(true);
    try {
      const currentOrder = myVariable.agendaItemOrder
        ? myVariable.agendaItemOrder[myVariable.workgroup?.workgroup]
        : undefined;
      let markdown = generateMarkdown(myVariable.summary, currentOrder);

      const heading = `# Meeting Summary for ${formData.workgroup}\nDate: ${formatTimestampForPdf(formData.meetingInfo?.date)}`;
      markdown = `${heading}\n\n${markdown}`;

      const response = await axios.post('/api/createGoogleDoc', {
        markdown,
        workgroup: myVariable.workgroup?.workgroup,
        date: formatTimestampForPdf(formData.meetingInfo?.date)
      });
      window.open(response.data.link, '_blank');
    } catch (error) {
      console.error('Error creating Google Doc:', error);
      alert('There was an error creating the Google Doc.');
    } finally {
      setCreatingDoc(false);
    }
  };

  // 5) Create Quarterly Doc
  const handleCreateQuarterlyDoc = async () => {
    setCreatingDoc(true);
    try {
      const [quarter, year] = selectedQuarter.split(' ');
      const quarterNumber = parseInt(quarter.slice(1));

      const currentOrder = myVariable.agendaItemOrder
        ? myVariable.agendaItemOrder[myVariable.workgroup?.workgroup]
        : undefined;

      const markdown = await generateQuarterlyReport(
        myVariable.workgroup.workgroup_id,
        parseInt(year),
        quarterNumber,
        currentOrder
      );

      const response = await axios.post('/api/createGoogleDoc', {
        markdown,
        workgroup: myVariable.workgroup.workgroup,
        date: selectedQuarter
      });
      window.open(response.data.link, '_blank');
    } catch (error) {
      console.error('Error creating Quarterly Google Doc:', error);
      alert('There was an error creating the Quarterly Google Doc.');
    } finally {
      setCreatingDoc(false);
    }
  };

  return (
    <>
      {loading && (
        <div className={styles.loading}>Saving summary...</div>
      )}
      {!loading && (
        <div className={styles['form-container']}>
          <h2>{formData.workgroup} {formData.meetingInfo.date}</h2>
          <div className={styles['gitbook-form']}>
            {/* Meeting Info */}
            {formData.meetingInfo.name && (
              <SummaryMeetingInfo
              workgroup={formData.workgroup}
              onUpdate={(info) => {
                setFormData((prev) => {
                  // Compare old meetingInfo vs new
                  if (isEqual(prev.meetingInfo, info)) {
                    // If they are the same, do nothing -> no re-render
                    return prev;
                  }
                  // If different, update parent’s formData
                  return { ...prev, meetingInfo: info };
                });
              }}
            />            
            )}

            {/* Agenda Items */}
            <SummaryAgendaItems
              onUpdate={(items: any) => {
                setFormData((prev: any) => {
                  // Compare old vs new
                  if (isEqual(prev.agendaItems, items)) {
                    return prev; // no change => skip re-render
                  }
                  return { ...prev, agendaItems: items };
                });
              }}
            />


            {/* Tags */}
            <Tags 
              tags={tags} 
              setTags={setTags} 
            />

            {/* Manual Save Button */}
            <button
              onClick={handleSubmit}
              type="button"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Loading..." : "Save"}
            </button>

            {/* Show last updated date/time if available */}
            {myVariable.summary?.updated_at && (
              <p>{`(last saved ${formatTimestamp(myVariable.summary?.updated_at)})`}</p>
            )}

            {/* Create Google Doc */}
            <button
              type="button"
              onClick={handleCreateGoogleDoc}
              className={styles.exportButton}
              disabled={creatingDoc}
            >
              {creatingDoc 
                ? <span className={styles.flashingText}>Creating Google Doc...</span>
                : "Create Google Doc"
              }
            </button>
            <p className={styles.popupInfo}>
              (The document will open in a new tab if popups are enabled for this site)
            </p>

            {/* Quarterly Report */}
            <div className={styles['quarterly-report-section']}>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className={styles.quarterSelect}
              >
                <option value="">Select Quarter</option>
                {quarterOptions.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleCreateQuarterlyDoc}
                className={styles.exportButton}
                disabled={creatingDoc || !selectedQuarter}
              >
                {creatingDoc 
                  ? <span className={styles.flashingText}>Creating Google Doc...</span>
                  : "Create Quarterly Google Doc"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SummaryTemplate;
