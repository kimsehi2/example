<!-- src/components/TourCardList.vue -->
<script setup>
import { ref } from 'vue';
import CommentModal from './CommentModal.vue';

defineProps({
  items: {
    type: Array,
    required: true
  }
});

// 상세 보기 모달 제어 상태
const isDetailOpen = ref(false);
const selectedItem = ref(null);

// 카드 클릭 시 상세 모달 열기
const openDetail = (item) => {
  selectedItem.value = item;
  isDetailOpen.value = true;
};

// 모달 닫기
const closeDetail = () => {
  selectedItem.value = null;
  isDetailOpen.value = false;
};
</script>

<template>
  <div class="tour-list-wrapper">
    <div v-if="items.length === 0" class="no-data">
      조회된 관광 정보가 없습니다.
    </div>

    <!-- 1. 관광지 목록 그리드 -->
    <div v-else class="tour-grid">
      <div 
        v-for="item in items" 
        :key="item.contentid" 
        class="tour-card"
        @click="openDetail(item)"
      >
        <div class="image-box">
            <img 
                :src="item.firstimage || item.firstimage2 || '/no-image.svg'" 
                :alt="item.title"
                loading="lazy"
            />
        </div>
        
        <div class="card-content">
          <h4 class="tour-title" :title="item.title">{{ item.title }}</h4>
          <p class="tour-addr">{{ item.addr1 || '주소 정보 없음' }}</p>
          <div class="card-footer">
            <span v-if="item.tel" class="tour-tel">📞 {{ item.tel }}</span>
            <span v-else class="tour-tel-placeholder">전화번호 없음</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 관광지 상세 정보 + 댓글 통합 모달 -->
    <div v-if="isDetailOpen && selectedItem" class="detail-modal-overlay" @click.self="closeDetail">
      <div class="detail-modal-content">
        <!-- 상단 헤더 -->
        <div class="modal-header">
          <h2>{{ selectedItem.title }}</h2>
          <button class="close-btn" @click="closeDetail">❌</button>
        </div>

        <!-- 스크롤 가능한 본문 영역 -->
        <div class="modal-body">
            <img 
              :src="selectedItem.firstimage || '/no-image.svg'" 
              :alt="selectedItem.title" 
            />
          

          <div class="detail-info">
            <p class="info-row"><strong>📍 주소:</strong> {{ selectedItem.addr1 }} {{ selectedItem.addr2 }}</p>
            <p v-if="selectedItem.tel" class="info-row"><strong>📞 문의처:</strong> {{ selectedItem.tel }}</p>
            <p v-if="selectedItem.zipcode" class="info-row"><strong>📮 우편번호:</strong> {{ selectedItem.zipcode }}</p>
          </div>

          <!-- 구분선 -->
          <hr class="divider" />

          <!-- 이 상세창 내부로 댓글 컴포넌트 삽입 (동기화 완료) -->
          <CommentModal 
            :board-id="selectedItem.contentid" 
            :is-open="true" 
            @close="closeDetail"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tour-list-wrapper {
  margin-top: 16px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 15px;
}

/* 목록 그리드 스타일 */
.tour-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.tour-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.tour-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.image-box {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background-color: #f3f4f6;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 110px;
}

.tour-title {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: bold;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tour-addr {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  height: 34px;
  overflow: hidden;
}

/* 상세 모달 스타일 */
.detail-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 20px;
}

.detail-modal-content {
  background: white;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.detail-image {
  width: 100%;
  max-height: 300px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-info {
  margin-bottom: 20px;
}

.info-row {
  margin: 8px 0;
  font-size: 14px;
  color: #4b5563;
}

.divider {
  border: 0;
  height: 1px;
  background: #e5e7eb;
  margin: 20px 0;
}
</style>