// src/stores/classrooms.js
import { defineStore } from 'pinia';

export const useClassroomsStore = defineStore('classrooms', {
  // State: Defines the reactive properties of the store
  state: () => ({
    classrooms: [
      { id: 1, name: 'Classroom A', capacity: 30, currentOccupancy: 25, attendanceStarted: false },
      { id: 2, name: 'Classroom B', capacity: 25, currentOccupancy: 19, attendanceStarted: false },
      { id: 3, name: 'Classroom C', capacity: 40, currentOccupancy: 40, attendanceStarted: false },
      { id: 4, name: 'Classroom D', capacity: 35, currentOccupancy: 10, attendanceStarted: false },
      { id: 5, name: 'Classroom E', capacity: 50, currentOccupancy: 35, attendanceStarted: false },
    ],
    attendanceLogs: {
      1: [
        { id: 1, timestamp: '2025-01-12 10:00 AM', description: 'Attendance started.' },
        { id: 2, timestamp: '2025-01-12 10:30 AM', description: '10 students attended.' },
      ],
      2: [
        { id: 1, timestamp: '2025-01-11 09:00 AM', description: 'Attendance not activated.' },
      ],
      // Add more logs for other classrooms as needed
    },
  }),

  // Getters: Compute derived state based on store state
  getters: {
    // Retrieve all classrooms where attendance has started
    startedAttendance(state) {
      return state.classrooms.filter(classroom => classroom.attendanceStarted);
    },

    // Calculate total occupancy across all classrooms
    totalOccupancy(state) {
      return state.classrooms.reduce((total, classroom) => total + classroom.currentOccupancy, 0);
    },

    // Calculate average occupancy percentage
    averageOccupancy(state) {
      const totalCapacity = state.classrooms.reduce((sum, c) => sum + c.capacity, 0);
      const totalOccupancy = state.classrooms.reduce(
        (sum, c) => sum + c.currentOccupancy,
        0
      );
      return totalCapacity ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;
    },

    // Total unused capacity
    totalUnusedCapacity(state) {
      return state.classrooms.reduce(
        (sum, c) => sum + (c.capacity - c.currentOccupancy),
        0
      );
    },

    // Count of high occupancy classrooms (>80%)
    highOccupancyCount(state) {
      return state.classrooms.filter(c => (c.currentOccupancy / c.capacity) * 100 > 80).length;
    },

    // Count of medium occupancy classrooms (50%-80%)
    mediumOccupancyCount(state) {
      return state.classrooms.filter(c => {
        const percentage = (c.currentOccupancy / c.capacity) * 100;
        return percentage >= 50 && percentage <= 80;
      }).length;
    },

    // Count of low occupancy classrooms (<50%)
    lowOccupancyCount(state) {
      return state.classrooms.filter(c => (c.currentOccupancy / c.capacity) * 100 < 50).length;
    },

    // Most utilized classroom
    mostUtilizedClassroom(state) {
      if (state.classrooms.length === 0) return 'N/A';
      return state.classrooms.reduce((max, c) =>
        (c.currentOccupancy / c.capacity) * 100 > (max.currentOccupancy / max.capacity) * 100 ? c : max
      ).name;
    },

    // Least utilized classroom
    leastUtilizedClassroom(state) {
      if (state.classrooms.length === 0) return 'N/A';
      return state.classrooms.reduce((min, c) =>
        (c.currentOccupancy / c.capacity) * 100 < (min.currentOccupancy / min.capacity) * 100 ? c : min
      ).name;
    },

    // Retrieve attendance logs for a specific classroom
    getAttendanceLogs: (state) => (classroomId) => {
      return state.attendanceLogs[classroomId] || [];
    },
  },

  // Actions: Define methods that can mutate the state or perform asynchronous operations
  actions: {
    /**
     * Adds a new classroom to the store.
     * @param {Object} newClassroom - The classroom object to add.
     */
    addClassroom(newClassroom) {
      this.classrooms.push(newClassroom);
    },

    /**
     * Updates an existing classroom in the store.
     * @param {Object} updatedClassroom - The classroom object with updated data.
     */
    updateClassroom(updatedClassroom) {
      const index = this.classrooms.findIndex(c => c.id === updatedClassroom.id);
      if (index !== -1) {
        // Ensure reactivity by using Vue's reactivity methods if needed
        this.classrooms[index] = { ...this.classrooms[index], ...updatedClassroom };
      }
    },

    /**
     * Deletes a classroom from the store based on its ID.
     * @param {number} classroomId - The ID of the classroom to delete.
     */
    deleteClassroom(classroomId) {
      this.classrooms = this.classrooms.filter(c => c.id !== classroomId);
      // Optionally, remove attendance logs as well
      delete this.attendanceLogs[classroomId];
    },

    /**
     * Retrieves a classroom by its ID.
     * @param {number} id - The ID of the classroom to retrieve.
     * @returns {Object | undefined} - The classroom object if found, else undefined.
     */
    getClassroomById(id) {
      return this.classrooms.find(c => c.id === id);
    },

    /**
     * Adds a new attendance log for a classroom.
     * @param {number} classroomId - The ID of the classroom.
     * @param {Object} log - The attendance log object to add.
     */
    addAttendanceLog(classroomId, log) {
      if (!this.attendanceLogs[classroomId]) {
        this.attendanceLogs[classroomId] = [];
      }
      this.attendanceLogs[classroomId].push(log);
    },

    /**
     * Deletes an attendance log from a classroom.
     * @param {number} classroomId - The ID of the classroom.
     * @param {number} logId - The ID of the log to delete.
     */
    deleteAttendanceLog(classroomId, logId) {
      if (this.attendanceLogs[classroomId]) {
        this.attendanceLogs[classroomId] = this.attendanceLogs[classroomId].filter(log => log.id !== logId);
      }
    },
  },
});
