import { useState } from 'react';
import styles from '../styles/SubmitMissingSummary.module.css'; 
import { saveMissingSummary } from '../utils/saveMissingSummaries'; 

function formatDate(dateString: any) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    const formattedDate = `${date.getDate()} ${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;
    return formattedDate;
}

const SubmitMissingSummary = ({ workgroups, allSummaries, allArchivedSummaries }: any) => {
  const [selectedWorkgroup, setSelectedWorkgroup] = useState<{ workgroup: string; workgroup_id: string; } | null>(null);
  const [meetingDate, setMeetingDate] = useState('');
  
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (selectedWorkgroup && meetingDate) {
      const missingSummaryData = {
        workgroup: selectedWorkgroup.workgroup,
        workgroupId: selectedWorkgroup.workgroup_id,
        meetingDate: formatDate(meetingDate),
        status: "Missing",
        type: "weekly"
      };
      
      // Combine allSummaries and allArchivedSummaries, considering all as "Done" for conflict checking
      const combinedSummaries = [...allSummaries, ...allArchivedSummaries.map((summary: any) => ({...summary, status: "Done"}))];
      
      const newRow = {
        meetingDate: formatDate(meetingDate),
        workgroup: selectedWorkgroup.workgroup,
        status: "Missing"
      };

      const conflictSummary = combinedSummaries.find((summary: any) =>
        summary.meetingDate === newRow.meetingDate && summary.workgroup === newRow.workgroup
      );
  
      // If a summary exists for the same meetingDate and workgroup, alert the user
      if (conflictSummary) {
        alert(`This meeting is already marked as ${conflictSummary.status}.`);
        return; // Prevent the submission
      }
      
      const summariesToUpdate = [...combinedSummaries, newRow];
  
      try {
        // Save the missing summary
        const saveResponse = await saveMissingSummary(missingSummaryData);
        console.log('Save missing summary response:', saveResponse);
  
        // Update the CSV in GitHub
        const response = await fetch('/api/updateCSV', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              owner: "SingularityNET-Archive",
              repo: "SingularityNET-Archive",
              path: "Data/status-of-summaries.csv",
              summariesToUpdate
            }),
          });
      
          if (!response.ok) {
            throw new Error('Failed to update CSV');
          }
      
          const responseData = await response.json();
          console.log('CSV updated successfully:', responseData);
      
          setSelectedWorkgroup(null);
          setMeetingDate('');
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="workgroupSelect">Workgroup:</label>
        <select
          id="workgroupSelect"
          value={selectedWorkgroup ? selectedWorkgroup.workgroup : ''}
          onChange={(e) => {
            const selectedValue = e.target.value;
            const workgroupObject = workgroups.find((group: any) => group.workgroup === selectedValue);
            setSelectedWorkgroup(workgroupObject || null);
          }}
          required
        >
          <option value="">Select a workgroup</option>
          {workgroups.map((group: any) => (
            <option key={group.workgroup_id} value={group.workgroup}>
              {group.workgroup}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="meetingDate">Meeting Date:</label>
        <input
          type="date"
          id="meetingDate"
          value={meetingDate}
          onChange={(e) => setMeetingDate(e.target.value)}
          required
        />
      </div>
      <button type="submit" className={styles.submitButton}>Submit Missing Summary</button>
    </form>
  );
};

export default SubmitMissingSummary;
