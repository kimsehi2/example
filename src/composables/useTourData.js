// src/composables/useTourData.js
import { ref, onMounted, computed } from 'vue';

// static JSON 데이터 임포트
import accommodation from '../data/accommodation.json';
import festivals from '../data/festivals.json';
import sports from '../data/sports.json';
import travelCourse from '../data/travel_course.json';
import culture from '../data/culture.json';
import shopping from '../data/shopping.json';
import tourSpots from '../data/tour_spots.json';

// 카테고리 매핑 객체
const CATEGORY_DATA_MAP = {
  accommodation,
  festivals,
  sports,
  travel_course: travelCourse,
  culture,
  shopping,
  tour_spots: tourSpots
};

export function useTourData() {
  // --- 1. JSON 관광지 데이터 관련 상태 ---
  const currentCategory = ref('accommodation'); // 기본 카테고리
  const searchQuery = ref('');

  // 현재 선택된 카테고리의 전체 데이터 정보
  const categoryInfo = computed(() => CATEGORY_DATA_MAP[currentCategory.value] || {});
  
  // 현재 카테고리의 아이템 목록
  const tourItems = computed(() => categoryInfo.value.items || []);

  // 검색어가 있을 경우 필터링된 아이템 목록
  const filteredTourItems = computed(() => {
    if (!searchQuery.value.trim()) return tourItems.value;
    return tourItems.value.filter(item => 
      item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.addr1.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });

  const changeCategory = (categoryKey) => {
    if (CATEGORY_DATA_MAP[categoryKey]) {
      currentCategory.value = categoryKey;
      searchQuery.value = ''; // 카테고리 변경 시 검색어 초기화
    }
  };


  // --- 2. 로컬스토리지 게시글(CRUD) 관련 상태 (이전 코드 유지) ---
  const tours = ref([]);
  const STORAGE_KEY = 'my_board_tours';

  const loadTours = () => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        tours.value = JSON.parse(storedData);
      } catch (e) {
        console.error(e);
        tours.value = [];
      }
    } else {
      tours.value = [];
      saveTours();
    }
  };

  const saveTours = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tours.value));
  };

  const createTour = (tourPayload) => {
    const newTour = {
      id: Date.now(),
      title: tourPayload.title,
      content: tourPayload.content,
      category: tourPayload.category, // 'accommodation', 'festivals' 등 매핑 가능
      writer: tourPayload.writer,
      password: tourPayload.password,
      createdAt: new Date().toISOString()
    };
    tours.value.unshift(newTour);
    saveTours();
  };

  const updateTour = (id, updatedPayload) => {
    const index = tours.value.findIndex(t => t.id === id);
    if (index !== -1) {
      tours.value[index] = {
        ...tours.value[index],
        title: updatedPayload.title,
        content: updatedPayload.content,
        category: updatedPayload.category,
        writer: updatedPayload.writer
      };
      saveTours();
      return true;
    }
    return false;
  };

  const deleteTour = (id) => {
    tours.value = tours.value.filter(t => t.id !== id);
    saveTours();
  };

  const verifyPassword = (id, inputPassword) => {
    const tour = tours.value.find(t => t.id === id);
    return tour ? tour.password === inputPassword : false;
  };

  onMounted(() => {
    loadTours();
  });

  return {
    // 관광 데이터 관련
    currentCategory,
    searchQuery,
    categoryInfo,
    filteredTourItems,
    changeCategory,
    
    // CRUD 게시글 관련
    tours,
    createTour,
    updateTour,
    deleteTour,
    verifyPassword
  };
}