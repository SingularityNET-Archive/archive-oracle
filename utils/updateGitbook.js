import axios from 'axios';
import { confirmedStatusUpdate } from '../utils/confirmedStatusUpdate'

export async function updateGitbook(formData) {
  try {
    const response = await axios.post('/api/commitGitbook', formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;
    if (data) {
      await confirmedStatusUpdate(formData)
    }
    console.log(data.message);
    return data;
  } catch (error) {
    console.error("There was an error committing the form data", error);
  }
}
