import { useState, useEffect } from "react";
import styles from '../styles/typea.module.css'; 
import { useMyVariable } from '../context/MyVariableContext';
import MeetingInfo from '../components/MeetingInfo'
import AgendaItems from '../components/AgendaItems'
import Tags from '../components/Tags'
import { saveAgenda } from '../utils/saveAgenda';

const FullArchivalTemplate = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { myVariable, setMyVariable } = useMyVariable();
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    name: "Weekly Meeting",
    date: today,
    workgroup: "",
    workgroup_id: "",
    meetingInfo: {},  
    agendaItems: [],
    tags: { topicsCovered: "", references: "", emotions: "" },
    type: "FullArchival"
  });
  const [tags, setTags] = useState({ topicsCovered: "", references: "", emotions: "" });

  useEffect(() => {
    if (myVariable.workgroup && myVariable.workgroup.workgroup) {
      setFormData(prevState => ({ ...prevState, workgroup: myVariable.workgroup.workgroup, workgroup_id: myVariable.workgroup.workgroup_id }));
    }
  }, [myVariable.workgroup]);  

  useEffect(() => {
    setFormData(prevState => ({ ...prevState, tags })); 
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
