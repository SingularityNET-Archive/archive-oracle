import supabase from "../../lib/supabaseClient";

export default async function handler(req, res) {
  const API_KEY = process.env.SERVER_API_KEY;
  const apiKeyHeader = req.headers['api_key'];

  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, api_key'); 
    return res.status(200).end();
  }

  if (!apiKeyHeader || apiKeyHeader !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    let { data, error } = await supabase
      .from('meetingsummaries')
      .select('summary, updated_at, confirmed');
    
    if (error) throw error;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}