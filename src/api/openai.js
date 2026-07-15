// src/api/openai.js
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

export const fetchChatResponse = async (messages) => {
  if (!API_KEY) {
    throw new Error('API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-5-mini', // 빠르고 비용 효율적인 모델 사용
        messages: messages,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API 호출 중 오류가 발생했습니다.');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};