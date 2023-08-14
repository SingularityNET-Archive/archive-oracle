import { getDocs } from '../../utils/getDocs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    const archives = await getDocs();
    return res.status(200).json(archives);
  } catch (error) {
    console.error('Error fetching docs:', error);
    return res.status(500).json({ error: 'An error occurred while fetching the documents.' });
  }
}
