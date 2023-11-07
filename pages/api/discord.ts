import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { content, embeds, workgroup } = req.body;
  
  let webhookUrl: string | undefined;
  const webhookUrls: { [key: string]: string | undefined } = {
    'Archival Workgroup': process.env.DISCORD_WEBHOOK_URL,
  };
    
  
  webhookUrl = webhookUrls[workgroup] //remember to change to webhookUrls[walletSuffix];

  const avatarUrl = 'https://github.com/treasuryguild/treasury-dapp/raw/main/public/logo132.png';

  if (typeof webhookUrl === 'undefined') {
    webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return res.status(500).json({ error: 'Discord webhook URL is not defined' });
    }
  }
  
  // Get data from the client-side
  
  axios.post(webhookUrl, {
    username: 'Archive Oracle',
    avatar_url: avatarUrl,
    content: content,
    embeds: embeds,
  })
    .then((response) => {
      res.status(200).json({ message: 'Message sent successfully' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Failed to send message', axiosError: err.message });
    });
}