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
import type { KeyENTPersonProfilsInfo } from './types/KeyENTPersonProfilsInfoType.ts'
import type { Link } from './types/linkType.ts'
import type { Widget, WidgetItem } from './types/widgetType.ts'
import { getDocumentsPublisher } from './services/documentsPublisherService.ts'
import { getEsidocItems, getEsidocSubtitle } from './services/esidocService.ts'
import { getFavorisMediacentre } from './services/favorisMediacentreService.ts'
import { getFavorisPortail } from './services/favorisPortailService.ts'
import portletFromApiService from './services/portletFromApiService.ts'
import { getRegistry, getRegistryPortletsArray } from './services/registryService.ts'
import { WidgetKeyEnum } from './WidgetKeyEnum.ts'
import 'regenerator-runtime/runtime.js'

class WidgetAdapter {
  config: Config

  constructor(config: Config) {
    this.config = config
    this.fetchRegistry()
  }

  async fetchRegistry(): Promise<void> {
    await getRegistry(this.config)
    document.dispatchEvent(new CustomEvent('init-widget'))
  }

  getKeys(): string[] {
    return Object.values(WidgetKeyEnum) as string[]
  }

  async getKeysENTPersonProfils(ENTPersonProfils: Array<string>): Promise<KeyENTPersonProfilsInfo> {
    ENTPersonProfils = ENTPersonProfils.map(x => x.toLocaleLowerCase())

    const url = this.config.global.populationsKeysUri
    try {
      const response = await fetch(url)

      if (!response.ok)
        throw new Error(`Response status: ${response.status}`)

      const json: Array<KeyENTPersonProfilsInfo> = await response.json()
      const keysForAllProfilesOfCurrentUser: Array<KeyENTPersonProfilsInfo> = json
        .filter(x => x.ENTPersonProfils.some(r => ENTPersonProfils.includes(r.toLocaleLowerCase())))

      let allowedKeys: Array<string> = []
      let requiredKeys: Array<string> = []
      let defaultKeys: Array<string> = []

      const userAllowedFnameOnCurrentUai: Array<string> = [WidgetKeyEnum.FAVORIS_PORTAIL]

      getRegistryPortletsArray().forEach((value) => {
        userAllowedFnameOnCurrentUai.push(value.fname)
      })

      keysForAllProfilesOfCurrentUser.forEach((value: KeyENTPersonProfilsInfo) => {
        allowedKeys = allowedKeys.concat(value.allowedKeys)
        requiredKeys = requiredKeys.concat(value.requiredKeys)
        defaultKeys = defaultKeys.concat(value.defaultKeys)
      })

      // filter all keys
      allowedKeys = allowedKeys.filter(x => userAllowedFnameOnCurrentUai.includes(x))
      requiredKeys = requiredKeys.filter(x => userAllowedFnameOnCurrentUai.includes(x))
      defaultKeys = defaultKeys.filter(x => userAllowedFnameOnCurrentUai.includes(x))

      return {
        ENTPersonProfils,
        allowedKeys: [...new Set(allowedKeys)],
        requiredKeys: [...new Set(requiredKeys)],
        defaultKeys: [...new Set(defaultKeys)],
      }
    }
    catch (error: any) {
      console.error(error.message)
      throw error
    }
  }

  async getJsonForWidget(key: string, soffit: string): Promise<Widget & { eventDNMA: any, eventpayloadDNMA: any }> {
    const items = await this.getItems(key, soffit)
    const { name, link } = await this.getInfo(key)
    const subtitle = await this.getSubtitle(key, soffit)
    const emptyText = this.getTextEmpty(key)
    const dnma = this.getDNMA(key)
    const emptyDiscover = this.getEmptyDiscorver(key)
    const widgetData: Widget & { eventDNMA: any, eventpayloadDNMA: any } = {
      uid: key,
      name,
      subtitle,
      link,
      emptyText,
      emptyDiscover,
      items,
      eventDNMA: dnma.eventDNMA,
      eventpayloadDNMA: dnma.eventpayloadDNMA,
    }

    return widgetData
  }

  getEmptyDiscorver(key: string): boolean {
    switch (key) {
      default:
        return false
    }
  }

  async getSubtitle(key: string, soffit: string): Promise<string> {
    switch (key) {
      case WidgetKeyEnum.ESIDOC_PRETS:
        return await getEsidocSubtitle(soffit)
      default :
        return ''
    }
  }

  getDNMA(key: string): { eventDNMA: string, eventpayloadDNMA: string } {
    switch (key) {
      case WidgetKeyEnum.FAVORIS_PORTAIL:
        return {
          eventDNMA: '',
          eventpayloadDNMA: '',
        }
      default:
        return {
          eventDNMA: 'click-portlet-card',
          eventpayloadDNMA: JSON.stringify({ fname: key }),
        }
    }
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

  getTextEmpty(key: string): string {
    switch (key) {
      case WidgetKeyEnum.FAVORIS_PORTAIL:
        return 'aucun favori'
      case WidgetKeyEnum.DOCUMENTS_PUBLISHER:
        return 'aucun document'
      case WidgetKeyEnum.FAVORIS_MEDIACENTRE:
        return 'aucune ressource favorite'
      default:
        return key
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
        return await getFavorisPortail()
      case WidgetKeyEnum.ESIDOC_PRETS:
        return await getEsidocItems(soffit)
      default:
        return []
    }
  }

  getVersion(): string {
    return APP_VERSION
  }
}

(async function init(): Promise<void> {
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

    const config: Config = await response.json()
    window.WidgetAdapter = new WidgetAdapter(config)
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
