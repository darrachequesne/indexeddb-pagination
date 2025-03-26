<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from "vue";
import { getDB, type Invoice } from "@/db";
import InvoiceTableFilters, {
  type Filters,
} from "@/components/InvoiceTableFilters.vue";
import InvoiceTable, { type Options } from "@/components/InvoiceTable.vue";

const isLoading = ref(false);
const loadDuration = ref(-1);
const options = reactive<Options>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [
    {
      key: "date",
      order: "desc",
    },
    {
      key: "reference",
      order: "desc",
    },
  ],
});
const filters = reactive<Filters>({
  search: "",
  customerId: null,
  status: {
    draft: true,
    edited: true,
    paid: false,
  },
});
const items = ref<Invoice[]>([]);

const filteredItems = computed(() => {
  return items.value.filter((item: Invoice) => {
    const matchesReference =
      !filters.search || item.reference.includes(filters.search);
    const matchesCustomerId =
      !filters.customerId || filters.customerId === item.customerId;
    const matchesStatus = filters.status[item.status];

    return matchesReference && matchesCustomerId && matchesStatus;
  });
});

function onFiltersUpdate(newFilters: Filters) {
  filters.search = newFilters.search;
  filters.customerId = newFilters.customerId;
  filters.status = newFilters.status;
}

async function loadItems() {
  isLoading.value = true;

  const db = await getDB();
  const start = Date.now();

  const items = await db.getAll("invoices");

  isLoading.value = false;
  loadDuration.value = Date.now() - start;

  return items;
}

onMounted(async () => {
  items.value = await loadItems();
});
</script>

<template>
  <v-container>
    <h1>Option 1: <code>store.getAll()</code></h1>

    <InvoiceTableFilters :filters="filters" @update:filters="onFiltersUpdate" />

    <InvoiceTable
      :items="filteredItems"
      :is-loading="isLoading"
      :options="options"
    />

    <p class="mt-3">Loaded {{ items.length }} items in {{ loadDuration }} ms</p>
  </v-container>
</template>
