import { useState, useEffect } from "react";
import styles from '../styles/typea.module.css'; 
import { useMyVariable } from '../context/MyVariableContext';
import MeetingInfo from '../components/MeetingInfo'
import AgendaItems from '../components/AgendaItems'
import Tags from '../components/Tags'
import { saveAgenda } from '../utils/saveAgenda';

const filterKeys = (source: any, template: any) => {
  const result: any = {};
  Object.keys(template).forEach(key => {
    if (key === "type") {
      result[key] = "FullArchival"; // Always set type to "Narrative"
    } else if (key === "date") {
      // Explicitly setting the date to be empty
      result[key] = "";
    } else if (source.hasOwnProperty(key)) {
      // If the key is an object, recursively filter its keys
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = filterKeys(source[key], template[key]);
      } else {
        result[key] = source[key];
      }
    } else {
      result[key] = template[key];
    }
  });
  return result;
};

const FullArchivalTemplate = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { myVariable, setMyVariable } = useMyVariable();
  const today = new Date().toISOString().split('T')[0];
    
  const defaultFormData = {
    name: "Weekly Meeting",
    date: "",
    workgroup: "",
    workgroup_id: "",
    meetingInfo: {
      host:'',
      documenter:'',
      peoplePresent: '',
      purpose: '',
      meetingVideoLink: '',
      miroBoardLink: '',
      otherMediaLink: '',
      transcriptLink: '',
    },  
    agendaItems: [
      { 
        agenda: "", 
        status: "carry over", 
        actionItems: [{ text: "", assignee: "", dueDate: "" }],  
        decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
        discussionPoints: [""] 
      }
    ],
    tags: { topicsCovered: "", references: "", emotions: "", other: "" },
    type: "FullArchival"
  };

  const [formData, setFormData] = useState(filterKeys(myVariable.summary || {}, defaultFormData));
  const [tags, setTags] = useState({ topicsCovered: "", references: "", emotions: "", other: "" });

  useEffect(() => {
    if (myVariable.workgroup && myVariable.workgroup.workgroup) {
      setFormData((prevState: any)=> ({ ...prevState, workgroup: myVariable.workgroup.workgroup, workgroup_id: myVariable.workgroup.workgroup_id }));
    }
  }, [myVariable.workgroup]);  

  useEffect(() => {
    setFormData((prevState: any) => ({ ...prevState, tags })); 
  }, [tags]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!formData.date) {
      alert("Please select the meeting date.");
      return;
    }
    setLoading(true);
    try {
      const data: any = await saveAgenda(formData);
      console.log("Submitted Form Data:", formData, data);
      alert("Meeting summary successfully submitted!"); // Notify the user here
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("There was an error submitting the meeting summary."); // Notify about the failure if you wish
    } finally {
      setLoading(false);
    }
  } 

  return (
    <div className={styles['form-container']}>
      <h2>Full Archival Template</h2>
      <h3>{formData.date} - {formData.workgroup}</h3>
      <form onSubmit={handleSubmit} className={styles['gitbook-form']}>
        <label className={styles['form-label']}>
          Name:
        </label>
        <input
          type="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={styles['form-input']}
        />
        {myVariable.summary?.date && (<label className={styles['form-label']}>Date:  (previous meeting {myVariable.summary.date})</label>)}
        {!myVariable.summary?.date && (<label className={styles['form-label']}>Date: </label>)}
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={styles['form-input']}
        />
        <MeetingInfo workgroup={formData.workgroup} onUpdate={(info: any) => setFormData({...formData, meetingInfo: info})} />
        <AgendaItems onUpdate={(items: any) => setFormData({...formData, agendaItems: items})} />
        <Tags tags={tags} setTags={setTags} />
        <button type="submit" disabled={loading} className={styles['submit-button']}>
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default FullArchivalTemplate;