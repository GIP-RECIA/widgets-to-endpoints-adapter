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
import type { Link } from './types/linkType.ts'
import type { PortletFromRegistry } from './types/registryTypes.ts'
import type { Widget, WidgetItem, WidgetsWrapperConfig } from './types/widgetType.ts'
import { version } from '../package.json'
import { ConfigService } from './services/configService.ts'
import { getDocumentsPublisher } from './services/documentsPublisherService.ts'
import { getEsidocItems, getEsidocSubtitle } from './services/esidocService.ts'
import { getFavorisMediacentre } from './services/favorisMediacentreService.ts'
import { getFavorisPortail } from './services/favorisPortailService.ts'
import portletFromApiService from './services/portletFromApiService.ts'
import PortletService from './services/portletService.ts'
import { WidgetKeyEnum } from './WidgetKeyEnum.ts'
import 'regenerator-runtime/runtime.js'

class WidgetAdapter {
  config: Config

  services: Array<PortletFromRegistry> | undefined

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

  async getKeysENTPersonProfils(
    ENTPersonProfils: Array<string>,
  ): Promise<WidgetsWrapperConfig> {
    return await ConfigService.getWidgetsWrapperConfig(
      this.config.global.populationsKeysUri,
      ENTPersonProfils.map(profil => profil.toLocaleLowerCase()),
      [
        WidgetKeyEnum.FAVORIS_PORTAIL,
        ...(this.services?.map(s => s.fname) ?? []),
      ],
    )
  }

  async getJsonForWidget(key: string, soffit: string): Promise<Widget> {
    const items = await this.getItems(key, soffit)
    const { name, link } = await this.getInfo(key)
    const subtitle = await this.getSubtitle(key, soffit)
    const widgetData: Widget = {
      uid: key,
      name,
      subtitle,
      link,
      items,
    }

    return widgetData
  }

  async getAllNames(ENTPersonProfils: Array<string>): Promise<Array<{ name: string, key: string }>> {
    const names: Array<{ name: string, key: string }> = []
    const keys = await this.getKeysENTPersonProfils(ENTPersonProfils)
    for (const allowedKey of keys.allowedKeys) {
      const { name } = await this.getInfo(allowedKey)
      names.push({
        name,
        key: allowedKey,
      })
    }
    return names
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

  async getInfo(key: string): Promise<{ name: string, link?: Link }> {
    if (key === WidgetKeyEnum.FAVORIS_PORTAIL) {
      return {
        name: 'Favoris',
      }
    }

    try {
      const response = await fetch(this.config.global.portletInfoUri.replace('{fname}', key))

      if (!response.ok)
        throw new Error(`Response status: ${response.status}`)

      const json = await response.json()

      return {
        name: json.portlet.title ?? key,
        link: {
          href: portletFromApiService.getUrl(json.portlet),
          target: portletFromApiService.getTarget(json.portlet),
          rel: portletFromApiService.getRel(json.portlet),
        },
      }
    }
    catch (error: any) {
      console.error(error.message)
      return {
        name: key,
      }
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
