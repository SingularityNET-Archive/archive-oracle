// pages/api/convertToPdf.js
import { mdToPdf } from 'md-to-pdf';
import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { markdown } = req.body;

      // Start a new browser instance
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Necessary for certain deployment platforms
      });

      const pdf = await mdToPdf({ content: markdown, browser }).catch(console.error);

      // Close the browser instance after you're done with it
      await browser.close();

      if (pdf) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Meeting-Summary.pdf');
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
