<script setup lang="ts">
import { getDB, type Customer } from "@/db";
import { onMounted, ref } from "vue";

const emit = defineEmits(["input"]);

const isLoading = ref(false);
const items = ref<Customer[]>([]);

async function loadItems(src?: string) {
  const db = await getDB();

  isLoading.value = true;

  items.value = await db.getAllFromIndex(
    "customers",
    "by-name",
    src ? IDBKeyRange.lowerBound(src) : undefined,
    10,
  );

  isLoading.value = false;
}

onMounted(async () => {
  await loadItems();
});
</script>

<template>
  <v-autocomplete
    :loading="isLoading"
    :items="items"
    label="Customer"
    item-title="name"
    item-value="id"
    clearable
    @update:search="loadItems"
    @update:model-value="emit('input', $event)"
  />
</template>

<style scoped></style>
