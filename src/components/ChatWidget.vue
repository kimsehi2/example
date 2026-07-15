<!-- src/components/ChatWidget.vue -->
<template>
  <div class="chat-widget-container">
    <!-- 1. 우측 하단 둥글고 큰 챗봇 열기 버튼 (어르신들이 알아보기 쉽게 글씨도 포함) -->
    <button 
      v-if="!isOpen" 
      @click="toggleChat" 
      class="chat-trigger-btn"
      aria-label="챗봇 열기"
    >
      <span class="chat-icon">💬</span>
      <span class="trigger-text">쉬운 가이드</span>
    </button>

    <!-- 2. 챗봇 대화창 -->
    <div v-else class="chat-window">
      <!-- 헤더: 큼직하고 직관적인 버튼 배치 -->
      <div class="chat-header">
        <div class="header-title">
          <span class="header-icon">🤖</span>
          <span>서울 여행 도우미</span>
        </div>
        <div class="header-actions">
          <button @click="clearChat" class="reset-btn" title="처음부터 다시 얘기하기">
            🔄 처음으로
          </button>
          <button @click="toggleChat" class="close-btn" title="창 닫기">
            ❌ 닫기
          </button>
        </div>
      </div>

      <!-- 대화 목록 (스크롤 가능 영역) -->
      <div ref="messageContainer" class="chat-body">
        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          :class="['message-row', msg.role === 'user' ? 'user' : 'assistant']"
        >
          <!-- 시스템 지침(system)은 화면에 그리지 않고 user와 assistant 대화만 표시 -->
          <template v-if="msg.role !== 'system'">
            <div class="message-bubble">
              <span class="sender-label">
                {{ msg.role === 'user' ? '나의 질문' : '도우미 답변' }}
              </span>
              <div class="message-text">
                {{ msg.content }}
              </div>
            </div>
          </template>
        </div>

        <!-- 로딩 상태 표시 -->
        <div v-if="isLoading" class="message-row assistant">
          <div class="message-bubble">
            <span class="sender-label">도우미 답변</span>
            <div class="message-text loading">
              <span class="dots">답변을 준비하고 있습니다... 잠시만 기다려주세요.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 푸터: 큰 글씨 입력창 및 큼직한 전송 버튼 -->
      <div class="chat-footer">
        <input 
          v-model="userInput" 
          @keyup.enter="handleSend"
          type="text" 
          placeholder="여기에 궁금한 점을 적어주세요..." 
          :disabled="isLoading"
        />
        <button @click="handleSend" :disabled="isLoading" class="send-btn">
          물어보기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import { useChat } from '../composables/useChat';

const { messages, isLoading, sendMessage, clearChat } = useChat();

const isOpen = ref(false);
const userInput = ref('');
const messageContainer = ref(null);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    scrollToBottom();
  }
};

const handleSend = async () => {
  if (!userInput.value.trim() || isLoading.value) return;
  const textToSend = userInput.value;
  userInput.value = ''; // 입력창 비우기
  
  await sendMessage(textToSend);
  scrollToBottom();
};

const scrollToBottom = async () => {
  await nextTick();
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

// 메시지 목록이 바뀌거나 로딩 상태가 바뀔 때 화면을 자동으로 가장 아래로 내림
watch([messages, isLoading], () => {
  scrollToBottom();
}, { deep: true });
</script>

<style scoped>
/* 외부 폰트나 부모 스타일 영향 차단 */
.chat-widget-container {
  font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
  box-sizing: border-box;
}

/* 1. 우측 하단 고정 트리거 버튼 - 어르신들이 누르기 쉽게 크고 직관적으로 디자인 */
.chat-trigger-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: #312e81; /* 눈에 확 띄는 짙은 남색 */
  color: white;
  border: none;
  border-radius: 50px;
  padding: 16px 28px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.2s ease, background-color 0.2s ease;
  z-index: 9999;
}

.chat-trigger-btn:hover {
  transform: scale(1.05);
  background-color: #1e1b4b;
}

.chat-icon {
  font-size: 24px;
}

.trigger-text {
  letter-spacing: -0.5px;
}

/* 2. 챗봇 전체 창 - 어르신 시야에 잘 들어오도록 400px 크기로 큼직하게 구성 */
.chat-window {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 410px;
  height: 600px;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 3px solid #312e81; /* 외곽 테두리를 굵게 주어 배경과 확실하게 분리 */
  z-index: 9999;
}

/* 헤더 - 굵고 선명한 남색 배경 */
.chat-header {
  background-color: #312e81;
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #1e1b4b;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 19px;
  font-weight: bold;
}

.header-icon {
  font-size: 22px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.reset-btn, .close-btn {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 6px 12px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
}

.reset-btn:hover, .close-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* 대화창 내부 바디 */
.chat-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f8fafc; /* 부드럽고 피로감이 적은 밝은 회색 바탕 */
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 스크롤바 보기 편하게 조금 두껍게 변경 */
.chat-body::-webkit-scrollbar {
  width: 8px;
}
.chat-body::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

/* 말풍선 레이아웃 */
.message-row {
  display: flex;
  width: 100%;
}

.message-row.user {
  justify-content: flex-end; /* 내 질문은 우측 정렬 */
}

.message-row.assistant {
  justify-content: flex-start; /* AI 답변은 좌측 정렬 */
}

.message-bubble {
  max-width: 85%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 누구의 말인지 알려주는 라벨 */
.sender-label {
  font-size: 13px;
  color: #64748b;
  font-weight: bold;
  padding-left: 4px;
}
.user .sender-label {
  text-align: right;
  padding-right: 4px;
}

/* 실제 텍스트 말풍선 - 16px 크기의 굵은 글씨와 줄간격 확보 */
.message-text {
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.6;
  white-space: pre-line; /* 서버에서 보낸 줄바꿈 정직하게 줄바꿈 처리 */
  word-break: break-all;
}

/* 내 말풍선: 진한 남색 배경에 흰색 글자 (강한 대비) */
.user .message-text {
  background-color: #312e81;
  color: #ffffff;
  border-bottom-right-radius: 2px;
}

/* 도우미 말풍선: 밝은 미색 바탕에 아주 어두운 차콜색 글자 */
.assistant .message-text {
  background-color: #ffffff;
  color: #0f172a;
  border: 2px solid #e2e8f0;
  border-bottom-left-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

/* 로딩 애니메이션 */
.loading {
  color: #64748b;
  font-style: italic;
  font-size: 15px;
}

/* 하단 입력 폼 영역 */
.chat-footer {
  padding: 16px;
  background-color: #ffffff;
  border-top: 2px solid #e2e8f0;
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 입력창: 눈이 침침하신 어르신들을 위해 폰트 16px 지정 */
.chat-footer input {
  flex: 1;
  border: 2px solid #cbd5e1;
  border-radius: 10px;
  padding: 14px;
  font-size: 16px;
  font-weight: bold;
  color: #0f172a;
  outline: none;
  transition: border-color 0.2s ease;
}

.chat-footer input:focus {
  border-color: #312e81;
}

/* 물어보기 버튼: 큼직하고 두툼하게 설계 */
.send-btn {
  background-color: #312e81;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;
}

.send-btn:hover {
  background-color: #1e1b4b;
}

.send-btn:disabled, .chat-footer input:disabled {
  background-color: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
}
</style>