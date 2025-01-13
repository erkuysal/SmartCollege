<template>
  <v-app>
    <!-- Top App Bar -->
    <v-app-bar color="primary" dark app>
      <v-app-bar-nav-icon @click="toggleDrawer" />
      <v-toolbar-title class="ml-5">
        Admin Dashboard
      </v-toolbar-title>
      <v-spacer />
      <v-btn :icon="mdi-credit-card-scan" @click="handleReadRFID">
        <v-icon>mdi-credit-card-scan</v-icon>
      </v-btn>
      <v-btn :icon="mdi-account-circle">
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawerOpen"
      app
      :temporary="isMobile"
      :permanent="!isMobile"
    >
      <v-sheet class="mt-4 text-center">
        <v-list density="comfortable">
          <v-list-item @click="toListStudents">
            <v-list-item-title>
              <v-icon>mdi-account-group</v-icon>
            </v-list-item-title>
            <v-list-item-title>Students</v-list-item-title>
          </v-list-item>

          <v-list-item @click="toAddStudent">
            <v-list-item-title>
              <v-icon>mdi-account-plus</v-icon>
            </v-list-item-title>
            <v-list-item-title>Register Student</v-list-item-title>
          </v-list-item>

          <v-list-item @click="toClassrooms">
            <v-list-item-title>
              <v-icon>mdi-book-education</v-icon>
            </v-list-item-title>
            <v-list-item-title>Classrooms</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-sheet>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useDisplay } from "vuetify";
import { useRouter } from "vue-router";
import { useStudentStore } from "@/utils/stores/studentStore";

const studentStore = useStudentStore();
const { readRFID, rfidMessage } = studentStore;
const router = useRouter();

// Drawer state
const drawerOpen = ref(true);
function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value;
}

// Navigation
const toAddStudent = async () => {
  await router.push({ name: "addStudent" });
};

const toListStudents = async () => {
  await router.push({ name: "listStudents" });
};

const toClassrooms = async () => {
  await router.push({ name: "classrooms" });
};

// Determine if we’re on a small device
const { smAndDown } = useDisplay();
const isMobile = computed(() => smAndDown.value);

// Handle RFID scan and redirect to StudentInfo page
async function handleReadRFID() {
  try {
    const student_number = await readRFID()
    if (student_number) {
      console.log("Scanned student number:", student_number)

      await router.push({
        name: "studentInfo",
        params: { student_number },
      })
    } else {
      console.warn("No student_number returned from readRFID")
    }
  } catch (err) {
    console.error("Error reading RFID:", err)
  }
}


</script>
