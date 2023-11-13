import { useState, useEffect } from "react";
import styles from '../styles/typea.module.css'; 
import { useMyVariable } from '../context/MyVariableContext';
import SummaryMeetingInfo from './SummaryMeetingInfo'
import SummaryAgendaItems from './SummaryAgendaItems'
import Tags from './Tags'
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

const SummaryTemplate = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { myVariable, setMyVariable } = useMyVariable();
  const today = new Date().toISOString().split('T')[0];
    
  const defaultFormData = {
    workgroup: "",
    workgroup_id: "",
    meetingInfo: {
      name:"Weekly Meeting",
      date:"",
      host:"",
      documenter:"",
      peoplePresent: "",
      purpose: "",
      meetingVideoLink: "",
      miroBoardLink: "",
      otherMediaLink: "",
      transcriptLink: "",
      mediaLink: "",
    },  
    agendaItems: [
      { 
        agenda: "", 
        status: "carry over", 
        townHallUpdates: "",
        narrative: "",
        issues: [""],
        actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }],  
        decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
        discussionPoints: [""],
        learningPoints: [""],
      }
    ],
    tags: { topicsCovered: "", references: "", emotions: "", other: "", gamesPlayed: "" },
    type: "Custom"
  };

  const [formData, setFormData] = useState(filterKeys(myVariable.summary || {}, defaultFormData));
  const [tags, setTags] = useState({ topicsCovered: "", references: "", emotions: "", other: "", gamesPlayed: "" });

  useEffect(() => {
    // Set the local state whenever myVariable.summary changes
    setFormData(filterKeys(myVariable.summary || {}, defaultFormData));
    //console.log(myVariable)
  }, [myVariable.summary]); // Add myVariable.summary to the dependency array
  
  useEffect(() => {
    if (myVariable.workgroup && myVariable.workgroup.workgroup) {
      setFormData((prevState: any)=> ({ ...prevState, workgroup: myVariable.workgroup.workgroup, workgroup_id: myVariable.workgroup.workgroup_id }));
    }
    //console.log("workgroupData", myVariable)
  }, [myVariable.workgroup]);  

  useEffect(() => {
    setFormData((prevState: any) => ({ ...prevState, tags })); 
  }, [tags]);

  const removeEmptyValues = (obj: any) => {
    Object.keys(obj).forEach(key => {
      // If it's an object, recurse deeper
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        removeEmptyValues(obj[key]);
      } 
      // If it's an array, process it
      else if (Array.isArray(obj[key])) {
        // Clean the array items if they are objects
        obj[key] = obj[key].map((item: any) => typeof item === 'object' ? removeEmptyValues(item) : item)
          .filter((item: any) => item !== '' && !(Array.isArray(item) && item.length === 0)); // Filter out empty strings and empty arrays
  
        // If after processing, the array is empty, remove the key
        if (obj[key].length === 0) {
          delete obj[key];
        }
      } 
      // If it's an empty string, remove it
      else if (obj[key] === '') {
        delete obj[key];
      }
    });
    return obj;
  };  
  
  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!formData.meetingInfo.date) {
      alert("Please select the meeting date.");
      return;
    }
    const cleanedFormData = removeEmptyValues({ ...formData });
    setLoading(true);
    try {
      const data: any = await saveCustomAgenda(cleanedFormData);
      console.log("Submitted Form Data:", cleanedFormData, data);
      alert("Meeting summary successfully submitted!"); // Notify the user here
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("There was an error submitting the meeting summary."); // Notify about the failure if you wish
    } finally {
      setLoading(false);
    }
  } 

  return (
    <>
    {loading && (
        <>
        <div className={styles['loading']}>
          Saving summary...
        </div>
        </>
    )}
    {!loading && (<div className={styles['form-container']}>
      <h2>{formData.workgroup} {formData.meetingInfo.date}</h2>
      <form onSubmit={handleSubmit} className={styles['gitbook-form']}>
        <SummaryMeetingInfo workgroup={formData.workgroup} onUpdate={(info: any) => setFormData({...formData, meetingInfo: info})} />
        <SummaryAgendaItems onUpdate={(items: any) => setFormData({...formData, agendaItems: items})} />
        <Tags tags={tags} setTags={setTags} />
        <button type="submit" disabled={loading} className={styles['submit-button']}>
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>
    </div>)}
    </>
  );
};

export default SummaryTemplate;
