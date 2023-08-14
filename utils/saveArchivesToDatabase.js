import { supabase } from "../lib/supabaseClient";

export async function saveArchivesToDatabase(archives) {
  const rows = [];

  for (const year in archives) {
    for (const monthOrFile in archives[year]) {
      if (typeof archives[year][monthOrFile] === 'string') {
        // File without month value
        const week = monthOrFile.replace('.md', '');
        const content = archives[year][monthOrFile];
        rows.push({ year, month: week, week, content });
      } else {
        // Regular month value
        for (const weekFile in archives[year][monthOrFile]) {
          const week = weekFile.replace('.md', '');
          const content = archives[year][monthOrFile][weekFile];
          rows.push({ year, month: monthOrFile, week, content });
        }
      }
    }
  }

  const { data, error } = await supabase
    .from('archives')
    .upsert(rows, { onConflict: ['year', 'month', 'week'] });

  if (error) {
    console.error('Error upserting data:', error);
    return false;
  }

  return data;
}
