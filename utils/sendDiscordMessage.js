import axios from 'axios';

export async function sendDiscordMessage(summary, renderedMarkdown) {
  const workgroup = summary.workgroup
  const content = `content`;
  const embeds = [
    {
      color: 0x16fa3c,
      title: 'Title',
      url: ``,
      author: {
        name: `author name`,
        url: `url`,
        icon_url: ``,
      },
      description: `description`,
      fields: [
        {
          name: `fields name`,
          value: `fields value`,
          inline: true,
        },
      ],
      footer: {
        text: `footer`
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
    const response = await axios.post('https://genuine-custard-2ef739.netlify.app/api/discord', { content, embeds, workgroup }, { 
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
