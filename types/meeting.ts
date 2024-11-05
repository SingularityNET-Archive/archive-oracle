// src/types/meeting.ts
export type MeetingType = {
    value: string;
    label: string;
  };
  
  export type WorkgroupMeetingTypes = {
    [key: string]: {
      defaultType: string;
      types: MeetingType[];
    };
  };