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
.chat-widget-container {
  font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
  box-sizing: border-box;
}

/* 우측 하단 고정 트리거 버튼 - Warm Clay로 변경하여 시인성 확보 */
.chat-trigger-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: var(--color-warm-clay, #C97B5A);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 16px 28px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(95, 115, 85, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
  transition: transform 0.2s ease, background-color 0.2s ease;
  z-index: 9999;
}

.chat-trigger-btn:hover {
  transform: scale(1.05);
  background-color: #b26545; /* 웜 클레이 약간 어둡게 */
}

.chat-icon {
  font-size: 24px;
}

/* 챗봇 창 - 테두리를 Sage Deep으로 변경 */
.chat-window {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 410px;
  height: 600px;
  background-color: var(--color-cream, #FAF6EE); /* 배경은 크림색 */
  border-radius: 20px;
  box-shadow: 0 12px 36px rgba(46, 43, 36, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 3px solid var(--color-sage-deep, #5F7355);
  z-index: 9999;
}

/* 헤더 - Sage Deep 적용 */
.chat-header {
  background-color: var(--color-sage-deep, #5F7355);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #4a5c41;
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
  background-color: var(--color-cream, #FAF6EE); /* 편안한 크림 바탕 */
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chat-body::-webkit-scrollbar {
  width: 8px;
}
.chat-body::-webkit-scrollbar-thumb {
  background-color: var(--color-sage-soft, #AEC29C);
  border-radius: 4px;
}

.message-row {
  display: flex;
  width: 100%;
}

.message-row.user {
  justify-content: flex-end;
}

.message-row.assistant {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 85%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sender-label {
  font-size: 13px;
  color: var(--color-ink-brown, #2E2B24);
  opacity: 0.8;
  font-weight: bold;
  padding-left: 4px;
}
.user .sender-label {
  text-align: right;
  padding-right: 4px;
}

.message-text {
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.6;
  white-space: pre-line;
  word-break: break-all;
}

/* 내 말풍선: Warm Clay 배경에 흰색 글자 */
.user .message-text {
  background-color: var(--color-warm-clay, #C97B5A);
  color: #ffffff;
  border-bottom-right-radius: 2px;
}

/* 도우미 말풍선: 연한 세이지(Sage Soft) 배경에 본문 다크 브라운 글씨 */
.assistant .message-text {
  background-color: #ffffff;
  color: var(--color-ink-brown, #2E2B24);
  border: 2px solid var(--color-sage-soft, #AEC29C);
  border-bottom-left-radius: 2px;
  box-shadow: 0 2px 4px rgba(46, 43, 36, 0.05);
}

.loading {
  color: var(--color-ink-brown, #2E2B24);
  opacity: 0.7;
  font-style: italic;
  font-size: 15px;
}

/* 하단 입력 폼 영역 */
.chat-footer {
  padding: 16px;
  background-color: var(--color-cream, #FAF6EE);
  border-top: 2px solid var(--color-sage-soft, #AEC29C);
  display: flex;
  gap: 10px;
  align-items: center;
}

.chat-footer input {
  flex: 1;
  border: 2px solid var(--color-sage-soft, #AEC29C);
  background-color: #ffffff;
  border-radius: 10px;
  padding: 14px;
  font-size: 16px;
  font-weight: bold;
  color: var(--color-ink-brown, #2E2B24);
  outline: none;
  transition: border-color 0.2s ease;
}

.chat-footer input:focus {
  border-color: var(--color-sage-deep, #5F7355);
}

/* 물어보기 버튼: Sage Deep 적용 */
.send-btn {
  background-color: var(--color-sage-deep, #5F7355);
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
  background-color: #4a5c41;
}

.send-btn:disabled, .chat-footer input:disabled {
  background-color: var(--color-sage-soft, #AEC29C);
  color: #ffffff;
  opacity: 0.6;
  cursor: not-allowed;
}
</style>