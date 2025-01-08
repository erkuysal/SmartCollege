<template>
  <v-snackbar v-model="snackbar" :timeout="timeout" top right>
    {{ message }}
    <v-btn color="red" text @click="snackbar = false">Close</v-btn>
  </v-snackbar>
</template>

<script setup>
import { ref } from 'vue';

const snackbar = ref(false);
const message = ref('');
const timeout = 5000;

const showNotification = (msg) => {
  message.value = msg;
  snackbar.value = true;
};
</script>
