import type { Config } from './src/types/ConfigType'
import { WidgetAdapter } from './src/classes/WidgetAdapter'
import 'regenerator-runtime/runtime.js'

async function init() {
  const url: string | null = new URL(import.meta.url).searchParams.get('configUri')
  const response = await fetch(url!)
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`)
  }
  const config: Config = await response.json()
  window.WidgetAdapter = new WidgetAdapter(config)
  document.dispatchEvent(new CustomEvent('init-widget'))
}

init()

declare global {
  interface Window {
    WidgetAdapter: WidgetAdapter
  }
}
