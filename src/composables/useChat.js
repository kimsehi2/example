// src/composables/useChat.js
import { ref } from 'vue';
import { fetchChatResponse } from '../api/openai';

// 로컬 JSON 데이터 임포트
import accommodation from '../data/accommodation.json';
import festivals from '../data/festivals.json';
import sports from '../data/sports.json';
import travelCourse from '../data/travel_course.json';
import culture from '../data/culture.json';
import shopping from '../data/shopping.json';
import tourSpots from '../data/tour_spots.json';

const allDataSources = [
  ...accommodation.items,
  ...festivals.items,
  ...sports.items,
  ...travelCourse.items,
  ...culture.items,
  ...shopping.items,
  ...tourSpots.items
];

// 노년층 맞춤 가이드 지침
const SYSTEM_INSTRUCTION = `
당신은 노년층들을 위한 따뜻하고 친절한 '서울 여행 가이드'입니다.
노년층들은 복잡한 검색이나 멀리 이동하는 것을 어려워하시며, 자극적이지 않고 편안한 한식 위주의 맛집이나 걷기 좋은 안락한 숙소, 산책로를 선호하십니다.

[핵심 답변 지침]
1. 말투: "안녕하세요!"처럼 정중하고 따뜻한 존댓말을 사용하며, 글자 크기가 크게 보일 것을 감안하여 문장을 길게 늘어뜨리지 않고 줄바꿈을 자주 해 주세요.
2. 이동 동선 최소화: 질문한 장소(또는 숙소)와 최대한 가까운 도보 이동 가능한 거리 위주로 추천해 주세요. ("숙소에서 멀리 가지 않고 편히 다녀오실 수 있는 곳입니다.")
3. 어른 입맛 맞춤 추천: 자극적인 퓨전 음식보다는 든든한 한식, 국물 요리, 자극적이지 않은 담백한 맛집 위주로 데이터를 매칭해 설명해 주세요.
4. 명확한 가이드: 길 찾기 복잡한 설명 대신, "어디 구 어디 동에 있습니다", "전화번호는 여기이니 미리 전화를 해보고 가시면 좋습니다" 형태로 명확하게 짚어주세요.
5. 제공된 [참고 데이터]를 기반으로만 실존하는 정확한 정보를 안내해 주세요.
`;

export function useChat() {
  const messages = ref([
    {
      role: 'system',
      content: SYSTEM_INSTRUCTION
    },
    {
      role: 'assistant',
      content: '반갑습니다! 서울에서의 좋은 추억을 만들 수 있도록 편안한 숙소와 맛있는 한식 맛집들을 콕 짚어 드릴게요. 궁금하신 동네나 찾으시는 음식을 말씀해 주세요.😊'
    }
  ]);
  
  const isLoading = ref(false);

  // 어르신 맞춤형 로컬 데이터 필터링 기능
  const searchLocalData = (query) => {
    if (!query.trim()) return [];
    
    const keywords = query.split(/\s+/).filter(k => k.length > 0);

    // 1차 필터링: 입력 키워드가 제목이나 주소에 포함되는지 확인
    let matched = allDataSources.filter(item => {
      const title = item.title || '';
      const addr = item.addr1 || '';
      return keywords.some(keyword => 
        title.toLowerCase().includes(keyword.toLowerCase()) || 
        addr.toLowerCase().includes(keyword.toLowerCase())
      );
    });

    // 2차 필터링 (어른들 취향 필터): 숙소나 맛집 중 "전통", "한식", "안락", "가든", "온돌", "산책" 등 어르신 선호 키워드가 들어간 것을 우선 배치
    matched.sort((a, b) => {
      const preferKeywords = ['한식', '전통', '궁', '공원', '온돌', '한옥', '백숙', '탕', '국밥', '정식'];
      const aScore = preferKeywords.reduce((acc, cur) => acc + (a.title.includes(cur) || a.addr1.includes(cur) ? 1 : 0), 0);
      const bScore = preferKeywords.reduce((acc, cur) => acc + (b.title.includes(cur) || b.addr1.includes(cur) ? 1 : 0), 0);
      return bScore - aScore; // 선호 점수가 높은 순으로 정렬
    });

    return matched.slice(0, 4); // 너무 길지 않게 딱 알맞은 4개만 추천
  };

  const sendMessage = async (userContent) => {
    if (!userContent.trim() || isLoading.value) return;

    messages.value.push({
      role: 'user',
      content: userContent
    });

    isLoading.value = true;

    try {
      const matchedItems = searchLocalData(userContent);
      const apiMessages = [...messages.value];
      
      if (matchedItems.length > 0) {
        const contextString = matchedItems.map((item, idx) => {
          return `[장소 ${idx + 1}]\n- 이름: ${item.title}\n- 주소: ${item.addr1}\n- 전화번호: ${item.tel || '전화번호 등록 안 됨 (현장 확인 필요)'}\n- 특징: 많이 걷지 않는 가까운 거리 추천 장소`;
        }).join('\n\n');

        apiMessages.push({
          role: 'system',
          content: `사용자 질문과 매칭된 실제 데이터 정보입니다. 사용자들이 다치거나 헤매지 않도록 주소와 전화번호를 크고 보기 쉽게 정리해서 알려주세요:\n\n${contextString}`
        });
      }

      const assistantResponse = await fetchChatResponse(apiMessages);
      
      messages.value.push({
        role: 'assistant',
        content: assistantResponse
      });
    } catch (error) {
      messages.value.push({
        role: 'assistant',
        content: `대답을 준비하는 도중에 작은 문제가 생겼습니다. 다시 한 번 말씀해 주시겠습니까?`
      });
    } finally {
      isLoading.value = false;
    }
  };

  const clearChat = () => {
    messages.value = [
      {
        role: 'system',
        content: SYSTEM_INSTRUCTION
      },
      {
        role: 'assistant',
        content: '반갑습니다! 무릎 아프지 않게 많이 걷지 않는 편안한 숙소와 구수하고 맛있는 한식 맛집들을 콕 짚어 드릴게요. 궁금하신 동네나 찾으시는 음식을 말씀해 주세요.'
      }
    ];
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat
  };
}