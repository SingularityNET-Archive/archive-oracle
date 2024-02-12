// pages/api/fetchCsv.js

export default async function handler(req, res) {
  const csvUrl = 'https://raw.githubusercontent.com/SingularityNET-Archive/SingularityNET-Archive/main/Data/status-of-summaries.csv';

  try {
    const csvResponse = await fetch(csvUrl);
    const csvText = await csvResponse.text();

    // Convert CSV text to JSON
    const json = csvToJson(csvText); // Implement this function based on your CSV structure

    res.status(200).json(json);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch CSV data" });
  }
}

function csvToJson(csv) {
  const lines = csv.split('\n');
  const result = [];
  const headers = lines[0].split(',');

  for (let i = 1; i < lines.length; i++) {
    const currentline = lines[i].split(',');
    // Check if the line is empty or consists of only whitespace
    if (currentline.length === 1 && currentline[0].trim() === '') {
      continue; // Skip this iteration, effectively ignoring the empty row
    }

    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }

    result.push(obj);
  }

  return result;
}
