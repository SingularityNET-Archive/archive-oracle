import { supabase } from "../lib/supabaseClient";
import axios from 'axios';

let info = {}

export async function compareMarkdown(docs) {
    
    async function compare() {
      /*try {
        const { error: fetchPageError, data: existingPage } = await supabase
        .from('docs_page')
        .select('id, path, checksum, parentPage:parent_page_id(id, path)')
        .filter('path', 'eq', path)
        .limit(1)
        .maybeSingle()

        if (fetchPageError) {
          throw fetchPageError
        }
        if (existingPage) {
            info = existingPage;
        }
      } catch (error) {
        if (error) {
          info = []
          console.log("error", error.message)
          //alert(error.message);
        } else {
          console.error('Unknown error: ', error);
        }
      }*/
    }
    
    async function main() {
        await compare()
    }
      
    main().catch((err) => console.error(err))

  return info;
}