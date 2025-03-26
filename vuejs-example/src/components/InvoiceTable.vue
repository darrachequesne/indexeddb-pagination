<script setup lang="ts">
import { type Invoice } from "@/db";
import LazyCustomerChip from "@/components/LazyCustomerChip.vue";

const headers = [
  {
    sortable: true,
    value: "date",
    title: "Date",
  },
  {
    sortable: true,
    value: "reference",
    title: "Reference",
  },
  {
    sortable: false,
    value: "customerId",
    title: "Customer",
  },
  {
    sortable: true,
    value: "status",
    title: "Status",
  },
];

export interface Options {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: "asc" | "desc" }>;
}

defineProps<{
  items: Invoice[];
  isLoading: boolean;
  options: Options;
}>();

defineEmits<{
  (e: "update:options", options: Options): void;
}>();
</script>

<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :loading="isLoading"
    must-sort
    :page="options.page"
    :items-per-page="options.itemsPerPage"
    :sort-by="options.sortBy"
    @update:options="$emit('update:options', $event)"
  >
    <template #[`item.customerId`]="{ value }">
      <LazyCustomerChip :customer-id="value" />
    </template>
  </v-data-table>
</template>

<style scoped></style>
