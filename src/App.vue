<template>
  <div id="app">
    <main class="container">
      <!-- 분리해둔 서울 날씨 컴포넌트를 호출합니다 -->
      <SeoulWeather />
    </main>
  </div>
</template>

<script setup>
// 자식 컴포넌트인 SeoulWeather 불러오기
import SeoulWeather from './components/SeoulWeather.vue'
</script>

<style>
/* 전역 스타일 설정 */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

#app {
  width: 100%;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
</style>