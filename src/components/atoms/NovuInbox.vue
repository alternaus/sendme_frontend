<template>
  <div ref="novuInbox"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted,ref } from "vue";

import { NovuUI } from "@novu/js/ui";

const novuInbox = ref<HTMLElement | null>(null);
let novuInstance: NovuUI | null = null;

onMounted(() => {
  if (!novuInbox.value) {
    console.error("Novu inbox container element not found");
    return;
  }

  try {
    const novu = new NovuUI({
      options: {
        applicationIdentifier: '__ChVa5aut7o',
        subscriber: '63399d01ee1316a5c8b5ff0d',
      },
    });

    novu.mountComponent({
      name: "Inbox",
      props: {},
      element: novuInbox.value,
    });

    novuInstance = novu;
  } catch (error) {
    console.error("Failed to initialize Novu inbox:", error);
  }
});

onUnmounted(() => {
  if (novuInstance && novuInbox.value) {
    try {
      novuInstance.unmountComponent(novuInbox.value);
    } catch (error) {
      console.error("Failed to unmount Novu inbox:", error);
    }
  }
});
</script>
