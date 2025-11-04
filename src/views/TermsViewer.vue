<template>
  <section class="legal-doc bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
    <article v-html="html" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import DOMPurify from 'dompurify'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const html = ref('')

const emit = defineEmits<{
  'scroll-to-end': []
}>()

const termsFile = computed(() => {
  const lang = locale.value === 'es' ? 'es' : 'en'
  return `/legal/terms/v1/index.${lang}.html`
})

let scrollContainer: HTMLElement | null = null

const handleScroll = () => {
  if (!scrollContainer) return

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer
  const scrollPercent = (scrollTop + clientHeight) / scrollHeight

  // Si el usuario ha hecho scroll al 95% del documento, consideramos que llegó al final
  if (scrollPercent >= 0.95) {
    emit('scroll-to-end')
    // Removemos el listener una vez que se detecta el scroll al final
    scrollContainer.removeEventListener('scroll', handleScroll)
  }
}

onMounted(async () => {
  try {
    const raw = await fetch(termsFile.value, { cache: 'no-store' }).then(r => r.text())
    html.value = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } })

    // Esperamos un tick para que el DOM se renderice
    await new Promise(resolve => setTimeout(resolve, 100))

    // Encontramos el contenedor de scroll (ScrollPanel de PrimeVue)
    scrollContainer = document.querySelector('.p-scrollpanel-content') as HTMLElement

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
    }
  } catch (error) {
    console.error('Error loading terms document:', error)
    // Fallback al español si falla cargar el archivo
    const fallback = await fetch('/legal/terms/v1/index.es.html', { cache: 'no-store' }).then(r => r.text())
    html.value = DOMPurify.sanitize(fallback, { USE_PROFILES: { html: true } })
  }
})

onUnmounted(() => {
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.legal-doc {
  max-width: 100%;
  margin: 0;
  line-height: 1.6;
  padding: 1rem;
  font-size: 0.9rem;
  border-radius: 0.5rem;
}

/* Títulos principales */
.legal-doc :deep(h1) {
  font-size: 1.4rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 700;
}

.legal-doc :deep(h2) {
  font-size: 1.2rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 700;
}

.legal-doc :deep(h3) {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 700;
}

/* Párrafos y texto normal */
.legal-doc :deep(p),
.legal-doc :deep(.MsoNormal) {
  margin: 0.75rem 0;
  text-align: justify;
}

/* Listas */
.legal-doc :deep(ol),
.legal-doc :deep(ul),
.legal-doc :deep(.MsoListParagraph) {
  margin-left: 1.2rem;
  margin-bottom: 0.75rem;
}

/* Enlaces */
.legal-doc :deep(a) {
  text-decoration: underline;
}

/* Título principal del documento */
.legal-doc :deep(.MsoTitle) {
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
}

/* Texto en negrita */
.legal-doc :deep(b),
.legal-doc :deep(strong) {
  font-weight: 600;
}

/* Mejoras de legibilidad */
.legal-doc :deep(p:first-child) {
  margin-top: 0;
}

.legal-doc :deep(p:last-child) {
  margin-bottom: 0;
}

/* Espaciado para listas de Word */
.legal-doc :deep(.MsoListParagraphCxSpFirst),
.legal-doc :deep(.MsoListParagraphCxSpMiddle),
.legal-doc :deep(.MsoListParagraphCxSpLast) {
  margin: 0.25rem 0;
  margin-left: 1.5rem;
}

/* Herencia de color para todos los elementos */
.legal-doc :deep(*) {
  color: inherit;
}

/* Colores específicos para enlaces en modo claro */
.legal-doc :deep(a) {
  color: #2563eb;
}

/* Modo oscuro - sobrescribir colores de enlaces */
.dark .legal-doc :deep(a) {
  color: #60a5fa;
}
</style>
