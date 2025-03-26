<script setup lang="ts">
import CustomerPicker from "@/components/CustomerPicker.vue";
import { ref, toRaw } from "vue";

export interface Filters {
  search: string;
  customerId: string | null;
  status: {
    draft: boolean;
    edited: boolean;
    paid: boolean;
  };
}

const props = defineProps<{
  filters: Filters;
}>();

const filters = ref<Filters>(structuredClone(toRaw(props.filters)));

const emit = defineEmits<{
  (e: "update:filters", filters: Filters): void;
  (e: "update:search", filters: Filters): void;
  (e: "update:customer", filters: Filters): void;
  (e: "update:status", filters: Filters): void;
}>();

function onSearchUpdate() {
  emit("update:search", filters.value);
  emit("update:filters", filters.value);
}

function onCustomerUpdate(customerId: string) {
  filters.value.customerId = customerId;
  emit("update:customer", filters.value);
  emit("update:filters", filters.value);
}

function onStatusUpdate() {
  emit("update:status", filters.value);
  emit("update:filters", filters.value);
}
</script>

<template>
  <div class="d-flex">
    <v-text-field
      v-model="filters.search"
      label="Search"
      prepend-inner-icon="mdi-magnify"
      class="mw-200"
      @update:model-value="onSearchUpdate"
    />

    <CustomerPicker class="mw-200 ml-3" @input="onCustomerUpdate" />

    <v-checkbox
      v-model="filters.status.draft"
      label="Draft"
      @update:model-value="onStatusUpdate"
    />

    <v-checkbox
      v-model="filters.status.edited"
      label="Edited"
      @update:model-value="onStatusUpdate"
    />

    <v-checkbox
      v-model="filters.status.paid"
      label="Paid"
      @update:model-value="onStatusUpdate"
    />
  </div>
</template>

<style scoped>
.mw-200 {
  max-width: 200px;
}
</style>
