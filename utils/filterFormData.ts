// If your project is using TypeScript, specify types accordingly
type AnyObj = { [key: string]: any };

export function filterFormData(data: AnyObj): AnyObj {
  
  if (data === null || data === undefined || Object.keys(data).length === 0) {
    return {}; // Return an empty object or some default value as appropriate
  }
  if (!data.confirmed) {
    return data; // Return the original data unmodified if not confirmed
  }
  //console.log("data", data)
  const filterObject = (obj: AnyObj): AnyObj => {
    const result: AnyObj = {};
    Object.entries(obj).forEach(([key, value]: [string, any]) => {
      if (key === 'agendaItems') {
        result[key] = value.filter((item: any) => item.status !== 'resolved').map((agendaItem: any) => {
          if (agendaItem.actionItems) {
            agendaItem.actionItems = agendaItem.actionItems.filter((actionItem: any) => actionItem.status !== 'done');
          }
          return agendaItem;
        });
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const filteredChild = filterObject(value);
        if (Object.keys(filteredChild).length > 0) {
          result[key] = filteredChild;
        }
      } else if (Array.isArray(value)) {
        const filteredArray = value.filter(item => item && Object.keys(item).length > 0).map(item => typeof item === 'object' ? filterObject(item) : item);
        if (filteredArray.length > 0) {
          result[key] = filteredArray;
        }
      } else if (value || value === false) {
        result[key] = value;
      }
    });
    return result;
  };

  return filterObject(data);
}
