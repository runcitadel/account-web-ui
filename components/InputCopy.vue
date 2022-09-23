<template>
    <div class="relative w-72 max-w-full mt-3">
      <div
        class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-300 hover:text-gray-400 rounded py-1 text-sm font-mono cursor-pointer z-50"
        @click="copyText();"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </div>
      <input
      ref="copyInputField"
        style="backdrop-filter: blur(4px)"
        :value="value"
        class="appearance-none rounded-lg w-full py-3 px-3 leading-tight focus:outline-none bg-white/30 disabled:text-gray-700 pr-16 font-mono bg-clip-padding bg-opacity-60 focus:bg-opacity-70 border-2 border-gray-200 border-dashed"
        type="text"
        readonly
      />
    </div>
  </template>
  
  <script lang="ts" setup>
  const props = defineProps({
    value: {
      type: String,
      required: true,
    },
  });
  const copyInputField = ref<HTMLInputElement | null>(null);
  async function copyText() {
    //copy generated invoice's text to clipboard
    const copyText = copyInputField.value as HTMLInputElement;
    // There is no need to select the text with the clipboard API, but we'll leave it
    // As visual feedback
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */
    try {
      await navigator.clipboard.writeText(props.value);
    } catch {
      document.execCommand('copy');
    }
    window.setTimeout(() => {
      copyText.blur();
      window.getSelection()?.removeAllRanges();
    }, 1000);
  }
  </script>