<script setup lang="ts">
const router = useRouter();
const client = useSupabaseClient();
const user = useSupabaseUser();
const colorMode = useColorMode();
const toggleDark = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};
const colorModeIcon = computed(() => colorMode.preference === 'dark' ? 'heroicons-outline:moon' : 'heroicons-outline:sun');
const logout = async () => {
  await client.auth.signOut();
  router.push('/');
};
</script>

<template>
  <div>
    <Title>Citadel accounts</Title>
    <div class="flex items-center md:justify-between justify-center">
      <h4 class="u-text-white md:block font-bold mx-4">
        sats4me
      </h4>
      <div class="flex items-center">
        <UButton variant="transparent" :icon="colorModeIcon" @click="toggleDark" />
        <UButton v-if="user" class="u-text-white" variant="transparent" @click="logout">
          Logout
        </UButton>
      </div>
    </div>
  </div>
</template>
