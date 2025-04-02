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

function onSearchUpdate(newFilters: Filters) {
  filters.search = newFilters.search;
  filters.customerId = newFilters.customerId;
  filters.status = newFilters.status;
}

async function onCustomerUpdate(newFilters: Filters) {
  filters.search = newFilters.search;
  filters.customerId = newFilters.customerId;
  filters.status = newFilters.status;
  items.value = await loadItems(filters);
}

async function onStatusUpdate(newFilters: Filters) {
  filters.search = newFilters.search;
  filters.customerId = newFilters.customerId;
  filters.status = newFilters.status;
  items.value = await loadItems(filters);
}

async function loadItems(filters: Filters) {
  isLoading.value = true;

  const db = await getDB();
  const start = Date.now();
  let items: Invoice[];

  if (filters.customerId) {
    items = await db.getAllFromIndex(
      "invoices",
      "by-customer",
      filters.customerId,
    );
  } else {
    const promises = [];
    if (filters.status.draft) {
      promises.push(db.getAllFromIndex("invoices", "by-status", "draft"));
    }
    if (filters.status.edited) {
      promises.push(db.getAllFromIndex("invoices", "by-status", "edited"));
    }
    if (filters.status.paid) {
      promises.push(db.getAllFromIndex("invoices", "by-status", "paid"));
    }
    const results = await Promise.all(promises);
    items = results.reduce((arr, elem) => {
      arr.push(...elem);
      return arr;
    }, []);
  }

  isLoading.value = false;
  loadDuration.value = Date.now() - start;

  return items;
}

onMounted(async () => {
  items.value = await loadItems(filters);
});
</script>

<template>
  <v-container>
    <h1>Option 2: <code>index.getAll()</code></h1>

    <InvoiceTableFilters
      :filters="filters"
      @update:search="onSearchUpdate"
      @update:customer="onCustomerUpdate"
      @update:status="onStatusUpdate"
    />

    <InvoiceTable
      :items="filteredItems"
      :is-loading="isLoading"
      :options="options"
    />

    <p class="mt-3">
      Loaded {{ items.length }} items in {{ loadDuration }} ms
    </p>
  </v-container>
</template>
