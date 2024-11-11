import { supabase } from "../lib/supabaseClient";
  let names = []

export async function getNames() {
    
    async function getContributors() {
      try {
        const { data, error, status } = await supabase
        .from('names')
        .select('name')
        .eq('approved', true)
        .order('name', { ascending: true });
        
        if (error && status !== 406) throw error
        if (data) {
            names = data;
        }
      } catch (error) {
        if (error) {
            names = []
          console.log("error", error.message)
          //alert(error.message);
        } else {
          console.error('Unknown error: ', error);
        }
      }
    }
    
    await getContributors();

  return names;
}