import { createI18n, type I18n } from 'vue-i18n'

import enAccount from '../locales/en/account.json'
import enAuth from '../locales/en/auth.json'
import enBuy from '../locales/en/buy.json'
import enCampaigns from '../locales/en/campaign.json'
import enCommon from '../locales/en/common.json'
import enContacts from '../locales/en/contact.json'
import enEnrollment from '../locales/en/enrollment.json'
import enHome from '../locales/en/home.json'
import enReports from '../locales/en/report.json'
import enSend from '../locales/en/send.json'
import enSettings from '../locales/en/settings.json'
import enTerms from '../locales/en/terms.json'
import esAccount from '../locales/es/account.json'
import esAuth from '../locales/es/auth.json'
import esBuy from '../locales/es/buy.json'
import esCampaigns from '../locales/es/campaign.json'
import esCommon from '../locales/es/common.json'
import esContacts from '../locales/es/contact.json'
import esEnrollment from '../locales/es/enrollment.json'
import esHome from '../locales/es/home.json'
import esReports from '../locales/es/report.json'
import esSend from '../locales/es/send.json'
import esSettings from '../locales/es/settings.json'
import esTerms from '../locales/es/terms.json'

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
  terms: typeof esTerms
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
    terms: esTerms,
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
    terms: enTerms,
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
