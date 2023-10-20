import { useState, useEffect } from "react";
import styles from '../styles/typea.module.css'; 
import { useMyVariable } from '../context/MyVariableContext';
import CustomMeetingInfo from '../components/CustomMeetingInfo'
import CustomAgendaItems from '../components/CustomAgendaItems'
import Tags from '../components/Tags'
import { saveCustomAgenda } from '../utils/saveCustomAgenda';

const filterKeys = (source: any, template: any) => {
  const result: any = {};
  Object.keys(template).forEach(key => {
    if (key === "type") {
      result[key] = "Custom"; 
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

const CustomTemplate = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { myVariable, setMyVariable } = useMyVariable();
  const today = new Date().toISOString().split('T')[0];
    
  const defaultFormData = {
    workgroup: "",
    workgroup_id: "",
    meetingInfo: {
      name:'Weekly Meeting',
      date:'',
      host:'',
      documenter:'',
      peoplePresent: '',
      purpose: '',
      meetingVideoLink: '',
      miroBoardLink: '',
      otherMediaLink: '',
      transcriptLink: '',
      mediaLink: '',
    },  
    agendaItems: [
      { 
        agenda: "", 
        status: "carry over", 
        actionItems: [{ text: "", assignee: "", dueDate: "" }],  
        decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
        discussionPoints: [""],
        narrative: '',
        issues: [],
      }
    ],
    tags: { topicsCovered: "", references: "", emotions: "", other: "" },
    type: "Custom"
  };

  const [formData, setFormData] = useState(filterKeys(myVariable.summary || {}, defaultFormData));
  const [tags, setTags] = useState({ topicsCovered: "", references: "", emotions: "", other: "" });

  useEffect(() => {
    if (myVariable.workgroup && myVariable.workgroup.workgroup) {
      setFormData((prevState: any)=> ({ ...prevState, workgroup: myVariable.workgroup.workgroup, workgroup_id: myVariable.workgroup.workgroup_id }));
    }
    //console.log("workgroupData", myVariable)
  }, [myVariable.workgroup]);  

  useEffect(() => {
    setFormData((prevState: any) => ({ ...prevState, tags })); 
  }, [tags]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!formData.meetingInfo.date) {
      alert("Please select the meeting date.");
      return;
    }
    setLoading(true);
    try {
      const data: any = await saveCustomAgenda(formData);
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
      <h2>Custom Template</h2>
      <h3>{formData.meetingInfo.date} - {formData.workgroup}</h3>
      <form onSubmit={handleSubmit} className={styles['gitbook-form']}>
        <CustomMeetingInfo workgroup={formData.workgroup} onUpdate={(info: any) => setFormData({...formData, meetingInfo: info})} />
        <CustomAgendaItems onUpdate={(items: any) => setFormData({...formData, agendaItems: items})} />
        <Tags tags={tags} setTags={setTags} />
        <button type="submit" disabled={loading} className={styles['submit-button']}>
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default CustomTemplate;
