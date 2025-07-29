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

import type { Config } from '../types/ConfigType'
import type { KeyENTPersonProfilsInfo } from '../types/KeyENTPersonProfilsInfoType'
import { getDocumentsPublisher } from '../services/documentsPublisherService'
import { getEsidocItems, getEsidocSubtitle } from '../services/esidocService'
import { getFavorisMediacentre } from '../services/favorisMediacentreService'
import { getFavorisPortail } from '../services/favorisPortailService'
import portletFromApiService from '../services/portletFromApiService'
import { getRegistry, getRegistryPortletsArray } from '../services/registryService'
import { WidgetKeyEnum } from '../WidgetKeyEnum'
import { WidgetData } from './WidgetData'

export class WidgetAdapter {
  constructor(config: Config) {
    this.config = config
    this.fetchRegistry(this.config)
  }

  config: Config

  fetchRegistry = async (config: Config) => {
    await getRegistry(config)
    document.dispatchEvent(new CustomEvent('init-widget'))
  }

  getKeys = () => {
    return Object.values(WidgetKeyEnum) as string[]
  }

  getKeysENTPersonProfils = async (ENTPersonProfils: Array<string>): Promise<KeyENTPersonProfilsInfo> => {
    ENTPersonProfils = ENTPersonProfils.map(x => x.toLocaleLowerCase())

    const url = this.config.global.populationsKeysUri
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }
      const json: Array<KeyENTPersonProfilsInfo> = await response.json()
      const keysForAllProfilesOfCurrentUser: Array<KeyENTPersonProfilsInfo> = json.filter(x => x.ENTPersonProfils.some(r => ENTPersonProfils.includes(r.toLocaleLowerCase())))

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

  getJsonForWidget = async (key: string, soffit: string) => {
    const items: string = await this.getItems(key, soffit)
    const portletData: { name: string, link: string, target: string, rel: string } = await this.getLink(key)
    const subtitle = await this.getSubtitle(key, soffit)
    const textEmpty: string = this.getTextEmpty(key)
    const dnma: { eventDNMA: string, eventpayloadDNMA: string } = this.getDNMA(key)
    const emptyDiscover = this.getEmptyDiscorver(key)
    const widgetData: WidgetData = new WidgetData(portletData.name, subtitle, portletData.link, textEmpty, emptyDiscover, items, portletData.target, portletData.rel, dnma.eventDNMA, dnma.eventpayloadDNMA)
    return JSON.stringify(widgetData)
  }

  getEmptyDiscorver = function (key: string): boolean {
    switch (key) {
      default:
        return false
    }
  }

  getSubtitle = async function (key: string, soffit: string) {
    switch (key) {
      case WidgetKeyEnum.ESIDOC_PRETS:
        return await getEsidocSubtitle(soffit)
      default :
        return ''
    }
  }

  getDNMA = function (key: string): { eventDNMA: string, eventpayloadDNMA: string } {
    switch (key) {
      case WidgetKeyEnum.FAVORIS_PORTAIL:
        return { eventDNMA: '', eventpayloadDNMA: '' }
      default:
        return { eventDNMA: 'click-portlet-card', eventpayloadDNMA: JSON.stringify({ fname: key }) }
    }
  }

  getAllNames = async () => {
    const names: Array<{ name: string, key: string }> = []
    for (let index = 0; index < Object.values(WidgetKeyEnum).length; index++) {
      const element = Object.values(WidgetKeyEnum)[index]
      const portletData: { name: string, link: string, target: string, rel: string } = await this.getLink(element)
      names.push({ name: portletData.name, key: element })
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

  async getLink(key: string): Promise<{ name: string, link: string, target: string, rel: string }> {
    if (key === WidgetKeyEnum.FAVORIS_PORTAIL) {
      return { name: 'Favoris', link: '', rel: '', target: '' }
    }
    const url = this.config.global.portletInfoUri.replace('{fname}', key)
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }
      const json = await response.json()
      return { name: json.portlet.title ?? key, link: portletFromApiService.getUrl(json.portlet), target: portletFromApiService.getTarget(json.portlet), rel: portletFromApiService.getRel(json.portlet) }
    }
    catch (error: any) {
      console.error(error.message)
      return { name: key, link: '', rel: '', target: '' }
    }
  }

  getItems = (key: string, soffit: string) => {
    switch (key) {
      case WidgetKeyEnum.DOCUMENTS_PUBLISHER:
        return getDocumentsPublisher(soffit)
      case WidgetKeyEnum.FAVORIS_MEDIACENTRE:
        return getFavorisMediacentre(soffit)
      case WidgetKeyEnum.FAVORIS_PORTAIL:
        return getFavorisPortail()
      case WidgetKeyEnum.ESIDOC_PRETS:
        return getEsidocItems(soffit)
      default:
        return ''
    }
  }

  getVersion = () => {
    return APP_VERSION
  }
}
