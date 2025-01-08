<template>
  <v-container>
    <v-card>
      <v-card-title>Your Wallet</v-card-title>
      <v-card-subtitle>Manage your balance and transaction history</v-card-subtitle>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-card outlined>
              <v-card-title>Balance</v-card-title>
              <v-card-text>
                <h3>₹{{ balance }}</h3>
                <v-btn color="primary" @click="topUpBalance">Top Up</v-btn>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-data-table
              :headers="transactionHeaders"
              :items="transactions"
              class="elevation-1"
              dense
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>Transaction History</v-toolbar-title>
                </v-toolbar>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const balance = ref(0);
const transactions = ref([]);
const transactionHeaders = [
  { text: "Date", value: "date" },
  { text: "Amount", value: "amount" },
  { text: "Type", value: "type" },
];

const fetchWalletData = async () => {
  try {
    const response = await axios.get('/api/wallet/');
    balance.value = response.data.balance;
    transactions.value = response.data.transactions;
  } catch (error) {
    console.error('Error fetching wallet data:', error);
  }
};

const topUpBalance = () => {
  alert('Top-up functionality coming soon!');
};

onMounted(fetchWalletData);
</script>
