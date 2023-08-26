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

    function filterEmptyValues(info) {
      return info.filter(item => {
        // Filter content by excluding empty workgroups and dates
        item.content = Object.entries(item.content).reduce((workgroupAcc, [workgroup, dates]) => {
          const filteredDates = Object.entries(dates).reduce((dateAcc, [date, summary]) => {
            if (summary.trim() !== "") {
              dateAcc[date] = summary;
            }
            return dateAcc;
          }, {});
    
          if (Object.keys(filteredDates).length > 0) {
            workgroupAcc[workgroup] = filteredDates;
          }
          return workgroupAcc;
        }, {});
    
        // Only include item if content is not empty
        return Object.keys(item.content).length > 0;
      });
    }    

    function parseMeetingSummaries(markdown) {
      const lines = markdown.split('\n');
      const result = {};
      let currentWorkgroup = null;
      let currentDate = null;
      let tempDate = null;
      let currentSummary = "";
    
      lines.forEach((line) => {
        if (line.startsWith('## ')) {
          // Extract the date using a regular expression
          const dateMatch = line.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) \d{1,2}(st|nd|rd|th) [A-Za-z]+ \d{4}/);
          if (dateMatch) {
            tempDate = dateMatch[0];
          }
        } else if (line.startsWith('### ')) {
          if (currentWorkgroup && currentDate) {
            if (!result[currentWorkgroup]) result[currentWorkgroup] = {};
            result[currentWorkgroup][currentDate] = currentSummary.trim();
            currentSummary = "";
          }
    
          currentDate = tempDate; // Set the current date to the temporary date when a new workgroup is found
          currentWorkgroup = line.replace('###', '').replace('<mark style="color:green;">', '').replace('</mark>', '').trim();
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
    //info = filterEmptyValues(info);

  return info;
}