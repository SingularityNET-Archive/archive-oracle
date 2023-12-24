import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { markdown } = req.body;

      // Forward the request to md-to-pdf service
      const pdfResponse = await axios.post('https://md-to-pdf.fly.dev', new URLSearchParams({
  markdown,
  engine: 'wkhtmltopdf' // Specify the engine here
}), {
        responseType: 'arraybuffer', // To handle binary data
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Send the response back to the client
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=Meeting-Summary.pdf');
      res.send(pdfResponse.data);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error generating PDF' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
