import { useState } from "react";
import type { NextPage } from "next";
import styles from '../styles/admintools.module.css';
import { exportTags, exportUsers } from '../utils/exportUtils';

const AdminTools: NextPage = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = async (entity: 'tags' | 'users', format: 'csv' | 'pdf' | 'json') => {
    setLoading(true);
    if (entity === 'tags') {
      await exportTags(format);
    } else if (entity === 'users') {
      await exportUsers(format);
    }
    setLoading(false);
  };

  // Simplified and more scalable structure for export operations
  const exportOperations = [
    {
      entity: 'Tags',
      formats: ['csv', 'pdf', 'json'],
    },
    {
      entity: 'Users',
      formats: ['csv', 'pdf', 'json'],
    },
    // Example of how to add a new entity
    // {
    //   entity: 'NewEntity',
    //   formats: ['csv', 'pdf'],
    // },
  ];

  return (
    <div className={styles.container}>
      {!loading && (
        <div>
          <h1>Admin Tools</h1>
          {exportOperations.map((operation: any) => (
            <div key={operation.entity} className={styles.column}>
              <h2 className={styles.columnHeading}>{operation.entity}</h2>
              {operation.formats.map((format: any) => (
                <button
                  key={format}
                  className={styles.button}
                  onClick={() => handleExport(operation.entity.toLowerCase(), format)}
                >
                  Export {operation.entity} ({format.toUpperCase()})
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTools;
