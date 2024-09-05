// pages/api/createGoogleDoc.js
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { parseMarkdown } from '../../utils/markdownToGoogleDocs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { markdown, workgroup, date } = req.body;

  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    const jwtClient = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/documents'],
    });

    const drive = google.drive({ version: 'v3', auth: jwtClient });
    const docs = google.docs({ version: 'v1', auth: jwtClient });

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const fileMetadata = {
      name: `Meeting Summary - ${workgroup} - ${date}`,
      mimeType: 'application/vnd.google-apps.document',
      parents: [folderId]
    };
    const file = await drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    });

    const documentId = file.data.id;

    // Parse markdown and create formatting requests
    const requests = parseMarkdown(markdown, workgroup, date);

    // Insert the content into the document
    await docs.documents.batchUpdate({
      documentId: documentId,
      requestBody: { requests },
    });

    // Get the webViewLink of the created document
    const getFile = await drive.files.get({
      fileId: documentId,
      fields: 'webViewLink',
    });

    res.status(200).json({ link: getFile.data.webViewLink });
  } catch (error) {
    console.error('Error creating Google Doc:', error);
    res.status(500).json({ message: 'Error creating Google Doc', error: error.message });
  }
}