// exportUtils.ts
import { supabase } from "../lib/supabaseClient";
import axios from 'axios';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate(); 
  const months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];
  const month = months[date.getMonth()]; 
  const year = date.getFullYear(); 

  return `${day} ${month} ${year}`; 
};

const convertToMarkdown = (data: any[]): string => {
  let markdown = '';
  const headers = Object.keys(data[0]).join(' | ');
  markdown += `| ${headers} |\n| ${new Array(headers.length).fill('-').join(' | ')} |\n`;

  data.forEach((item) => {
    const formattedItem = Object.entries(item).map(([key, value]) => {
      if (key === 'created_at') {
        return formatDate(value as string);
      }
      return value;
    });
    const values = formattedItem.join(' | ');
    markdown += `| ${values} |\n`;
  });

  return markdown;
};

const convertToCsv = (data: any[]): string => {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map((item) =>
    Object.entries(item).map(([key, value]) => {
      if (key === 'created_at') {
        return `"${formatDate(value as string)}"`;
      }
      return `"${value}"`;
    }).join(',')
  );
  return `${headers}\n${rows.join('\n')}`;
};

const exportAsCsv = async (data: any[]) => {
  const csvData = convertToCsv(data);
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Export.csv'; // Consider making the filename dynamic
  link.click();
};

const exportAsPdf = async (data: any[]) => {
  const markdown = convertToMarkdown(data);
  const pdfResponse = await axios.post('/api/convertToPdf', { markdown }, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Export.pdf'); // Consider making the filename dynamic
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const exportAsJson = async (data: any[]) => {
  console.log("Json", data)
};

const exportStrategies = {
  csv: exportAsCsv,
  pdf: exportAsPdf,
  json: exportAsJson,
};

const exportData = async (format: 'csv' | 'pdf' | 'json', data: any[]) => {
  const exportStrategy = exportStrategies[format];
  if (!exportStrategy) {
    throw new Error(`Export format '${format}' is not supported.`);
  }
  await exportStrategy(data);
};

export const exportTags = async (format: 'csv' | 'pdf' | 'json') => {
  try {
    const { data, error } = await supabase.from('tags').select('created_at, type, tag');
    if (error) {
      console.error('Error exporting tags:', error);
      return;
    }
    await exportData(format, data);
  } catch (error) {
    console.error('Error exporting tags:', error);
  }
};

export const exportUsers = async (format: 'csv' | 'pdf' | 'json') => {
  try {
    const { data, error } = await supabase.from('users').select('created_at, global_name');
    if (error) {
      console.error('Error exporting users:', error);
      return;
    }
    await exportData(format, data);
  } catch (error) {
    console.error('Error exporting users:', error);
  }
};
