<script setup lang="ts">
import { type Invoice } from "@/db";
import LazyCustomerChip from "@/components/LazyCustomerChip.vue";
import { toRaw } from "vue";

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

const props = defineProps<{
  items: Invoice[];
  hasMore: boolean;
  isLoading: boolean;
  options: Options;
}>();

const emit = defineEmits<{
  (e: "update:options", options: Options): void;
}>();

function firstPage() {
  const o = structuredClone(toRaw(props.options));
  o.page = 1;
  emit("update:options", o);
}

function previousPage() {
  const o = structuredClone(toRaw(props.options));
  o.page--;
  emit("update:options", o);
}

function nextPage() {
  const o = structuredClone(toRaw(props.options));
  o.page++;
  emit("update:options", o);
}
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

    <template #bottom>
      <div class="d-flex">
        <v-spacer />

        <v-btn
          icon="mdi-page-first"
          :disabled="options.page === 1"
          @click="firstPage()"
        />

        <v-btn
          icon="mdi-chevron-left"
          :disabled="options.page === 1"
          @click="previousPage()"
        />

        <span class="align-content-center ml-3 mr-3">Page {{ options.page }}</span>

        <v-btn
          icon="mdi-chevron-right"
          :disabled="!hasMore"
          @click="nextPage()"
        />
      </div>
    </template>
  </v-data-table>
</template>

<style scoped></style>
