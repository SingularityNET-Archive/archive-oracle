import { supabase } from "../lib/supabaseClient";
  let info = {}

export async function getArchives() {
    
    async function getData() {
        try {
          const { data, error, status } = await supabase
            .from('archives')
            .select('year, month, week, content');
    
          if (error && status !== 406) throw error;
          if (data) {
            info = data.map(item => {
              return {
                ...item,
                content: parseMeetingSummaries(item.content)
              };
            });
          }
        } catch (error) {
          if (error) {
            info = [];
            console.log("error", error.message);
            //alert(error.message);
          } else {
            console.error('Unknown error: ', error);
          }
        }
    }

    function parseMeetingSummaries(markdown) {
        const lines = markdown.split('\n');
        const result = {};
        let currentWorkgroup = null;
        let currentDate = null;
        let currentSummary = "";
      
        lines.forEach((line) => {
          if (line.startsWith('### ')) {
            if (currentWorkgroup && currentDate) {
              if (!result[currentWorkgroup]) result[currentWorkgroup] = {};
              result[currentWorkgroup][currentDate] = currentSummary.trim();
              currentSummary = "";
            }
      
            currentWorkgroup = line.replace('###', '').replace('<mark style="color:green;">', '').replace('</mark>', '').trim();
          } else if (line.startsWith('## ')) {
            currentDate = line.replace('##', '').trim();
          } else if (currentWorkgroup && currentDate) {
            currentSummary += line + '\n';
          }
        });
      
        if (currentWorkgroup && currentDate) {
          if (!result[currentWorkgroup]) result[currentWorkgroup] = {};
          result[currentWorkgroup][currentDate] = currentSummary.trim();
        }
      
        return result;
      }
    
    await getData();

  return info;
}