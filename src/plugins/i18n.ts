import { createI18n, type I18n } from 'vue-i18n'

import enAccount from '../locales/en/account.json'
import enAuth from '../locales/en/auth.json'
import enBuy from '../locales/en/buy.json'
import enCampaigns from '../locales/en/campaigns.json'
import enCommon from '../locales/en/common.json'
import enContacts from '../locales/en/contacts.json'
import enEnrollment from '../locales/en/enrollment.json'
import enHome from '../locales/en/home.json'
import enReports from '../locales/en/reports.json'
import enSend from '../locales/en/send.json'
import enSettings from '../locales/en/settings.json'
import esAccount from '../locales/es/account.json'
import esAuth from '../locales/es/auth.json'
import esBuy from '../locales/es/buy.json'
import esCampaigns from '../locales/es/campaigns.json'
import esCommon from '../locales/es/common.json'
import esContacts from '../locales/es/contacts.json'
import esEnrollment from '../locales/es/enrollment.json'
import esHome from '../locales/es/home.json'
import esReports from '../locales/es/reports.json'
import esSend from '../locales/es/send.json'
import esSettings from '../locales/es/settings.json'

export type MessageSchema = {
  account: typeof esAccount
  auth: typeof esAuth
  buy: typeof esBuy
  campaign: typeof esCampaigns
  common: typeof esCommon
  contact: typeof esContacts
  enrollment: typeof esEnrollment
  home: typeof esHome
  reports: typeof esReports
  send: typeof esSend
  settings: typeof esSettings
}

const messages: Record<'es' | 'en', MessageSchema> = {
  es: {
    account: esAccount,
    auth: esAuth,
    buy: esBuy,
    campaign: esCampaigns,
    common: esCommon,
    contact: esContacts,
    enrollment: esEnrollment,
    home: esHome,
    reports: esReports,
    send: esSend,
    settings: esSettings,
  },
  en: {
    account: enAccount,
    auth: enAuth,
    buy: enBuy,
    campaign: enCampaigns,
    common: enCommon,
    contact: enContacts,
    enrollment: enEnrollment,
    home: enHome,
    reports: enReports,
    send: enSend,
    settings: enSettings,
  },
}

const savedLang = (localStorage.getItem('lang') as 'es' | 'en') || 'es'

export function setI18nLanguage(i18n: I18n, locale: keyof typeof messages) {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    (i18n.global.locale as unknown as { value: string }).value = locale
  }
  document.documentElement.lang = locale
}

export const instanceI18n = createI18n<[MessageSchema], 'es' | 'en'>({
  legacy: false,
  locale: savedLang,
  fallbackLocale: 'en',
  globalInjection: true,
  messages,
})
