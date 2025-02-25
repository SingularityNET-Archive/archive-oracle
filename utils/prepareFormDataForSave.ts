// ../utils/prepareFormDataForSave.ts

export function prepareFormDataForSave(rawData: any) {
    const filteredWorkingDocs = rawData.meetingInfo?.workingDocs?.filter(
      (doc: any) => doc.title || doc.link
    );
    let newData = {
      ...rawData,
      meetingInfo: {
        ...rawData.meetingInfo,
        workingDocs: filteredWorkingDocs,
      },
      noSummaryGiven: rawData.noSummaryGiven || false,
      canceledSummary: rawData.canceledSummary || false,
      noSummaryGivenText: rawData.noSummaryGivenText || "",
      canceledSummaryText: rawData.canceledSummaryText || "",
      type: 'custom'
    };
  
    // Specify the root-level keys you want to remove
    const keysToRemove = ['username', 'meeting_id','confirmed','date','updated_at']; 
  
    keysToRemove.forEach(key => {
      if (key in newData) {
        delete newData[key];
      }
    });
  
    return removeEmptyValues(newData);
  }
  
  function removeEmptyValues(obj: any) {
    if (typeof obj !== "object" || !obj) return obj;
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
        obj[key] = removeEmptyValues(obj[key]);
        if (Object.keys(obj[key]).length === 0) {
          delete obj[key];
        }
      } else if (Array.isArray(obj[key])) {
        obj[key] = obj[key]
          .map((item: any) => removeEmptyValues(item))
          .filter(
            (item: any) =>
              item !== "" &&
              !(Array.isArray(item) && item.length === 0) &&
              !(typeof item === "object" && Object.keys(item).length === 0)
          );
        if (obj[key].length === 0) {
          delete obj[key];
        }
      } else {
        if (obj[key] === "") {
          delete obj[key];
        }
      }
    });
    return obj;
  }
  