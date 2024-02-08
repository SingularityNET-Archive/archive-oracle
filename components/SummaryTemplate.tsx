import { useState, useEffect } from "react";
import styles from '../styles/typea.module.css'; 
import { useMyVariable } from '../context/MyVariableContext';
import SummaryMeetingInfo from './SummaryMeetingInfo'
import SummaryAgendaItems from './SummaryAgendaItems'
import Tags from './Tags'
import { saveCustomAgenda } from '../utils/saveCustomAgenda';
import { generateMarkdown } from '../utils/generateMarkdown';
import axios from "axios";

type SummaryTemplateProps = {
  updateMeetings: (newMeetingSummary: any) => void;
};

const filterKeys = (source: any, template: any) => {
  const result: any = {};
  Object.keys(template).forEach(key => {
    if (key === "type") {
      result[key] = "Custom"; 
    //} else if (key === "date") {
      // Explicitly setting the date to be empty
      // result[key] = "";
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

function formatTimestampForPdf(timestamp: any) {
  // Create a Date object using the timestamp
  const date = new Date(timestamp);

  date.setHours(date.getHours() + 2);

  const day = date.getUTCDate();
  const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
}


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

const SummaryTemplate = ({ updateMeetings }: SummaryTemplateProps) => {
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
      townHallNumber: "",
      googleSlides: "",
      meetingVideoLink: "",
      miroBoardLink: "",
      otherMediaLink: "",
      transcriptLink: "",
      mediaLink: "",
      workingDocs: [{ title: '', link: '' }],
      timestampedVideo: { url: '', intro: '', timestamps: [{ title: '', timestamp: '' }] }
    },  
    agendaItems: [
      { 
        agenda: "", 
        status: "carry over", 
        townHallUpdates: "",
        townHallSummary: "",
        narrative: "",
        gameRules: "",
        meetingTopics:[""],
        issues: [""],
        actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }],  
        decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
        discussionPoints: [""],
        learningPoints: [""],
      }
    ],
    tags: { topicsCovered: "", emotions: "", other: "", gamesPlayed: "" },
    type: "Custom"
  };

  const [formData, setFormData] = useState(filterKeys(myVariable.summary || {}, defaultFormData));
  const [tags, setTags] = useState({ topicsCovered: "", emotions: "", other: "", gamesPlayed: "" });
  const currentOrder = myVariable.agendaItemOrder ? myVariable.agendaItemOrder[myVariable.workgroup?.workgroup] : undefined;

  async function generatePdf(markdown: any) {
    try {
      //console.log(formData.meetingInfo?.date, myVariable.summary?.date)
      const additionalLines = `# Meeting Summary for ${myVariable.workgroup?.workgroup}\n` +
                        `Date: ${formatTimestampForPdf(formData.meetingInfo?.date)}\n\n`+
                        `#### Meeting Info\n`;

      // Combine additional lines with existing markdown
      const combinedMarkdown = additionalLines + markdown;
  
      const response = await axios.post('/api/convertToPdf', { markdown: combinedMarkdown }, {
        responseType: 'blob', // Important to handle the PDF binary data
      });
  
      // Creating a Blob URL from the response data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      //window.open(url, '_blank');  // If you want to open the PDF in a new tab
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Meeting-Summary.pdf'); // or any other filename
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      console.error('Error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(error.response.data);
        console.error(error.response.status);
        console.error(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error', error.message);
      }
    }
  }
  
  useEffect(() => {
    // Set the local state whenever myVariable.summary changes
    setFormData(filterKeys(myVariable.summary || {}, defaultFormData));
    //console.log(myVariable, generateMarkdown(myVariable.summary, currentOrder))
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
  
    // Filter out working docs with both empty title and link
    const filteredWorkingDocs = formData.meetingInfo.workingDocs.filter((doc: any) => doc.title || doc.link);
  
    // Merging new workingDocs with old ones after filtering
    let summary: any = {
      ...myVariable.summary,
      ...formData,
      meetingInfo: {
        ...formData.meetingInfo,
        workingDocs: filteredWorkingDocs // This now includes filtered docs
      },
      updated_at: new Date()
    }

    const cleanedFormData = removeEmptyValues({ ...formData, meetingInfo: { ...formData.meetingInfo, workingDocs: filteredWorkingDocs } });
    setLoading(true);
  
    try {
      const data = await saveCustomAgenda(cleanedFormData);
      if (data !== false) {
        //console.log("Calling updateMeetings with:", summary, data[0].date);
        summary.date = data[0].date
        summary.meeting_id = data[0].meeting_id
        summary.updated_at = data[0].updated_at
        // Ensure myVariable.summaries is initialized
        let existingSummaries = myVariable.summaries || [];
        
        // Find index of summary with the same date
        let existingSummaryIndex = existingSummaries.findIndex((s: any) => s.date === summary.date);
        
        if (existingSummaryIndex !== -1) {
          // Replace existing summary
          existingSummaries[existingSummaryIndex] = summary;
        } else {
          // Add new summary if one with the same date doesn't exist
          existingSummaries.push(summary);
        }
        //console.log("existingSummaries", existingSummaries);
        updateMeetings(summary);
        const updatedMyVariable = {
          ...myVariable,
          summary: summary,
          summaries: existingSummaries
        };
      
        setMyVariable(updatedMyVariable);
      } else {
        console.log("Error in saving custom agenda");
      }    
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("There was an error submitting the meeting summary.");
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
        {formData.meetingInfo.name && (<SummaryMeetingInfo workgroup={formData.workgroup} onUpdate={(info: any) => setFormData({...formData, meetingInfo: info})} />)}
        <SummaryAgendaItems onUpdate={(items: any) => setFormData({...formData, agendaItems: items})} />
        <Tags tags={tags} setTags={setTags} />
        <button type="submit" disabled={loading} className={styles['submit-button']}>
          {loading ? "Loading..." : "Save"}
        </button>
        {myVariable.summary?.updated_at && (<p>{`(last saved ${formatTimestamp(myVariable.summary?.updated_at)})`}</p>)}
        <button
          type="button"
          onClick={() => generatePdf(generateMarkdown(myVariable.summary, currentOrder))}
          className={styles['export-button']}
        >
          Export to PDF
        </button>
      </form>
      </div>)}
    </>
  );
};

export default SummaryTemplate;
