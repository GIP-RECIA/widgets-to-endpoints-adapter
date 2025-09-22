/**
 * Copyright (C) 2025 GIP-RECIA, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Config } from './types/ConfigType.ts'
import type { PortletFromRegistry } from './types/registryTypes.ts'
import type { Widget, WidgetItem, WidgetsWrapperConfig } from './types/widgetType.ts'
import { version } from '../package.json'
import { ConfigService } from './services/configService.ts'
import { getDocumentsPublisher } from './services/documentsPublisherService.ts'
import { getEsidocItems, getEsidocSubtitle } from './services/esidocService.ts'
import { getFavorisMediacentre } from './services/favorisMediacentreService.ts'
import { getFavorisPortail } from './services/favorisPortailService.ts'
import PortletService from './services/portletService.ts'
import { WidgetKeyEnum } from './WidgetKeyEnum.ts'
import 'regenerator-runtime/runtime.js'

class WidgetAdapter {
  config: Config

  services?: Array<PortletFromRegistry>

  widgetWrapperConfig?: WidgetsWrapperConfig

  constructor(config: Config) {
    this.config = config
    this.init()
  }

  async init(): Promise<void> {
    this.services = await PortletService.getAll(this.config.global.portletRegistryUri)
    if (this.services)
      document.dispatchEvent(new CustomEvent('init-widget'))
  }

  /////////////////////////////////////////////////////////

  getVersion(): string {
    return version
  }

  async getConfig(
    ENTPersonProfils: Array<string>,
  ): Promise<WidgetsWrapperConfig> {
    if (!this.widgetWrapperConfig) {
      this.widgetWrapperConfig = await ConfigService.getWidgetsWrapperConfig(
        this.config.global.populationsKeysUri,
        ENTPersonProfils.map(profil => profil.toLocaleLowerCase()),
        this.services,
      )
    }

    return this.widgetWrapperConfig
  }

  async getWidget(key: string, soffit: string): Promise<Widget> {
    const baseData = this.widgetWrapperConfig!.availableWidgets.find(({ uid }) => uid === key)!
    const subtitle = await this.getSubtitle(key, soffit)
    const items = await this.getItems(key, soffit)
    const widgetData: Widget = {
      ...baseData,
      subtitle,
      items,
    }

    return widgetData
  }

  /////////////////////////////////////////////////////////

  async getSubtitle(key: string, soffit: string): Promise<string> {
    switch (key) {
      case WidgetKeyEnum.ESIDOC_PRETS:
        return await getEsidocSubtitle(soffit)
      default :
        return ''
    }
  }

  async getItems(key: string, soffit: string): Promise<WidgetItem[]> {
    switch (key) {
      case WidgetKeyEnum.DOCUMENTS_PUBLISHER:
        return await getDocumentsPublisher(soffit)
      case WidgetKeyEnum.FAVORIS_MEDIACENTRE:
        return await getFavorisMediacentre(soffit)
      case WidgetKeyEnum.FAVORIS_PORTAIL:
        return await getFavorisPortail(this.services ?? [])
      case WidgetKeyEnum.ESIDOC_PRETS:
        return await getEsidocItems(soffit)
      default:
        return []
    }
  }
}

(async function (): Promise<void> {
  const url = new URL(import.meta.url).searchParams.get('configUri')
  if (!url) {
    console.error('"configUri" is not defined')
    return
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
    })

    if (!response.ok)
      throw new Error(response.statusText)

    window.WidgetAdapter = new WidgetAdapter(await response.json())
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (_: any) {
    console.error('Unable to get config')
  }
})()

declare global {
  interface Window {
    WidgetAdapter: WidgetAdapter
  }
}
