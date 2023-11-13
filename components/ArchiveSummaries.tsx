import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/typea.module.css'; 
import { generateMarkdown } from '../utils/generateMarkdown';
import { updateGitbook } from '../utils/updateGitbook';
import { sendDiscordMessage } from '../utils/sendDiscordMessage';
import { useMyVariable } from '../context/MyVariableContext';

const ArchiveSummaries = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { myVariable, setMyVariable } = useMyVariable();
  const [formData, setFormData] = useState({
    date: myVariable.summary?.meetingInfo?.date || "",
    workgroup: myVariable.summary?.workgroup || "",
    meetingSummary: generateMarkdown(myVariable.summary),
    meeting_id: myVariable.summary?.meeting_id || "",
    confirmed: myVariable.summary?.confirmed || false
  });
  const [renderedMarkdown, setRenderedMarkdown] = useState("");
  const formattedDate = new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      
  useEffect(() => {
    setRenderedMarkdown(formData.meetingSummary);
  }, [formData.meetingSummary]);

  useEffect(() => {
    // Set the local state whenever myVariable.summary changes
    setFormData({
      date: myVariable.summary?.meetingInfo?.date || "",
      workgroup: myVariable.summary?.workgroup || "",
      meetingSummary: generateMarkdown(myVariable.summary),
      meeting_id: myVariable.summary?.meeting_id || "",
      confirmed: myVariable.summary?.confirmed || false
    });
    setRenderedMarkdown(generateMarkdown(myVariable.summary));
    adjustTextareaHeight();
  }, [myVariable.summary]); // Add myVariable.summary to the dependency array
  
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'meetingSummary') {
      adjustTextareaHeight();
    }
  };  

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    if (myVariable.summary.confirmed == false) {
      const data = await updateGitbook(formData);
      //console.log("returned from util function", formData)
      if (data) {
        setMyVariable({
          ...myVariable,
          summary: {
            ...myVariable.summary,
            confirmed: true,
          },
        });
      }
      //console.log(myVariable)
      await sendDiscordMessage(myVariable, renderedMarkdown);
      //console.log(myVariable, "renderedMarkdown", renderedMarkdown)
    } else {
      alert('Summary already archived')
    }
    
    setLoading(false);
  }
  
  return (
    <div>
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
                  value={formData.meetingSummary}
                  onChange={handleChange}
                  className={styles['meeting-summary-textarea']}
                  autoComplete="off"
                />
                <button type="submit" disabled={loading} className={styles['submit-button']}>
                  {loading ? "Loading..." : "Submit"}
                </button>
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
