// config.js
const isTestMode = process.env.NEXT_PUBLIC_NODE_ENV === 'test';

const tableSuffix = isTestMode ? '_test' : '';

export const tableNames = {
  meetingsummaries: `meetingsummaries${tableSuffix}`,
  documents: `documents${tableSuffix}`,
  // Add more table names as needed
};