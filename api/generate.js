export default async function handler(req, res) {
  // 웹사이트 통신 허용 설정 (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { title, name, position, content, date, organization, giver, usage, tone } = req.body;

    const prompt = `
너는 대한민국 최고의 상패/감사패 문구 작성 전문가이다.
아래 전달받은 정보를 바탕으로 격식 있고 감동적인 상패 문구를 작성해라.

[입력 정보]
- 상패 제목: ${title || '감사패'}
- 수상자 이름: ${name}
- 직위: ${position || ''}
- 핵심 내용/업적: ${content}
- 시상 날짜: ${date}
- 수여 기관: ${organization || ''}
- 주는 사람: ${giver || ''}
- 용도: ${usage || '회사'}
- 어조: ${tone || '격식체'}

[작성 조건]
1. 상패에 바로 각인할 수 있는 형태(제목 -> 받는사람 -> 본문 -> 날짜 -> 주는사람)로 완성해라.
2. 본문은 3~4문장 정도로, 핵심 내용을 자연스럽고 감동적인 문장으로 확장해라.
3. 부연 설명이나 인삿말("네, 작성해 드리겠습니다" 등)은 절대 출력하지 말고 오직 상패 본문 텍스트만 출력해라.
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return res.status(200).json({ text: resultText.trim() });
  } catch (error) {
    return res.status(500).json({ error: 'API 연동 실패' });
  }
}
