<template>
  <div class="w-full my-[50px]">
    <h1 class="mb-12 text-6xl font-bold u-text-white">
      Your Lightning address
    </h1>
    <span>No matter what you enter after @, your Lightning address will always be @sats4.me
    </span>
    <form class="gap-2 my-2" @submit.prevent="saveData">
      <div>
        <label class="u-text-white mb-1" for="newUrl">The address you want</label>
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
        <label class="u-text-white mb-1" for="newUrl">Your LnMe onion URL</label>
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
      <UButton type="submit" variant="white" size="xl" class="w-full">
        Save
      </UButton>
    </form>
    <div>
      <h3 class="u-text-white">
        Your addresses
      </h3>
      <p>
        <span class="font-bold u-text-white">Lightning Address: </span>
        <span class="u-text-white">{{ newAddress }}</span>
      </p>
      <p>
        <span class="font-bold u-text-white">LNURL: </span>
        <span class="u-text-white">{{ userLnurl }}</span>
      </p>
      <p>
        <span class="font-bold u-text-white">Tipping page: </span>
        <span class="u-text-white"><a :href="userTippingPage">{{ userTippingPage }}</a></span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { bech32 } from 'bech32';
import { Addresses } from '../types/addresses';

definePageMeta({
  middleware: 'auth'
});

const client = useSupabaseClient();
const user = useSupabaseUser();
const loading = ref(null);
const newAddress = ref('');
const newUrl = ref('');
const userLnurl = ref('');
const userTippingPage = ref('');

watch(newAddress, () => {
  const encoder = new TextEncoder();
  const words = bech32.toWords(encoder.encode(`https://sats4.me/.well-known/lnurl/${newAddress.value.split('@')[0]}`));
  userLnurl.value = bech32.encode('lnurl', words, 512);
  userTippingPage.value = `https://sats4.me/${newAddress.value.split('@')[0]}`;
});

const { data: addressData } = await useAsyncData('addressData', async () => {
  // eslint-disable-next-line prefer-const
  let { data, error } = await client.from<Addresses>('LightningAddresses').select('address, userOnionUrl').eq('user_id', user.value.id);

  if (!data || !data[0] || !data[0].userOnionUrl || error) {
    await client.from<Addresses>('LightningAddresses').insert({
      user_id: user.value.id,
      userOnionUrl: '',
      address: ''
    });
    data = (await client.from<Addresses>('LightningAddresses').select('address, userOnionUrl').eq('user_id', user.value.id)).data;
  }
  newUrl.value = data[0].userOnionUrl;
  newAddress.value = data[0].address + '@sats4.me';
  const encoder = new TextEncoder();
  const words = bech32.toWords(encoder.encode(`https://sats4.me/.well-known/lnurl/${newAddress.value.split('@')[0]}`));
  userLnurl.value = bech32.encode('lnurl', words, 512);
  userTippingPage.value = `https://sats4.me/${newAddress.value.split('@')[0]}`;
  return data;
});

async function saveData () {
  loading.value = true;
  if (newUrl.value.trim().length === 0) {
    newUrl.value = addressData.value.userOnionUrl;
    if (newUrl.value.trim().length === 0) {
      alert('Please enter your LnMe onion URL');
      loading.value = false;
      return;
    }
  }

  const { data } = await client.from<Addresses>('LightningAddresses').select('address').eq('address', newAddress.value);

  if (data && data.length > 0) {
    alert('This address is already in use');
    loading.value = false;
    return;
  }

  const { error } = await client.from<Addresses>('LightningAddresses').update({
    userOnionUrl: newUrl.value,
    address: newAddress.value.split('@')[0]
  }).match({ user_id: user.value.id });
  if (error) {
    const { error } = await client.from<Addresses>('LightningAddresses').insert({
      user_id: user.value.id,
      userOnionUrl: '',
      address: newAddress.value.split('@')[0]
    });
    // eslint-disable-next-line no-console
    console.error(error);
  }
  newAddress.value = newAddress.value.split('@')[0] + '@sats4.me';
  const encoder = new TextEncoder();
  const words = bech32.toWords(encoder.encode(`https://sats4.me/.well-known/lnurl/${newAddress.value.split('@')[0]}`));
  userLnurl.value = bech32.encode('lnurl', words, 512);
  userTippingPage.value = `https://sats4.me/${newAddress.value.split('@')[0]}`;
  loading.value = false;
}
</script>
