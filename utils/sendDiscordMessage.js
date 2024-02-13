import axios from 'axios';

function parseMarkdownToEmbedFields(rawmarkdown) {
  const fieldsArray = [];
  // Split the raw markdown by lines
  const lines = rawmarkdown.split('\n');

  let meetingInfo = '';
  let currentFieldName = '';
  let currentValue = '';
  let parsingMeetingInfo = true; // Flag to indicate we are parsing the meeting info

  lines.forEach((line, index) => {
    // Check if we are still parsing the meeting info
    if (parsingMeetingInfo) {
      if (line.startsWith('#### ')) {
        // Stop parsing meeting info if the next line is a heading that is not an agenda item
        if (!lines[index + 1] || !lines[index + 1].startsWith('#### Agenda item')) {
          parsingMeetingInfo = false;
          // Add the meeting info as the first field
          fieldsArray.push({ name: "Meeting Info", value: meetingInfo.trim() });
          meetingInfo = '';
        }
      } else {
        meetingInfo += (meetingInfo ? '\n' : '') + line.trim();
      }
    }

    if (!parsingMeetingInfo) {
      if (line.startsWith('#### Agenda item')) {
        // When we encounter an agenda item, we process the previous field
        if (currentFieldName) {
          fieldsArray.push({ name: currentFieldName, value: currentValue.trim() });
        }
        // Reset the currentValue for the new field
        currentValue = '';
        // Extract the agenda item number and the rest of the line as the field name and value respectively
        const agendaMatch = line.match(/#### (Agenda item \d+)(.*)/);
        if (agendaMatch && agendaMatch.length > 2) {
          currentFieldName = agendaMatch[1].trim(); // This is "Agenda item X"
          currentValue = agendaMatch[2].trim(); // This is the rest of the line after "Agenda item X"
        }
      } else if (line.startsWith('#### ')) {
        // Process the previous field if it exists
        if (currentFieldName) {
          fieldsArray.push({ name: currentFieldName, value: currentValue.trim() });
          currentFieldName = '';
          currentValue = '';
        }
        // Start a new field
        currentFieldName = line.replace('#### ', '').trim();
      } else {
        // If we're not parsing meeting info, add content to the current value
        currentValue += (currentValue ? '\n' : '') + line.trim();
      }
    }
  });

  // Add the last field if it exists
  if (currentFieldName || currentValue) {
    fieldsArray.push({ name: currentFieldName, value: currentValue.trim() });
  }

  return fieldsArray;
}

function createDiscordEmbeds(rawmarkdown, title, footerText) {
  const MAX_EMBED_DESCRIPTION_LENGTH = 2048;
  const MAX_FIELD_VALUE_LENGTH = 1024;
  const MAX_EMBED_FOOTER_TEXT_LENGTH = 2048;
  const MAX_EMBED_CHARACTER_COUNT = 6000;

  let fields = parseMarkdownToEmbedFields(rawmarkdown);
  let embeds = [];
  let currentEmbed = {
    color: 0x3a24c9,
    title: title || '',
    fields: [],
    footer: {}
  };
  let currentEmbedCharCount = currentEmbed.title.length;

  fields.forEach(field => {
    let fieldValue = field.value;
    // If adding this field would exceed the max length for a field value, split it
    while (fieldValue.length > 0) {
      let sliceLength = Math.min(fieldValue.length, MAX_FIELD_VALUE_LENGTH);
      let fieldValueSlice = fieldValue.slice(0, sliceLength);
      let fieldCharCount = field.name.length + fieldValueSlice.length;

      // If adding this field would exceed the max length for an embed, create a new one
      if (currentEmbedCharCount + fieldCharCount > MAX_EMBED_CHARACTER_COUNT ||
          currentEmbed.fields.length === 25) { // Also check for max field count per embed
        // Finalize the current embed
        embeds.push(currentEmbed);
        // Start a new embed
        currentEmbed = {
          fields: [],
          footer: {}
        };
        currentEmbedCharCount = 0;
      }

      // Add the field to the current embed
      currentEmbed.fields.push({
        name: field.name,
        value: fieldValueSlice
      });

      // Adjust the character count
      currentEmbedCharCount += fieldCharCount;
      // Slice the processed part off the field value
      fieldValue = fieldValue.slice(sliceLength);
      // Continue with the same name but empty it to not add it again
      field.name = '';
    }
  });

  // Add footer to the last embed
  if (footerText && footerText.length <= MAX_EMBED_FOOTER_TEXT_LENGTH) {
    currentEmbed.footer.text = footerText;
  }

  // Push the last embed if it has any fields
  if (currentEmbed.fields.length > 0) {
    embeds.push(currentEmbed);
  }

  // Remove title from subsequent embeds
  if (embeds.length > 1) {
    embeds.forEach((embed, index) => {
      if (index > 0) delete embed.title;
    });
  }

  return embeds;
}


export async function sendDiscordMessage(myVariable, markdown) {
  const embedRegex = /\{% embed url="([^"]+)" %\}/g;
  const updatedMarkdown = markdown.replace(embedRegex, (match, url) => {
    // Check if the URL is a YouTube video
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return `[Watch Video](${url})`; // Replace with a descriptive text for videos
    } else if (url.includes("google.slides.com") || url.includes("docs.google.com/presentation")) {
      return `[View Slides](${url})`; // Replace with a descriptive text for slides
    } else {
      return `[Link](${url})`; // A generic replacement for other URLs
    }
  });
  markdown = updatedMarkdown;
  
  const workgroup = myVariable.summary.workgroup;
  const username = myVariable.summary.meetingInfo.documenter;
  const archivist = myVariable.currentUser;
  const dateObj = new Date(myVariable.summary.meetingInfo.date);
  // Format the date to "24 January 2024" format
  const formattedDate = dateObj.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  // Use the new function to create embeds
  const title = `${workgroup} -> ${formattedDate} meeting summary`;
  const footerText = `Summary created by ${username} and archived by ${archivist}`;
  const embeds = createDiscordEmbeds(markdown, title, footerText);

  console.log("Attempting to send Discord Message");
  try {
    const response = await axios.post('/api/discord', { content: '', embeds, workgroup }, { 
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error('Failed to send message');
    }
    console.log('Message sent successfully:', response.data);
  } catch (error) {
    console.error('Failed to send Discord message:', error);
    if (error.response) {
      console.error('Response error:', error.response.data);
    }
  }
}
