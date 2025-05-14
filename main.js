const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// 🟢 시스템 프롬프트 설정 (이 부분을 자유롭게 수정하여 보시면 됩니다)
const systemPrompt = `
너는 중년 여성의 다이어트를 위한 식이를 알려주는 영양사야.
요리법이 간단한 메뉴를 우선적으로 추천하고 그 메뉴의 요리법도 개조식으로 알려주어야 해. 
더불어 식사 후 할 수 있는 혈당스파이크를 막을 수 있는 간단한 맨손 체조도 알려줘.
`;

// 🟡 대화 맥락을 저장하는 배열 (시스템 프롬프트 포함)
const conversationHistory = [
  { role: "system", content: systemPrompt }
];

async function fetchGPTResponse() {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4-turbo", //이 부분에서 모델을 바꿔볼 수 있습니다.
      messages: conversationHistory,
      temperature: 0.7, //이 부분은 모델의 창의성을 조절하는 부분입니다. 0정답중심, 1자유로운 창의적인 응답
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function handleSend() {
  const prompt = userInput.value.trim();
  if (!prompt) return;

  // 사용자 입력 UI에 출력
  chatbox.innerHTML += `<div class="text-right mb-2 text-blue-600">나: ${prompt}</div>`;
  chatbox.scrollTop = chatbox.scrollHeight;

  // 사용자 메시지를 대화 이력에 추가
  conversationHistory.push({ role: "user", content: prompt });

  // 입력 필드 초기화
  userInput.value = '';

  // GPT 응답 받아오기
  const reply = await fetchGPTResponse();

  // GPT 응답 UI에 출력
  chatbox.innerHTML += `<div class="text-left mb-2 text-gray-800">GPT: ${reply}</div>`;
  chatbox.scrollTop = chatbox.scrollHeight;

  // GPT 응답도 대화 이력에 추가
  conversationHistory.push({ role: "assistant", content: reply });
}

// 버튼 클릭 시 작동
sendBtn.addEventListener('click', handleSend);

// 엔터키 입력 시 작동
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});
