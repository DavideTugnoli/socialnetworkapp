<script setup>
import bar from "./components/HeadBar.vue";
</script>

<template>
  <header>
    <bar />
  </header>

  <RouterView />
</template>

<style scoped>
header {
  position: fixed;
  width: 100%;
  z-index: 1000;
}

main {
  padding-top: 100px;
  height: 100%;

  /* overflow-y: auto; */
}
</style>
