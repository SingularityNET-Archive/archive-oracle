import styles from '../styles/workingDocsTable.module.css';

type Doc = {
  title?: string;
  link?: string;
};

type WorkingDocsProps = {
  /** The complete array of docs, both old + newly added. */
  docs: Doc[];
  /**
   * Number of docs that existed in the DB before.
   * If `index < originalDocsCount`, we treat it as an "existing doc".
   * Otherwise, it's a newly added doc.
   */
  originalDocsCount: number;

  /** Called when a NEW doc changes (indexes >= originalDocsCount). */
  handleChange: (e: any, newDocIndex: number) => void;

  /** Called when the user clicks "Add New Working Document". */
  addNewDoc: () => void;

  /** Called to remove a NEW doc from the parent's state. */
  removeDoc: (newDocIndex: number) => void;

  /**
   * Called to update an OLD doc (i.e. in DB).
   * If `e === null`, it means remove. Otherwise it's a change event.
   */
  updateMyVariable: (e: any | null, oldDocIndex: number) => void;
};

const WorkingDocs = ({
  docs,
  originalDocsCount,
  handleChange,
  addNewDoc,
  removeDoc,
  updateMyVariable
}: WorkingDocsProps) => {

  /**
   * Called whenever an input changes in the table row.
   * If it's an existing doc (index < originalDocsCount),
   * we call `updateMyVariable`. Otherwise, we call `handleChange`.
   */
  const handleDocChange = (e: any, index: number) => {
    if (index < originalDocsCount) {
      // This is an existing doc from the DB
      updateMyVariable(e, index);
    } else {
      // This is a newly added doc
      handleChange(e, index - originalDocsCount);
    }
  };

  /**
   * Called when the user clicks the "X" to remove a doc row.
   * If it's an existing doc, call `updateMyVariable(null, index)`.
   * If it's a new doc, call `removeDoc(...)`.
   */
  const handleDocRemove = (index: number) => {
    if (index < originalDocsCount) {
      // Remove an existing doc from DB or mark it removed
      updateMyVariable(null, index);
    } else {
      // Remove a new doc from local state
      removeDoc(index - originalDocsCount);
    }
  };

  /**
   * Called when the user clicks "Add New Working Document".
   * If we currently have 0 docs, we initialize the first doc as empty.
   * Otherwise, we call `addNewDoc()` to push another blank doc to local.
   */
  const handleAddNewDoc = () => {
    if (docs.length === 0) {
      // For the first doc, we want it to be treated as a new doc
      addNewDoc();
    } else {
      addNewDoc();
    }
  };

  /** Utility function to ensure links have a protocol. */
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
          {docs.map((doc: Doc, index: number) => (
            <tr className={styles.tr} key={index}>
              {/* TITLE */}
              <td className={styles.td}>
                <input
                  className={styles.input}
                  type="text"
                  name="title"
                  autoComplete="off"
                  value={doc?.title ?? ''}
                  onChange={(e) => handleDocChange(e, index)}
                />
              </td>

              {/* LINK */}
              <td className={`${styles.td} ${styles.centerAligned} ${styles.linkCell}`}>
                {index >= originalDocsCount || docs.length === 1 ? (
                  <input
                    className={styles.input}
                    type="text"
                    name="link"
                    autoComplete="off"
                    value={doc?.link ?? ''}
                    onChange={(e) => handleDocChange(e, index)}
                  />
                ) : (
                  // For existing docs, show a clickable link
                  <a href={formatUrl(doc.link || '')} target="_blank" rel="noopener noreferrer">
                    Link
                  </a>
                )}
              </td>

              {/* REMOVE BUTTON */}
              <td className={`${styles.td} ${styles.centerAligned} ${styles.removeButtonColumn}`}>
                <button
                  className={styles.removeButton}
                  type="button"
                  onClick={() => handleDocRemove(index)}
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className={styles.button} type="button" onClick={handleAddNewDoc}>
        Add New Working Document
      </button>
    </>
  );
};

export default WorkingDocs;
