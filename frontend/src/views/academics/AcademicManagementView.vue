<template>
  <div class="academic-management-view">
    <PageHeader title="Academic Settings">
      <template #subtitle>
        Manage academic years, semesters, and classrooms
      </template>
    </PageHeader>

    <!-- Main Content -->
    <div class="view-content">
      <v-card>
        <v-tabs v-model="activeTab">
          <v-tab value="years">Academic Years</v-tab>
          <v-tab value="semesters">Semesters</v-tab>
          <v-tab value="classrooms">Classrooms</v-tab>
        </v-tabs>

        <v-card-text>
          <v-window v-model="activeTab">
            <!-- Academic Years Tab -->
            <v-window-item value="years">
              <AcademicYearManager />
            </v-window-item>

            <!-- Semesters Tab -->
            <v-window-item value="semesters">
              <SemesterManager />
            </v-window-item>

            <!-- Classrooms Tab -->
            <v-window-item value="classrooms">
              <ClassroomManager />
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AcademicYearManager from '@/components/academics/academic/AcademicYearManager.vue';
import SemesterManager from '@/components/academics/academic/SemesterManager.vue';
import ClassroomManager from '@/components/academics/academic/ClassroomManager.vue';
import PageHeader from '@/components/common/PageHeader.vue';

const activeTab = ref('years');
</script>

<style scoped>
.academic-management-view {
  padding: 20px;
}

.view-content {
  position: relative;
  min-height: 200px;
}
</style> 