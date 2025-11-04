import type { Component } from 'vue'

export interface IRoute {
  icon: Component
  title: string
  path: string
  children?: { title: string; path: string; icon?: Component }[]
}
