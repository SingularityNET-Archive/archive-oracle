import axios from 'axios';

function markdownHeadingsToBold(rawmarkdown) {
  // This regex will match markdown headings, capturing the text after the hashes.
  const headingRegex = /(?:^|\n)(#+)([^\n]+)/g;

  return rawmarkdown.replace(headingRegex, (match, hashes, text) => {
    // Replace the hashes with bold syntax.
    return `${hashes.replace(/#/g, '').length > 0 ? '\n' : ''}**${text.trim()}**`;
  });
}

function parseMarkdownToEmbedFields(rawmarkdown) {
  const fieldsArray = [];
  // Split the raw markdown by lines
  const lines = rawmarkdown.split('\n');

  // Initialize a variable to hold the meeting info as a string
  let meetingInfo = '';
  let parsingMeetingInfo = true; // Flag to indicate we are parsing the meeting info

  lines.forEach((line) => {
    // Check if we are still parsing the meeting info
    if (parsingMeetingInfo) {
      // If the line is a heading, we have reached the end of the meeting info
      if (line.startsWith('#### ')) {
        parsingMeetingInfo = false;
        // Add the meeting info as the first field
        fieldsArray.push({ name: "Meeting Info", value: meetingInfo.trim() });
      } else {
        // Add the line to the meeting info, with a newline if not empty
        meetingInfo += (meetingInfo ? '\n' : '') + line.trim();
      }
    }
    
    // If we're past the meeting info, start adding fields for each heading
    if (!parsingMeetingInfo) {
      if (line.startsWith('#### ')) {
        // Create a new field object with the heading as 'name'
        const fieldName = line.replace('#### ', '').trim();
        fieldsArray.push({ name: fieldName, value: '' });
      } else if (fieldsArray.length > 0 && line.trim() !== '') {
        // Add the line to the 'value' of the last field object, ensuring to add line breaks as necessary
        fieldsArray[fieldsArray.length - 1].value += (fieldsArray[fieldsArray.length - 1].value ? '\n' : '') + line.trim();
      }
    }
  });

  return fieldsArray;
}

export async function sendDiscordMessage(myVariable, markdown) {
  const workgroup = myVariable.summary.workgroup
  const username = myVariable.summary.username
  const archivist = myVariable.currentUser
  //const purpose = myVariable.summary.meetingInfo.purpose
  const date = myVariable.summary.meetingInfo.date
  //const formattedMarkdown = markdownHeadingsToBold(markdown)
  const fields = parseMarkdownToEmbedFields(markdown);
  const content = ``;
  const embeds = [
    {
      color: 0x16fa3c,
      title: `${workgroup} -> ${date} meeting summary`,
      url: ``,
      author: {
        name: ``,
      },
      description: ``,
      fields: fields,
      footer: {
        text: `Summary created by ${username} and archived by ${archivist}`
        //icon_url: 'https://github.com/treasuryguild/Treasury-Guild/raw/main/logo132.png',
      },
    },
  ];

  /*if(myVariable.thumbnail_url) {
    embeds[0].thumbnail = { url: myVariable.thumbnail_url };
  }

  if(myVariable.image_url) {
    embeds[0].image = { url: myVariable.image_url };
  }*/

  console.log("Attempting to send Discord Message")
  try {
    const response = await axios.post('/api/discord', { content, embeds, workgroup }, { 
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error('Failed to send message');
    }    
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.data);
    }
  }
}
