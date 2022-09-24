<template>
  <div class="w-full my-[50px]">
    <h1 class="mb-12 text-6xl font-bold u-text-white">Proxies</h1>
    <span class="u-text-white mb-2">
      Make any onion site available on the "normal" internet.
      This part of the service is still in beta currently and will not stay free.
      The final version will be faster and support custom domains.
    </span>
    <form class="gap-2 my-2" @submit.prevent="saveData">
      <div class="mb-4">
        <label class="u-text-white mb-1" for="newUrl">Your onion URL</label>
        <UInput
          v-model="newUrl"
          :loading="loading"
          class="w-full mb-3"
          size="xl"
          variant="white"
          type="text"
          name="newUrl"
          placeholder="youronnionurl.onion"
          autofocus
          autocomplete="off"
        />
        <UCheckbox v-model="btcpayCompat" class="u-text-white inline-flex" name="btcpayCompat" />
        <label class="u-text-white mb-1 inline ml-2" for="btcpayCompat">Is a BTCPayServer</label>
      </div>
      <UButton type="submit" variant="white" size="xl"> Save </UButton>
    </form>
    <UModal
      v-model="showModal"
      class="u-text-black flex items-center justify-center"
    >
      <div class="flex items-center justify-center flex-col">
        <h3 class="mb-6 text-3xl font-bold">Your site</h3>
        <span>Your onion site is now accessible using this domain:</span>
        <InputCopy :value="domain" class="my-4 w-full mx-auto" />
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "~~/types/db";

const client = useSupabaseClient() as SupabaseClient<Database>;
const user = useSupabaseUser();
const loading = ref(null);
const domain = ref("");
const newUrl = ref("");
const showModal = ref(false);
const btcpayCompat = ref(false);

onMounted(async () => {
  // eslint-disable-next-line prefer-const
  let { data, error } = await client
    .from("reverse_proxies")
    .select()
    .eq("owner", user.value.id)
    .maybeSingle();

  if (!error && data) newUrl.value = data.target_url;
});

async function saveData() {
  loading.value = true;
  try {
    let result = await $fetch("/api/configure-proxy", {
      method: "POST",
      body: {
        onionUrl: newUrl.value,
        btcpay_compat: btcpayCompat.value,
      },
    });
    if (result.error) {
      alert(result.error);
      throw new Error(result.error);
    }
    domain.value = "https://" + result.host;
    showModal.value = true;
  } finally {
    loading.value = false;
  }
}
</script>
