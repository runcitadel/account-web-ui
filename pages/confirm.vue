<script setup lang="ts">
const user = useSupabaseUser();
watchEffect(() => {
  if (user.value) {
    navigateTo("/addresses");
  }
});
</script>

<template>
  <p class="u-text-white">Redirecting...</p>
</template>
