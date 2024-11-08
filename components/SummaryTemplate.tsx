// ../components/SummaryTemplate.tsx
import { useState, useEffect } from "react";
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
  const [creatingDoc, setCreatingDoc] = useState<boolean>(false);
  const today = new Date().toISOString().split('T')[0];
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const quarterOptions = getQuarterOptions();
    
  const defaultFormData = {
    workgroup: "",
    workgroup_id: "",
    meetingInfo: {
      name:"Weekly",
      date:"",
      host:"",
      documenter:"",
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
        decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
        discussionPoints: [""],
        learningPoints: [""],
      }
    ],
    tags: { topicsCovered: "", emotions: "", other: "", gamesPlayed: "" },
    type: "Custom",
    noSummaryGiven: false,
    canceledSummary: false
  };

  const [formData, setFormData] = useState(filterFormData(filterKeys(myVariable.summary || {}, defaultFormData)));
  const [tags, setTags] = useState({ topicsCovered: "", emotions: "", other: "", gamesPlayed: "" });
  const currentOrder = myVariable.agendaItemOrder ? myVariable.agendaItemOrder[myVariable.workgroup?.workgroup] : undefined;

  async function handleCreateQuarterlyDoc() {
    setCreatingDoc(true);

    try {
      const [quarter, year] = selectedQuarter.split(' ');
      const quarterNumber = parseInt(quarter.slice(1));
      const markdown = await generateQuarterlyReport(myVariable.workgroup.workgroup_id, parseInt(year), quarterNumber, currentOrder);
      //console.log(markdown);
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
  }

  async function handleCreateGoogleDoc() {
    setCreatingDoc(true); // Set creatingDoc to true when the button is clicked
  
    try {
      let markdown = generateMarkdown(myVariable.summary, currentOrder);

      // Add a heading to the first line of the markdown
      const heading = `# Meeting Summary for ${formData.workgroup}\nDate: ${formatTimestampForPdf(formData.meetingInfo?.date)}`;
      markdown = `${heading}\n\n${markdown}`;
      //console.log("markdown", markdown);
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
      setCreatingDoc(false); // Set creatingDoc to false after completion
    }
  }  
  
  useEffect(() => {
    // Set the local state whenever myVariable.summary changes
    setFormData((filterKeys(myVariable.summary || {}, defaultFormData)));
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
    //console.log("formData",formData, myVariable)
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
    
    summary.confirmed = false;

    const cleanedFormData = removeEmptyValues({ 
      ...formData, 
      meetingInfo: { ...formData.meetingInfo, workingDocs: filteredWorkingDocs },
      noSummaryGiven: false,
      canceledSummary: false 
    });
    setLoading(true);
  
    try {
      //console.log("test", cleanedFormData)
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
      <div className={styles['gitbook-form']}>
        {formData.meetingInfo.name && (<SummaryMeetingInfo workgroup={formData.workgroup} onUpdate={(info: any) => setFormData({...formData, meetingInfo: info})} />)}
        <SummaryAgendaItems onUpdate={(items: any) => setFormData({...formData, agendaItems: items})} />
        <Tags tags={tags} setTags={setTags} />
        <button onClick={handleSubmit} type="button" disabled={loading} className={styles.submitButton}>
          {loading ? "Loading..." : "Save"}
        </button>
        {myVariable.summary?.updated_at && (<p>{`(last saved ${formatTimestamp(myVariable.summary?.updated_at)})`}</p>)}
        <button
          type="button"
          onClick={handleCreateGoogleDoc}
          className={styles.exportButton}
          disabled={creatingDoc}
        >
          {creatingDoc ? (
            <span className={styles.flashingText}>Creating Google Doc...</span>
          ) : (
            "Create Google Doc"
          )}
        </button>
        <p className={styles.popupInfo}>
          (The document will open in a new tab if popups are enabled for this site)
        </p>
        <div className={styles['quarterly-report-section']}>
        <select
          value={selectedQuarter}
          onChange={(e) => setSelectedQuarter(e.target.value)}
          className={styles.quarterSelect}
        >
          <option value="">Select Quarter</option>
          {quarterOptions.map((option) => (
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
          {creatingDoc ? (
            <span className={styles.flashingText}>Creating Google Doc...</span>
          ) : (
            "Create Quarterly Google Doc"
          )}
        </button>
      </div>
      </div>
      </div>)}
    </>
  );
};

export default SummaryTemplate;
