<template>
  <div class="w-full my-[50px]">
    <h1 class="mb-12 text-6xl font-bold u-text-white">Lightning address</h1>
    <span class="u-text-white mb-2">
      Domains other than sats4.me are currently not suported by this service,
      but will be available through the
      <ULink to="/proxies" class="underline">reverse proxy service</ULink>
      later.
    </span>
    <form class="gap-2 my-2" @submit.prevent="saveData">
      <div>
        <label class="u-text-white mb-1" for="newUrl"
          >The address you want</label
        >
        <UInput
          v-model="newAddress"
          :loading="loading"
          class="w-full mb-2"
          size="xl"
          variant="white"
          type="text"
          name="newUrl"
          placeholder="you@sats4.me"
          autofocus
          autocomplete="off"
        />
      </div>
      <div>
        <label class="u-text-white mb-1" for="newUrl"
          >Your LnMe onion URL</label
        >
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
      </div>
      <UButton type="submit" variant="white" size="xl"> Save </UButton>
    </form>
    <UModal
      v-model="showModal"
      class="u-text-black flex items-center justify-center"
    >
      <div class="flex items-center justify-center flex-col">
        <h3 class="mb-6 text-3xl font-bold">Your addresses</h3>
        <span>Your address is now set up. You can now receive sats here:</span>
        <span class="font-bold block">Lightning Address: </span>
        <InputCopy :value="newAddress" class="m-2 w-full ml-0" />

        <span class="font-bold">Tipping page: </span>
        <InputCopy :value="userTippingPage" class="m-2 w-full ml-0" />

        <span class="font-bold">LNURL: </span>
        <InputCopy :value="userLnurl" class="m-2 w-full ml-0" />
        <qrcode
          :value="userLnurl"
          :margin="2"
          class="h-64 w-64"
          render-as="svg"
        />
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { SupabaseClient } from "@supabase/supabase-js";
import { bech32 } from "bech32";
import Qrcode from "qrcode.vue";
import { Database } from "~~/types/db";

const client = useSupabaseClient() as SupabaseClient<Database>;
const user = useSupabaseUser();
const loading = ref(null);
const newAddress = ref("");
const newUrl = ref("");
const userLnurl = ref("");
const userTippingPage = ref("");
const showModal = ref(false);

onMounted(async () => {
  // eslint-disable-next-line prefer-const
  let { data, error } = await client
    .from("LightningAddresses")
    .select("address, proxyTarget")
    .eq("user_id", user.value.id);

  if (!data || !data[0] || !data[0].proxyTarget || error) {
    await client.from("LightningAddresses").insert({
      user_id: user.value.id,
      proxyTarget: "",
      address: "",
    });
    data = (
      await client
        .from("LightningAddresses")
        .select("address, proxyTarget")
        .eq("user_id", user.value.id)
    ).data;
  }
  newUrl.value = data[0].proxyTarget;
  newAddress.value = data[0].address + "@sats4.me";
  const encoder = new TextEncoder();
  const words = bech32.toWords(
    encoder.encode(
      `https://sats4.me/.well-known/lnurl/${newAddress.value.split("@")[0]}`
    )
  );
  userLnurl.value = bech32.encode("lnurl", words, 512);
  userTippingPage.value = `https://sats4.me/${newAddress.value.split("@")[0]}`;
});

async function saveData() {
  loading.value = true;

  try {
    const { data } = await client
      .from("LightningAddresses")
      .select("address, user_id")
      .eq("address", newAddress.value.split("@")[0].toLowerCase());

    if (data && data.length > 0 && data[0].user_id !== user.value.id) {
      alert("This address is already in use");
      loading.value = false;
      return;
    }

    const newOnionArrayUrl = newUrl.value ? newUrl.value.split("@") : [false];
    const newOnionUrl = newOnionArrayUrl[newOnionArrayUrl.length - 1];
    const { error } = await client
      .from("LightningAddresses")
      .update({
        ...((newOnionUrl ? { proxyTarget: newOnionUrl } : {}) as {
          proxyTarget: string;
        }),
        address: newAddress.value.split("@")[0].toLowerCase(),
      })
      .match({ user_id: user.value.id });
    if (error) {
      const { error: err } = await client.from("LightningAddresses").insert({
        user_id: user.value.id,
        ...((newOnionUrl ? { proxyTarget: newOnionUrl } : {}) as {
          proxyTarget: string;
        }),
        address: newAddress.value.split("@")[0].toLowerCase(),
      });
      throw new Error(JSON.stringify(error) + "\n\n" + JSON.stringify(err));
    }
    newAddress.value = newAddress.value.split("@")[0] + "@sats4.me";
    const encoder = new TextEncoder();
    const words = bech32.toWords(
      encoder.encode(
        `https://sats4.me/.well-known/lnurl/${newAddress.value.split("@")[0]}`
      )
    );
    userLnurl.value = bech32.encode("lnurl", words, 512);
    userTippingPage.value = `https://sats4.me/${
      newAddress.value.split("@")[0]
    }`;
    showModal.value = true;
  } finally {
    loading.value = false;
  }
}
</script>
