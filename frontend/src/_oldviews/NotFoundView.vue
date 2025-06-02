<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';

const router = useRouter();
const animationReady = ref(false);

const goHome = () => {
  router.push({ name: 'dashboard' });
};

onMounted(() => {
  // Trigger animation after component mounts
  setTimeout(() => {
    animationReady.value = true;
  }, 100);
});
</script>

<template>
  <div class="not-found-container">
    <v-card 
      max-width="550" 
      class="mx-auto text-center not-found-card"
      :class="{ 'animation-ready': animationReady }"
      elevation="0"
      rounded="lg"
    >
      <v-card-title class="text-h2 font-weight-bold pt-6 error-code">
        404
      </v-card-title>
      <v-card-subtitle class="text-h5 font-weight-medium mb-3">
        Page Not Found
      </v-card-subtitle>
      
      <v-card-text>
        <p class="text-body-1 mb-6">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
        
        <!-- Custom SVG Illustration -->
        <div class="svg-container mb-6">
          <svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" class="error-illustration">
            <!-- Background Elements -->
            <circle cx="250" cy="100" r="80" fill="#f5f5f5" />
            <path d="M320 140 Q 380 110 420 160" stroke="#e0e0e0" stroke-width="4" fill="none" />
            <path d="M180 60 Q 120 90 80 40" stroke="#e0e0e0" stroke-width="4" fill="none" />
            
            <!-- Document Icon -->
            <rect x="200" y="70" width="100" height="120" rx="6" fill="white" stroke="#1976d2" stroke-width="2" class="doc-element" />
            <line x1="220" y1="100" x2="280" y2="100" stroke="#1976d2" stroke-width="2" class="doc-element" />
            <line x1="220" y1="120" x2="280" y2="120" stroke="#1976d2" stroke-width="2" class="doc-element" />
            <line x1="220" y1="140" x2="260" y2="140" stroke="#1976d2" stroke-width="2" class="doc-element" />
            
            <!-- Search Icon -->
            <circle cx="320" cy="70" r="25" fill="white" stroke="#1976d2" stroke-width="2" class="search-element" />
            <line x1="338" y1="88" x2="350" y2="100" stroke="#1976d2" stroke-width="3" class="search-element" />
            
            <!-- Question Mark -->
            <text x="235" y="180" font-size="70" fill="#1976d2" font-weight="bold" class="question-mark">?</text>
          </svg>
        </div>
      </v-card-text>
      
      <v-card-actions class="justify-center pb-6">
        <v-btn 
          color="primary"
          size="large"
          rounded="pill"
          elevation="1"
          class="px-6 py-3 home-button"
          @click="goHome"
        >
          <v-icon left class="mr-2">mdi-home</v-icon>
          Back to Dashboard
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 16px;
}

.not-found-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transform: translateY(30px);
  opacity: 0;
  transition: transform 0.6s ease-out, opacity 0.6s ease-out, box-shadow 0.3s;
}

.not-found-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
}

.not-found-card.animation-ready {
  transform: translateY(0);
  opacity: 1;
}

.error-code {
  background: linear-gradient(45deg, #1976d2, #64b5f6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.svg-container {
  max-width: 400px;
  margin: 0 auto;
}

.error-illustration {
  width: 100%;
  height: auto;
}

/* SVG Animation */
.doc-element {
  animation: float 3s ease-in-out infinite;
}

.search-element {
  animation: float 3s ease-in-out infinite;
  animation-delay: 0.5s;
}

.question-mark {
  animation: pulse 2s ease-in-out infinite;
}

.home-button {
  transition: transform 0.2s, box-shadow 0.2s;
}

.home-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(25, 118, 210, 0.2) !important;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style> 