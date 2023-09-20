import axios from 'axios';

export async function updateGitbook(formData) {
  try {
    const response = await axios.post('/api/commitGitbook', formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;
    console.log(data.message);
    return data;
  } catch (error) {
    console.error("There was an error committing the form data", error);
  }
}
