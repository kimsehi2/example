<!-- src/App.vue -->
<script setup>
import { useTourData } from './composables/useTourData';
import CategoryMenu from './components/CategoryMenu.vue';
import TourCardList from './components/TourCardList.vue';
import ChatWidget from './components/ChatWidget.vue';

const { 
  currentCategory, 
  searchQuery, 
  categoryInfo, 
  filteredTourItems, 
  changeCategory 
} = useTourData();
</script>

<template>
  <div class="app-container">
    <!-- 상단 타이틀 영역 -->
    <header class="app-header">
      <h1 class="app-title">🗺️ 서울 여행 도우미 & 커뮤니티</h1>
      <p class="subtitle">
        현재 카테고리에서 <span class="highlight">{{ filteredTourItems.length }}</span>개의 장소가 준비되어 있습니다.
      </p>
    </header>

    <main class="app-main">
      <!-- 1. 카테고리 선택 탭 메뉴 -->
      <CategoryMenu 
        :active-category="currentCategory" 
        @select-category="changeCategory" 
      />

      <!-- 2. 장소 검색창 -->
      <div class="search-box-wrapper">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="찾으시는 장소 이름이나 주소를 입력하세요..." 
            class="search-input"
          />
          <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">❌</button>
        </div>
      </div>

      <!-- 3. 장소 카드 목록 (클릭하면 상세 보기 및 댓글 입력창이 열립니다) -->
      <TourCardList :items="filteredTourItems" />
    </main>

    <!-- 4. 우측 하단 고정 어르신 맞춤형 AI 챗봇 위젯 -->
    <ChatWidget />
  </div>
</template>

<style>
/* 전역 스타일 설정 (어르신 눈높이에 맞춰 기본 서체와 크기를 차분하게 조정) */
body {
  margin: 0;
  padding: 0;
  background-color: #f8fafc;
  color: #1e293b;
  font-family: 'Malgun Gothic', '맑은 고딕', -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.app-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 24px;
}

/* 헤더 스타일 */
.app-header {
  text-align: center;
  margin-bottom: 40px;
}

.app-title {
  font-size: 34px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 12px 0;
  letter-spacing: -0.03em;
}

.subtitle {
  font-size: 18px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.highlight {
  color: #312e81; /* 챗봇과 통일감을 주는 진한 남색 */
  font-weight: bold;
  font-size: 20px;
}

/* 메인 구조 레이아웃 */
.app-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 검색 바 스타일 */
.search-box-wrapper {
  width: 100%;
}

.search-bar {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #cbd5e1;
  border-radius: 14px;
  padding: 4px 18px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-bar:focus-within {
  border-color: #312e81;
  box-shadow: 0 0 0 4px rgba(49, 46, 129, 0.1);
}

.search-icon {
  font-size: 20px;
  margin-right: 12px;
  color: #94a3b8;
}

.search-input {
  flex: 1;
  border: none;
  padding: 14px 0;
  font-size: 16px;
  font-weight: bold;
  color: #0f172a;
  outline: none;
  background: transparent;
}

.search-input::placeholder {
  color: #94a3b8;
  font-weight: normal;
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 8px;
  color: #94a3b8;
}

.clear-btn:hover {
  color: #64748b;
}

/* 반응형 모바일 대응 */
@media (max-width: 640px) {
  .app-container {
    padding: 24px 16px;
  }
  
  .app-title {
    font-size: 26px;
  }

  .subtitle {
    font-size: 16px;
  }
}
</style>