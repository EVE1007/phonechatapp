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
    const { proxyUrl, apiKey, model, messages, systemPrompt } = req.body;

    if (!proxyUrl || !apiKey || !model || !messages) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // OpenAI API调用函数
    async function callChatAPI(url, key, model, messages, systemPrompt) {
      const apiUrl = `${url}/v1/chat/completions`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          temperature: 0.75,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.error.message}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    }

    const aiResponseContent = await callChatAPI(proxyUrl, apiKey, model, messages, systemPrompt);
    
    res.status(200).json({ 
      success: true, 
      content: aiResponseContent 
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
} 
