import { useState, useEffect } from "react";
import styles from '../styles/typea.module.css'; 
import { useMyVariable } from '../context/MyVariableContext';
import NarrativeMeetingInfo from '../components/NarrativeMeetingInfo'
import NarrativeAgenda from '../components/NarrativeAgenda'
import Tags from '../components/Tags'
import { saveAgenda } from '../utils/saveAgenda';

const filterKeys = (source: any, template: any) => {
  const result: any = {};
  Object.keys(template).forEach(key => {
    if (key === "type") {
      result[key] = "Narrative"; // Always set type to "Narrative"
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

const NarrativeTemplate = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { myVariable, setMyVariable } = useMyVariable();
  const today = new Date().toISOString().split('T')[0];
    
  const defaultFormData = {
    name: 'Weekly Meeting',
    date: today,
    workgroup: '',
    workgroup_id: '',
    meetingInfo: {
      host:'',
      documenter:'',
      peoplePresent: '',
      mediaLink: '',
    },  
    agendaItems: [
      {
        mode: 'Narrative',
        narrative: '',
        issues: [],
        actionItems: [],
        decisionItems: []
      }
    ],
    tags: { topicsCovered: '', references: '', emotions: '', other: '' },
    type: 'Narrative'
  };
  const [formData, setFormData] = useState(filterKeys(myVariable.summary || {}, defaultFormData));
  const [tags, setTags] = useState({ topicsCovered: "", references: "", emotions: "", other: "" });

  useEffect(() => {
    if (myVariable.workgroup && myVariable.workgroup.workgroup) {
      setFormData((prevState: any) => ({ ...prevState, workgroup: myVariable.workgroup.workgroup, workgroup_id: myVariable.workgroup.workgroup_id }));
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
    setLoading(true);
    const data: any = await saveAgenda(formData);
    console.log("Submitted Form Data:", formData, data);
    setLoading(false);
  }
  
  return (
    <div className={styles['form-container']}>
      <h2>Narrative Template</h2>
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
        <label className={styles['form-label']}>
          Date: (It loads the previous meeting date, please update the meeting date for new meeting)
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={styles['form-input']}
        />
        <NarrativeMeetingInfo workgroup={formData.workgroup} onUpdate={(info: any) => setFormData({...formData, meetingInfo: info})} />
        <NarrativeAgenda onUpdate={(items: any) => setFormData({...formData, agendaItems: items})} />
        <Tags tags={tags} setTags={setTags} />
        <button type="submit" disabled={loading} className={styles['submit-button']}>
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default NarrativeTemplate;
