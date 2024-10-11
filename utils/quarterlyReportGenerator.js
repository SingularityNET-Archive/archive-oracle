// utils/quarterlyReportGenerator.js
import { supabase } from "../lib/supabaseClient";
import { generateMarkdown } from './generateMarkdown';

function formatTimestampForPdf(timestamp) {
    // Create a Date object using the timestamp
    const date = new Date(timestamp);
  
    date.setHours(date.getHours() + 2);
  
    const day = date.getUTCDate();
    const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
    const year = date.getUTCFullYear();
  
    return `${day} ${month} ${year}`;
  }

export async function generateQuarterlyReport(workgroup_id, year, quarter, currentOrder) {
  try {
    // Define the start and end dates for the quarter
    const startDate = new Date(Date.UTC(year, (quarter - 1) * 3, 1));
    const endDate = new Date(Date.UTC(year, quarter * 3, 0, 23, 59, 59, 999));
    
    //console.log('Fetching summaries for:', workgroup_id, 'Quarter:', quarter, 'Year:', year);
    //console.log('Date range:', startDate.toISOString(), 'to', endDate.toISOString());

    // Fetch all confirmed summaries for the workgroup
    const { data: allSummaries, error } = await supabase
      .from('meetingsummaries')
      .select('*')
      .eq('workgroup_id', workgroup_id)
      .eq('confirmed', true)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching summaries:', error);
      throw error;
    }

    //console.log('Fetched all summaries:', allSummaries.length);

    // Filter summaries for the specific quarter
    const summaries = allSummaries.filter(summary => {
      const summaryDate = new Date(summary.date);
      return summaryDate >= startDate && summaryDate <= endDate;
    });

    //console.log('Filtered summaries for the quarter:', summaries);

    if (summaries.length === 0) {
      return `# No confirmed summaries found for Q${quarter} ${year}\n\nThere were no confirmed meeting summaries for this quarter.`;
    }

    // Generate markdown for each summary
    let markdownContent = `# Quarterly Summaries for ${summaries[0]?.summary.workgroup || 'Workgroup'} - Q${quarter} ${year}\n\n`;
    
    for (const summary of summaries) {
      markdownContent += `## Summary for ${formatTimestampForPdf(summary.date)}\n\n`;
      markdownContent += generateMarkdown(summary.summary, currentOrder) + '\n\n';
    }

    return markdownContent;
  } catch (error) {
    console.error('Error in generateQuarterlyReport:', error);
    throw error;
  }
}

export function getQuarterOptions() {
  const currentYear = new Date().getFullYear();
  const options = [];

  for (let year = currentYear; year >= currentYear - 2; year--) {
    for (let quarter = 4; quarter >= 1; quarter--) {
      options.push(`Q${quarter} ${year}`);
    }
  }

  return options;
}