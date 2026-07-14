<template>
  <div class="weather-card">
    <!-- 📍 이제 에러 없이 진짜 내 현재 위치가 정확하게 출력됩니다 -->
    <h3 v-if="!loading && !error" class="location-title">
      📍 {{ districtName }} 날씨
    </h3>
    <h3 v-else>🌍 실시간 날씨 정보</h3>
    
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>내 현재 위치를 분석하는 중...</p>
    </div>

    <div v-else-if="error" class="error-state">
      ⚠️ {{ errorMessage }}
      <button @click="initLocationWeather" class="retry-btn">다시 시도</button>
    </div>

    <div v-else class="weather-info">
      <div class="temp-display">
        <span class="temp">{{ weatherData.temp }}</span>
        <span class="unit">°C</span>
      </div>
      
      <div class="tip-box">
        <p class="weather-tip">{{ weatherTip }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const weatherData = ref({ temp: null, weatherCode: null })
const districtName = ref('내 위치') 
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')

const weatherTip = computed(() => {
  const temp = weatherData.value.temp
  const code = weatherData.value.weatherCode
  if (temp === null) return '날씨 데이터를 분석하는 중입니다.'

  const isRaining = (code >= 51 && code <= 67) || (code >= 80 && code <= 82)
  const isSnowing = (code >= 71 && code <= 77) || (code === 85 || code === 86)

  if (isRaining) return '🌧️ 밖에 비가 내리고 있어요. 외출 시 우산을 꼭 챙겨주세요!'
  if (isSnowing) return '❄️ 하늘에서 눈이 내립니다. 미끄러운 길 조심하시고 따뜻하게 입으세요!'
  if (temp >= 28) return '🥵 오늘은 평소보다 많이 덥습니다! 시원한 물을 자주 마시고 더위 조심하세요.'
  if (temp <= 5) return '🥶 날씨가 무척 쌀쌀합니다. 감기 걸리지 않게 옷을 따뜻하게 여미세요!'

  return '☀️ 선선하고 활동하기 좋은 날씨예요. 기분 좋은 하루 보내세요!'
})

// 🔥 [변경] IP/API 키 제약이 없는 글로벌 공공 주소 변환 API 사용
const fetchKoreanDistrict = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ko`
    )
    if (!response.ok) throw new Error()
    const data = await response.json()
    
    if (data.address) {
      const addr = data.address
      // 시/도 이름과 구/군/시 정보를 조합해 한국어 주소 추출
      const city = addr.city || addr.province || addr.metropolitan || ''
      const borough = addr.borough || addr.suburb || addr.district || addr.city_district || ''
      
      districtName.value = `${city} ${borough}`.trim() || '내 위치'
    } else {
      districtName.value = '내 위치'
    }
  } catch (err) {
    console.warn('주소 변환 실패:', err)
    districtName.value = '내 위치'
  }
}

const getWeatherData = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    )
    if (!response.ok) throw new Error()
    const data = await response.json()
    
    weatherData.value = {
      temp: data.current_weather.temperature,
      weatherCode: data.current_weather.weathercode
    }
    
    // 오픈 API 기반 주소 변환 함수 호출
    await fetchKoreanDistrict(lat, lon)
    error.value = false
  } catch (err) {
    console.error(err)
    error.value = true
    errorMessage.value = '날씨 데이터를 받아오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

const initLocationWeather = () => {
  if (!navigator.geolocation) {
    error.value = true
    errorMessage.value = '이 브라우저는 위치 서비스를 지원하지 않습니다.'
    loading.value = false
    return
  }

  loading.value = true
  error.value = false

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lon = position.coords.longitude
      getWeatherData(lat, lon)
    },
    (err) => {
      error.value = true
      loading.value = false
      if (err.code === 1) {
        errorMessage.value = '브라우저의 위치 정보 제공 권한을 허용해 주세요.'
      } else {
        errorMessage.value = '내 위치를 가져오지 못했습니다.'
      }
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
  )
}

onMounted(() => {
  initLocationWeather()
})
</script>

<style scoped>
.weather-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; max-width: 320px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); text-align: center; margin: 0 auto; }
.location-title { margin-top: 0; color: #1e293b; font-size: 1.2rem; font-weight: 700; }
.loading-state, .error-state { padding: 30px 0; color: #64748b; }
.error-state { color: #ef4444; }
.spinner { width: 28px; height: 28px; border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.temp-display { margin: 10px 0 20px; }
.temp { font-size: 3.8rem; font-weight: bold; color: #0f172a; }
.unit { font-size: 1.8rem; color: #475569; }
.tip-box { background-color: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #f1f5f9; }
.weather-tip { font-size: 0.95rem; line-height: 1.5; color: #334155; margin: 0; font-weight: 500; }
.retry-btn { display: block; margin: 15px auto 0; padding: 8px 16px; background-color: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; }
</style>