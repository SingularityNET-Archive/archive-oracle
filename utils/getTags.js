import { supabase } from "../lib/supabaseClient";
  let tags = []

export async function getTags() {
    
    async function getAllTags() {
      try {
        const { data, error, status } = await supabase
        .from('tags')
        .select('tag, type');
        
        if (error && status !== 406) throw error
        if (data) {
            tags = data;
        }
      } catch (error) {
        if (error) {
            tags = []
          console.log("error", error.message)
          //alert(error.message);
        } else {
          console.error('Unknown error: ', error);
        }
      }
    }
    
    await getAllTags();

  return tags;
}