<template>
  <div>
    <h2>Student List</h2>
    <ul>
      <li v-for="student in students" :key="student.student_number">
        {{ student.student_number }} - {{ student.name }}
        <button @click="writeToCard(student.student_number)" :disabled="student.written_to_card">
          {{ student.written_to_card ? "Written to Card" : "Write to Card" }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      students: []
    };
  },
  mounted() {
    this.loadStudents();
  },
  methods: {
    loadStudents() {
      getStudents().then((response) => {
        this.students = response.data;
      });
    },
    writeToCard(studentNumber) {
      writeToCard(studentNumber).then(() => {
        alert("Student data written to card!");
        this.loadStudents();
      });
    }
  }
};
</script>
