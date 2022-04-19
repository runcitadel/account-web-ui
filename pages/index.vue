<template>
  <div class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <h2 class="my-6 text-center text-3xl font-extrabold u-text-white">
      Sign in to your account
    </h2>
    <LoginCard>
      <UButton
        class="mt-3"
        icon="mdi:discord"
        block
        label="Discord"
        variant="black"
        @click="auth.signIn({ provider: 'discord' })"
      />
      <UButton
        class="mt-3"
        icon="mdi:github"
        block
        label="Github"
        variant="black"
        @click="auth.signIn({ provider: 'github' })"
      />
      <UButton
        class="mt-3"
        icon="mdi:twitter"
        block
        label="Twitter"
        variant="black"
        @click="auth.signIn({ provider: 'twitter' })"
      />
      <!--<UButton
        class="mt-3"
        icon="eva:email-outline"
        block
        label="Email"
        variant="black"
        @click="auth.signIn({ provider: 'twitter' })"
      />-->
      <UButton
        class="mt-3"
        icon="bi:lightning-charge-fill"
        block
        label="Lightning (WebLN)"
        variant="yellow"
        @click="webLnLogin()"
      />
    </LoginCard>
  </div>
</template>

<script setup lang="ts">
import { requestProvider } from 'webln';

const user = useSupabaseUser();
const { auth } = useSupabaseClient();

watchEffect(() => {
  if (user.value) {
    navigateTo('/addresses');
  }
});

async function webLnLogin () {
  if (!process.client) { return; }
  try {
    const webln = await requestProvider();
    await webln.enable();
    // Get message to sign from supabase-ln.runcitadel.space
    const data = await fetch('https://supabase-ln.runcitadel.space/message');
    const signed = await webln.signMessage((await data.json()).msg);
    const finalData = await fetch('https://supabase-ln.runcitadel.space/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        signature: signed.signature
      })
    });
    const finalResult = await finalData.json();
    window.location.href = finalResult.link;
  } catch (error) {
    alert('Login failed!');
    throw error;
  }
}
</script>
