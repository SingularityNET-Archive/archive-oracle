import styles from '../styles/workingDocsTable.module.css'; 

const WorkingDocs = ({ handleChange, addNewDoc, docs, removeDoc, originalDocsCount, updateMyVariable }: any) => {
  const handleDocChange = (e: any, index: number) => {
    if (index < originalDocsCount) {
      updateMyVariable(e, index);
    } else {
      handleChange(e, index - originalDocsCount);
    }
  };

  const handleDocRemove = (index: number) => {
    if (index < originalDocsCount) {
      updateMyVariable(null, index);
    } else {
      removeDoc(index - originalDocsCount);
    }
  };

  const handleAddNewDoc = () => {
    if (docs.length === 0) {
      // Add the first document
      handleChange({ target: { name: 'title', value: '' } }, 0);
      handleChange({ target: { name: 'link', value: '' } }, 0);
    } else {
      // Add a new document
      addNewDoc();
    }
  };

  const formatUrl = (url: string) => {
    if (!url?.startsWith('http://') && !url?.startsWith('https://')) {
      return `http://${url}`;
    }
    return url;
  };

  return (
    <>
      <label className={styles.label}>Working Docs</label>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr className={styles.tr}>
            <th>Title</th>
            <th>Link</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {docs.map((doc: any, index: number) => (
            <tr className={styles.tr} key={index}>
              <td className={styles.td}>
                <input
                  className={styles.input}
                  type="text"
                  name="title"
                  value={doc.title}
                  onChange={(e) => handleDocChange(e, index)}
                />
              </td>
              <td className={`${styles.td} ${styles.centerAligned} ${styles.linkCell}`}>
                {/* Change here: Always show input fields if there's only one row */}
                {(docs.length === 1 || index >= originalDocsCount) ? (
                  <input
                    className={styles.input}
                    type="text"
                    name="link"
                    value={doc.link}
                    onChange={(e) => handleDocChange(e, index)}
                  />
                ) : (
                  <a href={formatUrl(doc.link)} target="_blank" rel="noopener noreferrer">Link</a>
                )}
              </td>
              <td className={`${styles.td} ${styles.centerAligned}`}>
                <button className={styles.removeButton} type="button" onClick={() => handleDocRemove(index)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className={styles.button} type="button" onClick={handleAddNewDoc}>Add New Working Document</button>
    </>
  );
};

export default WorkingDocs;
