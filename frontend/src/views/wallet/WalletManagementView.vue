<template>
  <div class="wallet-management-view">
    <div class="view-header">
      <h1 class="header-title">Wallet Management</h1>
    </div>
    <div class="view-content">
      <v-card>
        <v-tabs v-model="activeTab">
          <v-tab value="wallets">Wallets</v-tab>
          <v-tab value="transactions">Transactions</v-tab>
          <v-tab value="activity-types">Activity Types</v-tab>
          <v-tab value="multiplier-rules">Multiplier Rules</v-tab>
        </v-tabs>
        <v-card-text>
          <v-window v-model="activeTab">
            <v-window-item value="wallets">
              <WalletManager />
            </v-window-item>
            <v-window-item value="transactions">
              <TransactionManager />
            </v-window-item>
            <v-window-item value="activity-types">
              <ActivityTypeManager />
            </v-window-item>
            <v-window-item value="multiplier-rules">
              <MultiplierRulesManager />
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import WalletManager from '@/components/wallet/WalletManager.vue';
import TransactionManager from '@/components/wallet/TransactionManager.vue';
import ActivityTypeManager from '@/components/wallet/ActivityTypeManager.vue';
import MultiplierRulesManager from '@/components/wallet/MultiplierRulesManager.vue';

const activeTab = ref('wallets');
</script>

<style scoped>
.wallet-management-view {
  padding: 20px;
}
.view-header {
  margin-bottom: 20px;
}
.header-title {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}
.view-content {
  position: relative;
  min-height: 200px;
}
</style> 