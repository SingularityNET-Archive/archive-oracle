import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/typea.module.css'; 
import { generateMarkdown } from '../utils/generateMarkdown';
import { updateGitbook } from '../utils/updateGitbook';
import { sendDiscordMessage } from '../utils/sendDiscordMessage';
import { useMyVariable } from '../context/MyVariableContext';

const ConfirmSummaries = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { myVariable } = useMyVariable();
  const [formData, setFormData] = useState({
    date: myVariable.summary?.meetingInfo?.date || "",
    workgroup: myVariable.summary?.workgroup || "",
    meetingSummary: generateMarkdown(myVariable.summary),
  });
  const [renderedMarkdown, setRenderedMarkdown] = useState("");
  const formattedDate = new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      
  useEffect(() => {
    setRenderedMarkdown(formData.meetingSummary);
  }, [formData.meetingSummary]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
  
    //const data = await updateGitbook(formData);
    //console.log("returned from util function", data)
    await sendDiscordMessage(myVariable.summary, renderedMarkdown);
    setLoading(false);
  }
  console.log(myVariable)
  return (
    <div>
      <h2 className={styles['confirm-heading']}>Confirm uploaded Summary</h2>
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
              name="meetingSummary"
              value={formData.meetingSummary}
              onChange={handleChange}
              className={styles['form-textarea']}
              autoComplete="off"
            />
            <button type="submit" disabled={loading} className={styles['submit-button']}>
              {loading ? "Loading..." : "Submit"}
            </button>
          </form>
        </div>
        <div className={styles['markdown-rendered']}>
          <h2>{formattedDate}</h2>
          <h3>{formData.workgroup}</h3>
          <ReactMarkdown>{renderedMarkdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSummaries;
