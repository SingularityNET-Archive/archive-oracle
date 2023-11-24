import styles from '../styles/typea.module.css'; 

const WorkingDocs = ({ handleChange, addNewDoc, docs }: any) => {
  return (
    <div className={styles['column-flex']}>
      <h4>Working Documents</h4>
      {docs.map((doc: any, index: any) => (
        <div className={styles['row-flex-space-between']} key={index}>
          <input
            className={styles['working-doc-input']}
            type="text"
            name="title"
            placeholder="Document Title"
            value={doc.title}
            onChange={(e) => handleChange(e, index)}
            autoComplete='off'
          />
          <input
            className={styles['working-doc-input']}
            type="text"
            name="link"
            placeholder="Document Link"
            value={doc.link}
            onChange={(e) => handleChange(e, index)}
            autoComplete='off'
          />
        </div>
      ))}
      <div>
        <button className={styles['working-doc-add-button']} type="button" onClick={addNewDoc}>Add Another Working Doc</button>
      </div>
    </div>
  );
};

export default WorkingDocs;

