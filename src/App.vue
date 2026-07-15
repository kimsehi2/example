<!-- src/App.vue -->
<script setup>
import { ref, computed, onMounted, watch } from 'vue';
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

// ==========================================
// 1. 페이지네이션 (15개씩 데이터 처리)
// ==========================================
const currentPage = ref(1);
const itemsPerPage = 15;

watch([currentCategory, searchQuery], () => {
  currentPage.value = 1;
});

const totalPages = computed(() => {
  return Math.ceil(filteredTourItems.value.length / itemsPerPage) || 1;
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTourItems.value.slice(start, end);
});

const setPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// ==========================================
// 2. 접근성 편의 기능 (글자크기, 다크모드)
// ==========================================
const isLargeFont = ref(false);
const toggleFontSize = () => {
  isLargeFont.value = !isLargeFont.value;
};

const isDarkMode = ref(false);
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
};

// ==========================================
// 3. 날씨 데이터 패치
// ==========================================
const weatherTemp = ref('--');
const weatherAdvice = ref('');

const fetchWeather = async () => {
  try {
    const response = await fetch('https://wttr.in/Seoul?format=j1');
    if (!response.ok) throw new Error();
    const data = await response.json();
    const currentCondition = data.current_condition[0];
    const tempC = Math.round(parseFloat(currentCondition.temp_C));
    
    weatherTemp.value = `${tempC}°C`;
    
    if (tempC >= 30) {
      weatherAdvice.value = '🥵 덥습니다! 야외활동을 피하고 실내로 가세요.';
    } else if (tempC >= 20) {
      weatherAdvice.value = '☀️ 따뜻합니다. 가볍게 산책하기 좋은 날씨예요.';
    } else if (tempC >= 10) {
      weatherAdvice.value = '🍃 선선합니다. 얇은 외투를 꼭 챙기세요.';
    } else {
      weatherAdvice.value = '❄️ 춥습니다! 외출 시 따뜻하게 입으세요.';
    }
  } catch (e) {
    weatherTemp.value = '24°C';
    weatherAdvice.value = '☀️ 무리하지 마시고 실내에서 편히 쉬어가며 구경하세요.';
  }
};

onMounted(() => {
  fetchWeather();
});
</script>

<template>
  <div :class="['app-wrapper', { 'dark-mode': isDarkMode, 'large-font': isLargeFont }]">
    
    <!-- 1. 최상단 우측 미니 제어 바 (글씨크기 + 다크모드) -->
    <div class="top-mini-control-bar">
      <div class="accessibility-controls">
        <button @click="toggleFontSize" class="mini-utility-btn">
          {{ isLargeFont ? '🔤 글씨 보통' : '🔤 글씨 크게' }}
        </button>
        <button @click="toggleDarkMode" class="mini-utility-btn">
          {{ isDarkMode ? '☀️ 밝게' : '🌙 어둡게' }}
        </button>
      </div>
    </div>

    <div class="app-container">
      <!-- 2. 타이틀 영역 (가운데 정렬) -->
      <header class="app-centered-header">
        <h1 class="app-title">🗺️ 서울 여행 도우미</h1>
        <p class="subtitle">
          선택하신 카테고리에 <span class="highlight">{{ filteredTourItems.length }}</span>개의 가볼 만한 곳이 있습니다.
        </p>
      </header>

      <!-- 3 & 4. 카테고리(좌측 2줄) + 날씨(우측 배치) 동일 높이 그리드 영역 -->
      <section class="menu-weather-grid">
        <!-- 좌측: 지정 카테고리 메뉴 패널 (2줄 고정) -->
        <div class="category-panel-left">
          <CategoryMenu 
            :active-category="String(currentCategory.value || currentCategory)" 
            @select-category="changeCategory" 
          />
        </div>

        <!-- 우측: 날씨 위젯 패널 -->
        <div class="weather-panel-right">
          <div class="weather-widget">
            <div class="weather-top-row">
              <span class="weather-label">☀️ 서울 날씨</span>
              <span class="weather-temp-large">{{ weatherTemp }}</span>
            </div>
            <p class="weather-advice-small">{{ weatherAdvice }}</p>
          </div>
        </div>
      </section>

      <main class="app-main">
        <!-- 검색창 -->
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

        <!-- 장소 카드 리스트 -->
        <TourCardList :items="paginatedItems" />

        <!-- ❗ 복구 완료: 하단 전체 페이지네이션 컨트롤러 -->
        <div class="pagination-container" v-if="totalPages > 1">
          <button @click="setPage(1)" :disabled="currentPage === 1" class="page-nav-btn" title="첫 페이지로">≪</button>
          <button @click="setPage(currentPage - 1)" :disabled="currentPage === 1" class="page-nav-btn" title="이전 페이지">＜</button>
          
          <div class="page-numbers-scroll-wrapper">
            <div class="page-numbers-small">
              <button 
                v-for="page in totalPages" 
                :key="page" 
                @click="setPage(page)"
                :class="['page-num-btn-small', { 'active': currentPage === page }]"
              >
                {{ page }}
              </button>
            </div>
          </div>

          <button @click="setPage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-nav-btn" title="다음 페이지">＞</button>
          <button @click="setPage(totalPages)" :disabled="currentPage === totalPages" class="page-nav-btn" title="마지막 페이지로">≫</button>
        </div>
      </main>

      <ChatWidget />
    </div>
  </div>
</template>

<style>
/* ==========================================
   글로벌 테마 색상 및 변수 정의
   ========================================== */
