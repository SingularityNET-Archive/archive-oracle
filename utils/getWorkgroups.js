import { supabase } from "../lib/supabaseClient";
  let workgroups = {}

export async function getWorkgroups() {
    
    async function getGroups() {
      try {
        const { data, error, status } = await supabase
        .from('workgroups')
        .select('workgroup_id, workgroup, preferred_template, last_meeting_id');
        
        if (error && status !== 406) throw error
        if (data) {
            workgroups = data;
        }
      } catch (error) {
        if (error) {
            workgroups = []
          console.log("error", error.message)
          //alert(error.message);
        } else {
          console.error('Unknown error: ', error);
        }
      }
    }
    
    await getGroups();

  return workgroups;
}