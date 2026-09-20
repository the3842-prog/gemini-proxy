export default async function handler(req, res) {
  // 1. 누구나 외부에서 접속할 수 있도록 CORS 전면 허용 (*)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 브라우저의 Preflight(사전 요청) 대응
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 프론트엔드에서 전달받는 파라미터
    const { title, name, position, content, keywords, date, organization, org, giver, usage, tone } = req.body;

    // 전달받은 값 정리 (변수명 호환 처리)
    const finalTitle = title || '감사패';
    const finalName = name || '수상자';
    const finalKeywords = content || keywords || '남다른 열정과 헌신으로 큰 기여를 하셨습니다.';
    const finalDate = date || '2026년 9월 20일';
    const finalOrg = organization || org || giver || '임직원 일동';
    const finalTone = tone || '정통 격식체';

    const prompt = `
너는 대한민국 최고의 상패/감사패 문구 작성 전문가이다.
아래 전달받은 정보를 바탕으로 격식 있고 감동적인 상패 문구를 작성해라.

[입력 정보]
- 상패 제목: ${finalTitle}
- 수상자 이름/직위: ${finalName} ${position || ''}
- 핵심 내용/키워드: ${finalKeywords}
- 수여 날짜: ${finalDate}
- 주시는 분/단체: ${finalOrg}
- 문구 어조: ${finalTone}

[작성 조건]
1. 상패 본문에 들어갈 3~4문장의 고품격 감사 문구만 작성해라.
2. 입력된 핵심 내용을 자연스럽고 진심 어린 표현으로 확장해서 작성해라.
3. 인사말("네, 작성해 드리겠습니다" 등)이나 부연 설명, 제목/날짜/주는 사람 레이블 등은 절대 포함하지 말고 **오직 본문 문장 텍스트만** 출력해라.
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' });
    }

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
    console.error('API Error:', error);
    return res.status(500).json({ error: 'API 연동 중 오류가 발생했습니다.' });
  }
}
