import { supabase } from "../lib/supabaseClient";
  let info = {}

export async function getEmbeddings() {
    
    async function generate() {
      try {
        const { data, error, status } = await supabase
        .from('embeddings_table')
        .select('content, embedding, token_count, slug, heading');
        
        if (error && status !== 406) throw error
        if (data) {
            info = data;
        }
      } catch (error) {
        if (error) {
          info = []
          console.log("error", error.message)
          //alert(error.message);
        } else {
          console.error('Unknown error: ', error);
        }
      }
    }
    
    async function main() {
        await generate()
    }
      
    main().catch((err) => console.error(err))

  return info;
}