import { supabase } from "../lib/supabaseClient";
  let summary = []

export async function getSummaries(workgroup_id) {
    
    async function getMeetingSummaries() {
      try {
        const { data, error, status } = await supabase
        .from('meetingsummaries')
        .select('template, date, summary')
        .eq('workgroup_id', workgroup_id)
        .order('date', { ascending: false })  
        .order('created_at', { ascending: false }) 
        .limit(1);  
        
        if (error && status !== 406) throw error
        if (data) {
            summary = data[0].summary;
        }
      } catch (error) {
        if (error) {
            summary = undefined
          console.log("error", error.message)
        } else {
          console.error('Unknown error: ', error);
        }
      }
    }
    
    await getMeetingSummaries();

  return summary;
}