:root {
  --color-sage-deep: #5F7355;
  --color-sage-soft: #AEC29C;
  --color-cream: #FAF6EE;
  --color-warm-clay: #C97B5A;
  --color-ink-brown: #2E2B24;
  --color-honey: #E0AE5C;
  
  --bg-app: var(--color-cream);
  --text-main: var(--color-ink-brown);
  --card-bg: #ffffff;
  --border-color: var(--color-sage-soft);
}

.dark-mode {
  --bg-app: #1e251c;
  --text-main: #FAF6EE;
  --card-bg: #2e362a;
  --border-color: #5F7355;
}

/* 어르신 글씨 크게 보기 활성화 */
.large-font button,
.large-font input,
.large-font span,
.large-font p,
.large-font div,
.large-font h1,
.large-font h2,
.large-font a {
  font-size: 112% !important;
  line-height: 1.5 !important;
}

/* 기본 레이아웃 */
.app-wrapper {
  min-height: 100vh;
  background-color: var(--bg-app);
  color: var(--text-main);
  transition: background-color 0.2s ease, color 0.2s ease;
  font-family: 'Malgun Gothic', '맑은 고딕', -apple-system, sans-serif;
  overflow-x: hidden;
}

.app-container {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0px 16px 80px 16px;
}

@media (min-width: 768px) {
  .app-container {
    padding: 0px 24px 80px 24px;
  }
}

/* ==========================================
   1. 최상단 우측 제어 바
   ========================================== */
.top-mini-control-bar {
  max-width: 1160px;
  margin: 0 auto;
  padding: 12px 16px 0 16px;
  display: flex;
  justify-content: flex-end;
}

@media (min-width: 768px) {
  .top-mini-control-bar {
    padding: 12px 24px 0 24px;
  }
}

.accessibility-controls {
  display: flex;
  gap: 8px;
}

.mini-utility-btn {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.mini-utility-btn:hover {
  background-color: var(--border-color);
  color: white;
}

/* ==========================================
   2. 타이틀 영역 (가운데 정렬)
   ========================================== */
.app-centered-header {
  text-align: center;
  margin: 10px 0 30px 0;
}

.app-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-main);
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .app-title {
    font-size: 34px;
  }
}

.subtitle {
  font-size: 15px;
  color: var(--color-sage-deep);
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
}

.dark-mode .subtitle {
  color: var(--color-sage-soft);
}

.highlight {
  color: var(--color-warm-clay);
  font-weight: bold;
}

/* ==========================================
   3 & 4. 카테고리(두 줄) + 날씨 동일 높이 매칭 레이아웃
   ========================================== */
.menu-weather-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 25px;
}

@media (min-width: 768px) {
  .menu-weather-grid {
    flex-direction: row;
    justify-content: space-between;
    align-items: stretch; /* ❗핵심: 카테고리와 날씨의 높이를 강제 통일 */
    gap: 24px;
  }
}

/* 좌측 카테고리 패널 */
.category-panel-left {
  flex: 1;
}

/* 우측 날씨 패널 */
.weather-panel-right {
  width: 100%;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .weather-panel-right {
    width: 280px; /* 데스크톱 고정 가로폭 */
    display: flex;
  }
}

/* 날씨 위젯 디자인 (높이에 맞춰 늘어남) */
.weather-widget {
  background-color: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center; /* ❗두 줄 높이 안에서 요소를 수직 중앙 정렬 */
}

.weather-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 6px;
  margin-bottom: 8px;
}

.weather-label {
  font-size: 13px;
  font-weight: bold;
  color: var(--color-sage-deep);
}

.dark-mode .weather-label {
  color: var(--color-sage-soft);
}

.weather-temp-large {
  font-size: 26px;
  font-weight: 900;
  color: var(--color-warm-clay);
  letter-spacing: -0.01em;
}

.weather-advice-small {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  font-weight: bold;
  color: var(--text-main);
  opacity: 0.9;
}

.app-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 검색 바 */
.search-bar {
  display: flex;
  align-items: center;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 2px 14px;
}

.search-icon {
  font-size: 16px;
  margin-right: 8px;
  color: var(--color-sage-deep);
}

.search-input {
  flex: 1;
  border: none;
  padding: 10px 0;
  font-size: 14px;
  font-weight: bold;
  color: var(--text-main);
  outline: none;
  background: transparent;
}

@media (min-width: 768px) {
  .search-input {
    padding: 12px 0;
    font-size: 15px;
  }
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  padding: 6px;
  color: var(--text-main);
}

/* 페이지네이션 하단 바 (복구) */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 32px;
  width: 100%;
}

.page-nav-btn {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .page-nav-btn {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
}

.page-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-numbers-scroll-wrapper {
  max-width: 180px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.page-numbers-scroll-wrapper::-webkit-scrollbar {
  display: none;
}

@media (min-width: 480px) {
  .page-numbers-scroll-wrapper {
    max-width: 280px;
  }
}

@media (min-width: 768px) {
  .page-numbers-scroll-wrapper {
    max-width: none;
    overflow: visible;
  }
}

.page-numbers-small {
  display: flex;
  gap: 4px;
}

.page-num-btn-small {
  background: transparent;
  border: none;
  color: var(--text-main);
  width: 28px;
  height: 28px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .page-num-btn-small {
    width: 32px;
    height: 32px;
  }
}

.page-num-btn-small:hover {
  background-color: var(--border-color);
  color: white;
}

.page-num-btn-small.active {
  background-color: var(--color-sage-deep);
  color: white;
  font-weight: bold;
}
</style>