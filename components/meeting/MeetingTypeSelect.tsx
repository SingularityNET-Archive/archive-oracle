// src/components/meeting/MeetingTypeSelect.tsx
import React from 'react';
import { meetingTypesConfig } from '../../config/meeting/meetingTypesConfig';
import styles from '../../styles/meetinginfo.module.css';

interface MeetingTypeSelectProps {
  workgroup: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const MeetingTypeSelect: React.FC<MeetingTypeSelectProps> = ({
  workgroup,
  value,
  onChange
}) => {
  const config = meetingTypesConfig[workgroup] || meetingTypesConfig.default;

  return (
    <div className={styles['column-flex']}>
      <label className={styles['form-label']}>
        Type of meeting:
      </label>
      <select
        name="name"
        value={value || config.defaultType}
        onChange={onChange}
        className={styles['form-select']}
        title="Select the type of meeting. If it's a one-off event, please select 'One-off event'"
      >
        {config.types.map(type => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
};