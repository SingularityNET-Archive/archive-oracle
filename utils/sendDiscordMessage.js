import axios from 'axios';

function markdownHeadingsToBold(rawmarkdown) {
  // This regex will match markdown headings, capturing the text after the hashes.
  const headingRegex = /(?:^|\n)(#+)([^\n]+)/g;

  return rawmarkdown.replace(headingRegex, (match, hashes, text) => {
    // Replace the hashes with bold syntax.
    return `${hashes.replace(/#/g, '').length > 0 ? '\n' : ''}**${text.trim()}**`;
  });
}

export async function sendDiscordMessage(myVariable, markdown) {
  const workgroup = myVariable.summary.workgroup
  const username = myVariable.summary.username
  const archivist = myVariable.currentUser
  const purpose = myVariable.summary.meetingInfo.purpose
  const date = myVariable.summary.meetingInfo.date
  const formattedMarkdown = markdownHeadingsToBold(markdown)
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
      fields: [
        {
          name: `Meeting Info`,
          value: `${formattedMarkdown}`,
          inline: true,
        },
      ],
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
