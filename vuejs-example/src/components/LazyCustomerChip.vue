<script setup lang="ts">
import { onMounted, ref } from "vue";
import { type Customer, getDB } from "@/db";

const isLoading = ref(false);
const { customerId } = defineProps<{
  customerId: string;
}>();
const customer = ref<Customer>();

onMounted(async () => {
  isLoading.value = true;

  const db = await getDB();
  customer.value = await db.get("customers", customerId);

  isLoading.value = false;
});
</script>

<template>
  <v-skeleton-loader
    v-if="isLoading"
    type="text"
  />
  <span v-else>{{ customer?.name || "-" }}</span>
</template>

<style scoped></style>
