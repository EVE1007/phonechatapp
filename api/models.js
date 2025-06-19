export default async function handler(req, res) {
  // 处理CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, apiKey } = req.body;

    if (!url || !apiKey) {
      return res.status(400).json({ error: 'Missing URL or API key' });
    }

    // OpenAI API 模型获取
    const response = await fetch(`${url}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${errorData.error.message}`);
    }

    const data = await response.json();
    const models = data.data.map(model => ({
      id: model.id,
      name: model.id
    }));

    return res.status(200).json({
      success: true,
      models: models
    });

  } catch (error) {
    console.error('Models API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
