// src/config/meeting/meetingTypesConfig.ts
import { WorkgroupMeetingTypes } from '../../types/meeting';

export const meetingTypesConfig: WorkgroupMeetingTypes = {
  default: {
    defaultType: 'Weekly',
    types: [
      { value: 'Weekly', label: 'Weekly' },
      { value: 'Biweekly', label: 'Biweekly' },
      { value: 'Monthly', label: 'Monthly' },
      { value: 'One-off event', label: 'One-off event' },
    ]
  },
  'AI Sandbox/Think-tank': {
    defaultType: 'Weekly',
    types: [
      { value: 'Sandbox', label: 'Sandbox' },
      { value: 'Think-Tank', label: 'Think-Tank' },
    ]
  }
};