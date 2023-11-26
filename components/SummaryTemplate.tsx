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

function formatTimestamp(timestamp: any) {
  // Parse the timestamp into a Date object
  const date = new Date(timestamp);

  // Format the date and time
  // Get the YYYY-MM-DD format
  const formattedDate = date.toISOString().split('T')[0];

  // Get the HH:MM format
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');

  // Combine the date and time with UTC
  return `${formattedDate} ${hours}:${minutes} UTC`;
}

const SummaryTemplate = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { myVariable, setMyVariable } = useMyVariable();
  const today = new Date().toISOString().split('T')[0];
    
  const defaultFormData = {
    workgroup: "",
    workgroup_id: "",
    meetingInfo: {
      name:"Weekly",
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
      workingDocs: [{ title: '', link: '' }]
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
    setLoading(true);
    if (myVariable.workgroup && myVariable.workgroup.workgroup) {
      setFormData((prevState: any)=> ({ ...prevState, workgroup: myVariable.workgroup.workgroup, workgroup_id: myVariable.workgroup.workgroup_id }));
    }
    setLoading(false);
    //console.log("workgroupData", myVariable)
  }, [myVariable.workgroup]);  

  useEffect(() => {
    setFormData((prevState: any) => ({ ...prevState, tags })); 
  }, [tags]);

  const removeEmptyValues = (obj: any) => {
    Object.keys(obj).forEach(key => {
      // If it's an object and not an array
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        // If the object is empty, delete the key
        if (Object.keys(obj[key]).length === 0) {
          delete obj[key];
        } else {
          // Recursively clean the object
          removeEmptyValues(obj[key]);
        }
      } 
      // If it's an array
      else if (Array.isArray(obj[key])) {
        // Clean the array items if they are objects
        obj[key] = obj[key].map((item: any) => typeof item === 'object' ? removeEmptyValues(item) : item)
          .filter((item: any) => {
            // Filter out empty strings, empty arrays, and empty objects
            return item !== '' && 
                   !(Array.isArray(item) && item.length === 0) &&
                   !(typeof item === 'object' && Object.keys(item).length === 0);
          });
  
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
  
    // Merging new workingDocs with old ones
    const updatedMyVariable = {
      ...myVariable,
      summary: {
        ...myVariable.summary,
        ...formData,
        meetingInfo: {
          ...formData.meetingInfo,
          workingDocs: formData.meetingInfo.workingDocs // This now includes both old and new docs
        },
        updated_at: new Date()
      }
    };
  
    setMyVariable(updatedMyVariable);
    const cleanedFormData = removeEmptyValues({ ...formData });
    setLoading(true);
  
    try {
      const data: any = await saveCustomAgenda(cleanedFormData);
      console.log("Submitted Form Data:", cleanedFormData, data);
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("There was an error submitting the meeting summary.");
    } finally {
      setLoading(false);
    }
  }
  
  const formatUrl = (url: string) => {
    if (!url?.startsWith('http://') && !url?.startsWith('https://')) {
      return `http://${url}`;
    }
    return url;
  };

  // Utility function to check if an object within an array is non-empty
const hasNonEmptyObjects = (array: any) => {
  return array.some((item: any) => Object.keys(item).length > 0);
};


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
        {formData.meetingInfo.name && (<SummaryMeetingInfo workgroup={formData.workgroup} onUpdate={(info: any) => setFormData({...formData, meetingInfo: info})} />)}
        <SummaryAgendaItems onUpdate={(items: any) => setFormData({...formData, agendaItems: items})} />
        <Tags tags={tags} setTags={setTags} />
        <button type="submit" disabled={loading} className={styles['submit-button']}>
          {loading ? "Loading..." : "Save"}
        </button>
        {myVariable.summary?.updated_at && (<p>{`(last saved ${formatTimestamp(myVariable.summary?.updated_at)})`}</p>)}
      </form>
      <div className={styles['form-container']}>
      {myVariable.summary?.meetingInfo?.workingDocs && hasNonEmptyObjects(myVariable.summary.meetingInfo.workingDocs) && (
        <>
            <h3>Working Documents</h3>
            <table className={styles['working-doc-table']}>
                <thead>
                    <tr>
                        <th>Doc Title</th>
                        <th>Doc Link</th>
                    </tr>
                </thead>
                <tbody>
                    {myVariable.summary.meetingInfo.workingDocs.map((doc: any, index: any) => (
                        <tr key={index}>
                            <td>{doc.title}</td>
                            <td>
                                <a href={formatUrl(doc.link)} target="_blank" rel="noopener noreferrer">
                                    {doc.link}
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )}
</div>

      </div>)}
    </>
  );
};

export default SummaryTemplate;
