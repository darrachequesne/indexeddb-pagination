<template>
  <v-app>
    <v-app-bar title="Pagination with IndexedDB" />

    <v-navigation-drawer>
      <v-list nav>
        <v-list-item to="/Option1">
          <v-list-item-title>Option 1</v-list-item-title>
        </v-list-item>

        <v-list-item to="/Option2">
          <v-list-item-title>Option 2</v-list-item-title>
        </v-list-item>

        <v-list-item to="/Option3">
          <v-list-item-title>Option 3</v-list-item-title>
        </v-list-item>

        <v-list-item to="/Option4">
          <v-list-item-title>Option 4</v-list-item-title>
        </v-list-item>

        <v-list-item to="/Option5">
          <v-list-item-title>Option 5</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
//
</script>
