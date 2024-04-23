// netlify/functions/getMeetingSummaries.js
import { supabase } from '../../lib/supabaseClient';

export const handler = async (event, context) => {
  try {
    const { data, error } = await supabase
      .from('meetingsummaries')
      .select('summary');

    if (error) {
      console.error('Error retrieving meeting summaries:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to retrieve meeting summaries' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error in getMeetingSummaries function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};