import { mdToPdf } from 'md-to-pdf';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { markdown } = req.body;
      const pdf = await mdToPdf({ content: markdown }).catch(console.error);

      if (pdf) {
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdf.content);
      } else {
        res.status(500).json({ message: 'Error generating PDF' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
