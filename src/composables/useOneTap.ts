import { ref } from 'vue'

type OneTapResp = { credential: string; select_by: string }
type InitOpts = {
  clientId: string
  onCredential: (credential: string, selectBy: string) => Promise<void> | void
  autoSelect?: boolean
  context?: 'signin' | 'signup' | 'use'
  uxMode?: 'popup' | 'redirect'
  loginUri?: string
  nonce?: string
  cancelOnUnmount?: boolean
}
type BtnOpts = Partial<{
  type: 'standard' | 'icon'
  theme: 'outline' | 'filled_blue' | 'filled_black'
  size: 'small' | 'medium' | 'large'
  shape: 'rectangular' | 'pill' | 'circle' | 'square'
  text: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  logo_alignment: 'left' | 'center'
  width: number
}>

type PromptMomentNotification = {
  isNotDisplayed: () => boolean
  isSkippedMoment: () => boolean
  isDismissedMoment?: () => boolean
  getMomentType?: () => string
  getReason?: () => string
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize?: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by: string }) => void;
            auto_select?: boolean;
            context?: 'signin' | 'signup' | 'use';
            ux_mode?: 'popup' | 'redirect';
            nonce?: string;
            login_uri?: string;
          }) => void
          prompt?: (callback?: (notification: PromptMomentNotification) => void) => void
          cancel?: () => void
          renderButton?: (el: HTMLElement, opts?: object) => void
        }
      }
    }
  }
}

export function useGoogleOneTap() {
  const isLoaded = ref(false)
  const isReady = ref(false)
  const isPrompting = ref(false)
  const error = ref<string | null>(null)

  const _ensureWindow = () => typeof window !== 'undefined'

  const loadScript = (): Promise<void> =>
    new Promise((resolve, reject) => {
      if (!_ensureWindow()) return reject(new Error('No window'))
      if (window.google?.accounts?.id) {
        isLoaded.value = true
        return resolve()
      }
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true
      s.defer = true
      s.onload = () => {
        isLoaded.value = true
        resolve()
      }
      s.onerror = () => reject(new Error('Failed to load GIS'))
      document.head.appendChild(s)
    })

  async function initialize(opts: InitOpts) {
    error.value = null
    if (!_ensureWindow()) {
      error.value = 'SSR context'
      return
    }
    await loadScript()
    const conf: {
      client_id: string;
      callback: (r: OneTapResp) => void | Promise<void>;
      auto_select?: boolean;
      context?: 'signin' | 'signup' | 'use';
      ux_mode?: 'popup' | 'redirect';
      nonce?: string;
      login_uri?: string;
    } = {
      client_id: opts.clientId,
      callback: async (r: OneTapResp) => {
        try {
          await opts.onCredential(r.credential, r.select_by)
        } catch (e: unknown) {
          if (e instanceof Error) {
            error.value = e.message;
          } else {
            error.value = 'onCredential failed';
          }
        }
      },
      auto_select: opts.autoSelect ?? false,
      context: opts.context ?? 'signin',
      ux_mode: opts.uxMode ?? 'popup',
      nonce: opts.nonce,
      login_uri: opts.loginUri
    }
    if (window?.google?.accounts?.id?.initialize) {
      window.google.accounts.id.initialize(conf)
      isReady.value = true
    } else {
      error.value = 'Google One Tap initialize is not available'
      return
    }
  }

  function prompt() {
    if (!isReady.value) return
    isPrompting.value = true
    if (window?.google?.accounts?.id?.prompt) {
      window.google.accounts.id.prompt((n: PromptMomentNotification) => {
        // n: PromptMomentNotification
        const dismissed =
          n.isNotDisplayed() || n.isSkippedMoment() || n.isDismissedMoment?.()
        if (dismissed) isPrompting.value = false
      })
    }
  }

  function cancel() {
    try {
      if (window.google?.accounts?.id?.cancel) {
        window.google.accounts.id.cancel();
      }
    } finally {
      isPrompting.value = false;
    }
  }

  function renderButton(el: HTMLElement, opts?: BtnOpts) {
    if (!isReady.value) return
    if (
      typeof window !== 'undefined' &&
      window.google &&
      window.google.accounts &&
      window.google.accounts.id &&
      typeof window.google.accounts.id.renderButton === 'function'
    ) {
      window.google.accounts.id.renderButton(el, {
        type: 'standard',
        theme: 'filled_blue',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        logo_alignment: 'left',
        ...opts
      })
    }
  }

  return { isLoaded, isReady, isPrompting, error, loadScript, initialize, prompt, cancel, renderButton }
}
