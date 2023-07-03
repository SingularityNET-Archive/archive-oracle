import axios from 'axios';

export default async function handler(req, res) {
  const discordToken = process.env.DISCORD_BOT_TOKEN; // Your bot token
  const discordUserId = req.query.userId; // Get the userId from the query parameters
  const guildId = req.query.guildId; // Get the guildId from the query parameters

  try {
    const memberResponse = await axios.get(`https://discord.com/api/guilds/${guildId}/members/${discordUserId}`, {
      headers: {
        'Authorization': `Bot ${discordToken}`
      }
    });

    const rolesResponse = await axios.get(`https://discord.com/api/guilds/${guildId}/roles`, {
      headers: {
        'Authorization': `Bot ${discordToken}`
      }
    });

    const roles = rolesResponse.data.reduce((obj, role) => ({
      ...obj,
      [role.id]: role.name,  // maps id to name
    }), {});

    res.status(200).json({ userRoles: memberResponse.data.roles, roles }); // send the userRoles and roles back
  } catch (error) {
    console.error('Error:', error);
    res.status(error.response.status).json({ message: error.message });
  }
}
