<!-- src/components/CategoryMenu.vue -->
<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  activeCategory: {
    type: String, // useTourData.js의 영어 Key ('accommodation' 등)를 받습니다.
    required: true
  }
});

const emit = defineEmits(['select-category']);

// ❗ useTourData.js의 CATEGORY_DATA_MAP Key와 정확하게 일치시켰습니다.
const firstLineCategories = [
  { id: 'accommodation', label: '🏨 숙박' },
  { id: 'festivals', label: '🎉 축제/행사' },
  { id: 'sports', label: '🏂 레포츠' },
  { id: 'travel_course', label: '🗺️ 여행코스' }
];

const secondLineCategories = [
  { id: 'culture', label: '🏛️ 문화시설' },
  { id: 'shopping', label: '🛍️ 쇼핑' },
  { id: 'tour_spots', label: '🏞️ 관광지' }
];

const handleSelect = (categoryKey) => {
  // 이제 'festivals', 'culture' 같은 영어 Key를 부모에게 전달합니다.
  emit('select-category', categoryKey);
};
</script>

<template>
  <div class="fixed-two-line-menu">
    <!-- 첫 번째 줄 -->
    <div class="menu-row">
      <button 
        v-for="cat in firstLineCategories" 
        :key="cat.id"
        :class="['menu-item-btn', { 'active': activeCategory === cat.id }]"
        @click="handleSelect(cat.id)"
      >
        {{ cat.label }}
      </button>
    </div>
    
    <!-- 두 번째 줄 -->
    <div class="menu-row">
      <button 
        v-for="cat in secondLineCategories" 
        :key="cat.id"
        :class="['menu-item-btn', { 'active': activeCategory === cat.id }]"
        @click="handleSelect(cat.id)"
      >
        {{ cat.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.fixed-two-line-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.menu-row {
  display: flex;
  gap: 8px;
  width: 100%;
}

.menu-item-btn {
  flex: 1;
  background-color: var(--card-bg);
  border: 2px solid var(--border-color);
  color: var(--text-main);
  padding: 10px 6px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
  transition: all 0.15s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

@media (min-width: 768px) {
  .menu-item-btn {
    font-size: 14px;
    padding: 12px 10px;
  }
}

.menu-item-btn:hover {
  background-color: var(--color-sage-soft);
  color: white;
  transform: translateY(-1px);
}

.menu-item-btn.active {
  background-color: var(--color-sage-deep);
  border-color: var(--color-sage-deep);
  color: white;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}
</style>