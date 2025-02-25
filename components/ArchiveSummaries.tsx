import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/archivesummaries.module.css'; 
import { generateMarkdown } from '../utils/generateMarkdown';
import { updateGitbook } from '../utils/updateGitbook';
import { sendDiscordMessage } from '../utils/sendDiscordMessage';
import { useMyVariable } from '../context/MyVariableContext';
import { confirmedStatusUpdate } from '../utils/confirmedStatusUpdate';
import { saveCustomAgenda } from '../utils/saveCustomAgenda';

const ArchiveSummaries = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { myVariable, setMyVariable } = useMyVariable();
  const [formData, setFormData] = useState({
    date: myVariable.summary?.meetingInfo?.date || "",
    workgroup: myVariable.summary?.workgroup || "",
    meetingSummary: generateMarkdown(myVariable.summary),
    meeting_id: myVariable.summary?.meeting_id || "",
    confirmed: myVariable.summary?.confirmed || false,
    noSummaryGivenText: myVariable.summary?.noSummaryGivenText || "",
    canceledSummaryText: myVariable.summary?.canceledSummaryText || ""
  });
  const [commitToGitBook, setCommitToGitBook] = useState(true);
  const [sendToDiscord, setSendToDiscord] = useState(true);
  const [renderedMarkdown, setRenderedMarkdown] = useState("");
  const formattedDate = new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      
  // Determine which text value to use based on summary type:
  const summaryText = myVariable.summary.noSummaryGiven
    ? formData.noSummaryGivenText
    : myVariable.summary.canceledSummary
      ? formData.canceledSummaryText
      : formData.meetingSummary;

  useEffect(() => {
    setRenderedMarkdown(formData.meetingSummary);
    console.log(formData.meetingSummary, myVariable.summary)
  }, [formData.meetingSummary]);

  useEffect(() => {
    const currentOrder = myVariable.agendaItemOrder ? myVariable.agendaItemOrder[myVariable.workgroup?.workgroup] : undefined;
    // Set the local state whenever myVariable.summary changes
    if (currentOrder) {
      setFormData({
        date: myVariable.summary?.meetingInfo?.date || "",
        workgroup: myVariable.summary?.workgroup || "",
        meetingSummary: generateMarkdown(myVariable.summary, currentOrder),
        meeting_id: myVariable.summary?.meeting_id || "",
        confirmed: myVariable.summary?.confirmed || false,
        noSummaryGivenText: myVariable.summary?.noSummaryGivenText || "",
        canceledSummaryText: myVariable.summary?.canceledSummaryText || ""
      });
      setRenderedMarkdown(generateMarkdown(myVariable.summary, currentOrder));
    }
    adjustTextareaHeight();
  }, [myVariable.summary]); // Add myVariable.summary to the dependency array
  
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      name === "commitToGitBook" ? setCommitToGitBook(checked) : setSendToDiscord(checked);
    } else if (myVariable.summary.noSummaryGiven) {
      // Update the noSummaryGiven text field when in that mode
      setFormData((prev) => ({
        ...prev,
        noSummaryGivenText: value,
      }));
      setSendToDiscord(false);
    } else if (myVariable.summary.canceledSummary) {
      // Update the canceledSummary text field when in that mode
      setFormData((prev) => ({
        ...prev,
        canceledSummaryText: value,
      }));
      setSendToDiscord(false);
    } else {
      // Regular meeting summary update
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (name === 'meetingSummary') {
      adjustTextareaHeight();
    }
    
  };  

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    let currentMeetingId = formData.meeting_id;
  
    // If this is a noSummary or canceled summary and meeting_id is missing, save first
    if ((myVariable.summary?.noSummaryGiven || myVariable.summary?.canceledSummary) && !currentMeetingId) {
      // Merge the updated text fields from formData into the summary object
      const updatedSummary = {
        ...myVariable.summary,
        noSummaryGivenText: formData.noSummaryGivenText,
        canceledSummaryText: formData.canceledSummaryText,
      };
      const data: any = await saveCustomAgenda(updatedSummary);
      if (data && data[0]?.meeting_id) {
        currentMeetingId = data[0].meeting_id;
        // Update context and state with the new meeting_id
        setMyVariable(prev => ({
          ...prev,
          summary: {
            ...prev.summary,
            meeting_id: currentMeetingId,
            noSummaryGivenText: formData.noSummaryGivenText,
            canceledSummaryText: formData.canceledSummaryText,
          }
        }));        
        setFormData(prev => ({
          ...prev,
          meeting_id: currentMeetingId
        }));
      }
    }    

    // Check if there are any confirmed summaries with the same date
    const isDuplicateConfirmedSummary = myVariable.summaries.some((summary: any) => {
      // Convert both dates to Date objects to strip off the time part
      const summaryDate = new Date(summary.date).toDateString();
      const formDataDate = new Date(formData.date).toDateString(); 
      //console.log(summaryDate, formDataDate, summaryDate === formDataDate && summary.confirmed); // For debugging purposes
      // Compare the date strings
      return summaryDate === formDataDate && summary.confirmed;
    });    
  
    if (isDuplicateConfirmedSummary) {
      alert('A confirmed summary for this date already exists.');
      setLoading(false);
      return; // Exit the function early
    }
  
     if (!formData.confirmed) {
      const payload = { ...formData, meeting_id: currentMeetingId };
      if (commitToGitBook) {
        const data = await updateGitbook(payload);
        if (data) {
          setMyVariable(prevState => ({
            ...prevState,
            summary: { ...prevState.summary, confirmed: true },
          }));
        }
      } else {
        await confirmedStatusUpdate(payload);
        setMyVariable(prevState => ({
          ...prevState,
          summary: { ...prevState.summary, confirmed: true },
        }));
      }
    
      if (sendToDiscord) {
        await sendDiscordMessage(myVariable, renderedMarkdown);
      }
    } else {
      if (myVariable.summary.noSummaryGiven || myVariable.summary.canceledSummary) {
        alert('Select a date');
      } else {
        alert('Summary already archived');
      }
    }
    
    setLoading(false);
  }
  
  return (
    <div className={styles['main-container']}>
      {loading && (
        <>
        <div className={styles['loading']}>
          Archiving...
        </div>
        </>
      )}
      {!loading && (
        <>
          <h2 className={styles['confirm-heading']}>Validate and Archive Summary</h2>
          <div className={styles['row-flex-start']}>
            <div className={styles['form-container']}>  
              <form onSubmit={handleSubmit} className={styles['gitbook-form']}>
                <label className={styles['form-label']}>
                  Date:
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={styles['form-input']}
                />

                <label className={styles['form-label']}>
                  Workgroup:
                </label>
                <input
                  type="text"
                  name="workgroup"
                  value={formData.workgroup}
                  onChange={handleChange}
                  className={styles['form-input']}
                  autoComplete="off"
                />

                <label className={styles['form-label']}>
                  Meeting Summary Markdown:
                </label>
                <textarea
                  ref={textareaRef}
                  name="meetingSummary" 
                  value={summaryText}
                  onChange={handleChange}
                  className={styles['meeting-summary-textarea']}
                  autoComplete="off"
                />

                <button type="submit" disabled={loading} className={styles['submit-button']}>
                  {loading ? "Loading..." : "Submit"}
                </button>

                <div className={styles['form-checkbox']}>
                  <input
                    type="checkbox"
                    id="commitToGitBook"
                    name="commitToGitBook"
                    checked={commitToGitBook}
                    onChange={handleChange}
                  />
                  <label htmlFor="commitToGitBook">Commit to GitBook</label>
                </div>

                <div className={styles['form-checkbox']}>
                  <input
                    type="checkbox"
                    id="sendToDiscord"
                    name="sendToDiscord"
                    checked={sendToDiscord}
                    onChange={handleChange}
                  />
                  <label htmlFor="sendToDiscord">Send Discord Message</label>
                </div>

              </form>
            </div>
            <div className={styles['markdown-rendered']}>
              <h2 className={styles['markdown-rendered-heading']}>{formattedDate}</h2>
              <h3>{formData.workgroup}</h3>
              <ReactMarkdown>{renderedMarkdown}</ReactMarkdown>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ArchiveSummaries;
