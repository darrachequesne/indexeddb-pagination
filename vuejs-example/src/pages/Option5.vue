<script lang="ts" setup>
import { reactive, ref } from "vue";
import { getDB, type Invoice } from "@/db";
import InvoiceTableFilters, {
  type Filters,
} from "@/components/InvoiceTableFilters.vue";
import { type Options } from "@/components/InvoiceTable.vue";
import InvoiceTableWithCustomFooter from "@/components/InvoiceTableWithCustomFooter.vue";

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
const hasMore = ref(false);

async function onFiltersUpdate(newFilters: Filters) {
  filters.search = newFilters.search;
  filters.customerId = newFilters.customerId;
  filters.status = newFilters.status;

  const result = await loadItems(filters, options);
  items.value = result.items;
  hasMore.value = result.hasMore;
}

async function onOptionsUpdate(newOptions: Options) {
  options.page = newOptions.page;
  options.itemsPerPage = newOptions.itemsPerPage;
  options.sortBy = newOptions.sortBy;

  const result = await loadItems(filters, options);
  items.value = result.items;
  hasMore.value = result.hasMore;
}

async function loadItems(filters: Filters, options: Options) {
  function matches(item: Invoice) {
    const matchesReference =
      !filters.search || item.reference.includes(filters.search);
    const matchesCustomerId =
      !filters.customerId || filters.customerId === item.customerId;
    const matchesStatus = filters.status[item.status];

    return matchesReference && matchesCustomerId && matchesStatus;
  }

  isLoading.value = true;

  const items = [] as Invoice[];
  let totalItems = 0;
  let hasMore = false;

  const db = await getDB();
  const start = Date.now();
  const tx = db.transaction(["invoices"], "readonly");

  let index;
  let iterator;
  const direction = options.sortBy[0].order === "asc" ? "next" : "prev";

  if (filters.search) {
    index = tx.objectStore("invoices").index("by-reference");
    iterator = index.iterate(
      IDBKeyRange.bound(filters.search, filters.search + "\uffff"),
      direction,
    );
  } else if (filters.customerId) {
    switch (options.sortBy[0].key) {
      case "reference":
        index = tx.objectStore("invoices").index("by-customer-reference");
        break;
      default:
        index = tx.objectStore("invoices").index("by-customer-date-reference");
        break;
    }
    iterator = index.iterate(
      IDBKeyRange.bound([filters.customerId], [filters.customerId, [], []]),
      direction,
    );
  } else {
    switch (options.sortBy[0].key) {
      case "reference":
        index = tx.objectStore("invoices").index("by-reference");
        break;
      default:
        index = tx.objectStore("invoices").index("by-date-reference");
        break;
    }
    iterator = index.iterate(null, direction);
  }

  for await (const { value } of iterator) {
    if (!matches(value)) {
      continue;
    }

    totalItems++;

    const shouldSkip = totalItems <= (options.page - 1) * options.itemsPerPage;

    if (shouldSkip) {
      continue;
    }

    if (items.length < options.itemsPerPage) {
      items.push(value);
    } else {
      hasMore = true;
      break;
    }
  }

  isLoading.value = false;
  loadDuration.value = Date.now() - start;

  return {
    items,
    hasMore,
  };
}
</script>

<template>
  <v-container>
    <h1>
      Option 5: <code>index.openCursor()</code> without the total number of
      items and multiple indexes
    </h1>

    <InvoiceTableFilters
      :filters="filters"
      @update:filters="onFiltersUpdate"
    />

    <InvoiceTableWithCustomFooter
      :items="items"
      :has-more="hasMore"
      :is-loading="isLoading"
      :options="options"
      @update:options="onOptionsUpdate"
    />

    <p class="mt-3">
      Loaded {{ items.length }} items in {{ loadDuration }} ms
    </p>
  </v-container>
</template>
