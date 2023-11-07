import axios from 'axios';

export async function sendDiscordMessage(myVariable, markdown) {
  const workgroup = myVariable.summary.workgroup
  const username = myVariable.summary.username
  const purpose = myVariable.summary.meetingInfo.purpose
  const content = ``;
  const embeds = [
    {
      color: 0x16fa3c,
      title: `${workgroup} meeting summary`,
      url: ``,
      author: {
        name: ``,
      },
      description: `Purpose - ${purpose}`,
      fields: [
        {
          name: `fields name`,
          value: `fields value`,
          inline: true,
        },
      ],
      footer: {
        text: `Summary created by ${username}`
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

  console.log("SendDiscord", "Content", content, "Embeds", embeds, workgroup)
  try {
    const response = await axios.post('http://localhost:3000/api/discord', { content, embeds, workgroup }, { 
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
