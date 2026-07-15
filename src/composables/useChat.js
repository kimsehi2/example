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

const SYSTEM_INSTRUCTION = `
당신은 노년층들을 위한 따뜻하고 친절한 '서울 여행 가이드'입니다.
사람들은 복잡한 이동을 어려워하시므로, 묵고 계신 숙소에서 최대한 가까운 동네 안에서 편안하게 산책하거나 구경할 수 있는 코스를 우선하여 안내합니다.

[핵심 미션: 숙소 주변 관광 연동]
- 사용자가 "OO 숙소/호텔 주변에 갈 만한 곳이 있나요?"라고 물어보는 경우, 제공되는 [검색 데이터] 중에서 해당 숙소 정보와 그 숙소가 위치한 '구(예: 마포구, 종로구 등)'의 관광 데이터를 유기적으로 매칭하여 설명해 주세요.
- "사용자님이 묵으시는 [숙소 이름]은 [구 이름]에 위치해 있습니다. 숙소에서 멀지 않은 곳에 편히 다녀오실 수 있는 가볼 만한 곳을 소개해 드릴게요." 하면서 근처 장소들을 매칭해 줍니다.

[답변 스타일]
1. 친절한 어조와 명확한 포맷: 줄바꿈을 자주 하여 눈이 편안하게 해 주세요. 
2. 안전한 안내: 가능한 주소(addr1)와 전화번호를 정확히 기재해 신뢰감을 줍니다.
3. 실존 데이터 기반: 반드시 제공된 [검색 데이터]에 존재하는 정확한 명칭과 주소를 바탕으로 매칭해 주세요.
`;

export function useChat() {
  const messages = ref([
    {
      role: 'system',
      content: SYSTEM_INSTRUCTION
    },
    {
      role: 'assistant',
      content: '반갑습니다! 묵고 계신 호텔이나 가보고 싶으신 동네를 말씀해 주시면, 무릎 아프지 않게 멀리 가지 않고도 편안히 둘러보실 수 있는 가까운 관광지를 콕 집어 추천해 드릴게요. 😊'
    }
  ]);
  
  const isLoading = ref(false);

  // 주변 관광지 연동용 고급 검색 로직
  const searchLocalData = (query) => {
    if (!query.trim()) return [];

    // 1. 질문에서 조사 걷어내기
    const cleanQuery = query.replace(/[은는이가을를에서의으로도만]/g, ' ');
    const keywords = cleanQuery
      .split(/\s+/)
      .filter(k => k.length >= 2 && !['추천', '안내', '어디', '있어', '좋은', '가까운', '근처', '주변', '관광지', '관광'].includes(k));

    if (keywords.length === 0) return [];

    // 2. 사용자가 특정 숙소(호텔)를 언급했는지 먼저 확인하기
    let targetHotel = null;
    for (const keyword of keywords) {
      const found = accommodation.items.find(item => 
        (item.title || '').toLowerCase().includes(keyword.toLowerCase())
      );
      if (found) {
        targetHotel = found;
        break;
      }
    }

    // 3-A. 숙소가 감지된 경우: 그 숙소의 '구' 단위 행정구역을 파악하여 주변 관광 명소 매칭
    if (targetHotel) {
      const hotelAddr = targetHotel.addr1 || '';
      // 주소에서 '마포구', '종로구', '강남구' 등 구 단위 이름 추출하기
      const guMatch = hotelAddr.match(/(\S+구)/);
      const district = guMatch ? guMatch[1] : '';

      // 해당 숙소와 같은 '구'에 위치한 다른 카테고리(관광지, 문화시설 등) 장소들 검색
      const nearbySpots = allDataSources.filter(item => {
        // 본인 숙소는 제외하고, 주소에 같은 '구'가 들어가면서 숙박 카테고리가 아닌 것
        return item.title !== targetHotel.title && 
               (item.addr1 || '').includes(district) &&
               item.contenttypeid !== '32'; // 32는 숙박 ID (숙소는 제외)
      }).slice(0, 3); // 주변 관광지 최대 3개 확보

      // 기준이 된 숙소 정보와 주변 관광지 정보를 합쳐서 반환
      return [targetHotel, ...nearbySpots];
    }

    // 3-B. 특정 숙소 언급이 없는 일반 검색일 때: 기존 키워드 매칭 방식 작동
    const scored = allDataSources
      .map(item => {
        const title = item.title || '';
        const addr = item.addr1 || '';
        const combined = (title + ' ' + addr).toLowerCase();
        
        const matchCount = keywords.reduce((acc, k) => {
          return acc + (combined.includes(k.toLowerCase()) ? 1 : 0);
        }, 0);

        return { item, matchCount };
      })
      .filter(({ matchCount }) => matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);

    return scored.slice(0, 4).map(({ item }) => item);
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
      
      if (matchedItems.length > 0) {
        // 첫 번째 아이템이 숙박 데이터인지 확인하여 프롬프트 힌트 다르게 주기
        const isHotelContext = matchedItems[0].contenttypeid === '32';

        const contextString = matchedItems.map((item, idx) => {
          const type = item.contenttypeid === '32' ? '기준 숙소' : '주변 관광지';
          return `[${type}]\n- 명칭: ${item.title}\n- 주소: ${item.addr1}\n- 연락처: ${item.tel || '전화번호 현장 확인 필요'}`;
        }).join('\n\n');

        let systemDirection = `사용자 질문과 밀접한 가이드북 데이터입니다. 사용자가 동선 조율 시 이 데이터의 주소와 전화번호를 최우선으로 다뤄 주세요:\n\n${contextString}`;
        
        if (isHotelContext) {
          systemDirection += `\n\n⚠️ 중요: 사용자가 숙소 정보를 물어보았으므로, 첫 번째 [기준 숙소]의 위치를 명확히 짚어주신 다음, 그 주소와 같은 동네에 위치한 나머지 [주변 관광지]들을 차례대로 매끄럽고 가깝다는 점을 강조하며 추천해 주세요.`;
        }

        messages.value.push({
          role: 'system',
          content: systemDirection
        });
      }

      const assistantResponse = await fetchChatResponse(messages.value);
      
      messages.value.push({
        role: 'assistant',
        content: assistantResponse
      });
    } catch (error) {
      messages.value.push({
        role: 'assistant',
        content: `대답을 읽어오는 도중 통신 상태가 지연되었습니다. 잠시 후 다시 말씀해 주실 수 있으실까요?`
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
        content: '반갑습니다! 묵고 계신 호텔이나 가보고 싶으신 동네를 말씀해 주시면, 무릎 아프지 않게 멀리 가지 않고도 편안히 둘러보실 수 있는 가까운 관광지를 콕 집어 추천해 드릴게요. 😊'
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