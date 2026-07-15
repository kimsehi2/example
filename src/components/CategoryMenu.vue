<!-- src/components/CategoryMenu.vue -->
<script setup>
const props = defineProps({
  activeCategory: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['select-category']);

const categories = [
  { key: 'accommodation', label: '🏨 숙박' },
  { key: 'festivals', label: '🎉 축제/행사' },
  { key: 'sports', label: '⚽ 레포츠' },
  { key: 'travel_course', label: '🗺️ 여행코스' },
  { key: 'culture', label: '🎨 문화시설' },
  { key: 'shopping', label: '🛍️ 쇼핑' },
  { key: 'tour_spots', label: '⛰️ 관광지' }
];

const select = (key) => {
  emit('select-category', key);
};
</script>

<template>
  <div class="category-menu-container">
    <div class="category-tabs">
      <button 
        v-for="cat in categories" 
        :key="cat.key"
        :class="['tab-btn', { active: activeCategory === cat.key }]"
        @click="select(cat.key)"
      >
        {{ cat.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.category-menu-container {
  margin-bottom: 24px;
  overflow-x: auto;
}

.category-tabs {
  display: flex;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.tab-btn {
  white-space: nowrap;
  padding: 10px 18px;
  border: none;
  background: #f3f4f6;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: #e5e7eb;
}

.tab-btn.active {
  background: #4f46e5;
  color: white;
  font-weight: bold;
}
</style>