import axios from 'axios';

export default async function handler(req: any, res: any) {
  const discordToken = process.env.DISCORD_BOT_TOKEN; // Your bot token
  const discordUserId = req.query.userId; // Get the userId from the query parameters
  const guildId = req.query.guildId; // Get the guildId from the query parameters

  try {
    const memberResponse = await axios.get(`https://discord.com/api/guilds/${guildId}/members/${discordUserId}`, {
      headers: {
        'Authorization': `Bot ${discordToken}`
      }
    });

    /*const rolesResponse = await axios.get(`https://discord.com/api/guilds/${guildId}/roles`, {
      headers: {
        'Authorization': `Bot ${discordToken}`
      }
    });

    const roles = rolesResponse.data.reduce((obj, role) => ({
      ...obj,
      [role.id]: role.name,  // maps id to name
    }), {});*/

    const userRoles = memberResponse.data.roles;

    // Check if user has the admin role
    const isAdmin: any = userRoles.includes("972427271153516574");

    res.status(200).json({ isAdmin }); // send the isAdmin status back
  } catch (error: any) {
    console.error('Error:', error);
    res.status(error.response.status).json({ message: error.message });
  }
}