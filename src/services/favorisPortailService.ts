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

import type { WidgetAdapter } from '../classes/WidgetAdapter'
import type { FavorisConfig } from '../types/configSubtypes/FavorisConfigType'
import type { GlobalConfig } from '../types/configSubtypes/GlobalConfigType'
import type { Item } from '../types/Item'

declare global {
  interface Window {
    WidgetAdapter: WidgetAdapter
  }
}

async function getFavorisPortail(): Promise<string> {
  const response = await getFavorites()
  const portletsFromJson: Map<string, object> = new Map()
  for (let categoryIndex = 0; categoryIndex < response.registry.categories.length; categoryIndex++) {
    const category = response.registry.categories[categoryIndex]
    for (let subcategoryIndex = 0; subcategoryIndex < category.subcategories.length; subcategoryIndex++) {
      const subcategory = category.subcategories[subcategoryIndex]
      for (let portletIndex = 0; portletIndex < subcategory.portlets.length; portletIndex++) {
        const portlet = subcategory.portlets[portletIndex]
        portletsFromJson.set(portlet.fname, portlet)
      }
    }
  }

  const ItemArray: Array<Item> = []

  portletsFromJson.forEach((value: any, _key: string) => {
    const favoriteAsItem: Item = {
      name: value.title,
      link: getUrl(value),
      icon: getConfig().favoris.iconTag.replace('{icon}', value.parameters.iconUrl.value),
      target: getTarget(value),
      rel: getRel(value),
      event: '',
      eventpayload: '',
      eventDNMA: 'click-portlet-card',
      eventpayloadDNMA: JSON.stringify({ fname: value.fname }),
      id: key,
    }
    ItemArray.push(favoriteAsItem)
  })
  return JSON.stringify(ItemArray)
}

async function getFavorites() {
  try {
    const timeout = getConfig().global.timeout
    const response = await fetch(getConfig().favoris.favorisUri, {
      method: 'GET',
      signal: AbortSignal.timeout(timeout),
    })
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }
    const json = await response.json()
    return json
  }
  catch (error) {
    console.error(error)
    throw error
  }
}

function getUrl(portlet: any): string {
  // TODO : put '/p/' in conf
  return portlet?.parameters?.alternativeMaximizedLink?.value
    ? portlet.parameters.alternativeMaximizedLink.value
    : `/portail/p/${portlet.fname}`
}

function getTarget(portlet: any): string {
  if (getAlternativeMaximizedUrl(portlet)) {
    return getAlternativeMaximizedTarget(portlet)
  }
  return '_self'
}

function getRel(portlet: any): string {
  return hasAlternativeMaximizedUrl(portlet)
    ? 'noopener noreferrer'
    : ''
}

function hasAlternativeMaximizedUrl(portlet: any): string {
  return getAlternativeMaximizedUrl(portlet)
}

function getAlternativeMaximizedTarget(portlet: any): string {
  return portlet?.parameters?.alternativeMaximizedLinkTarget?.value ?? '_blank'
}

function getAlternativeMaximizedUrl(portlet: any): string {
  return portlet?.parameters?.alternativeMaximizedLink?.value
}

function getConfig(): { global: GlobalConfig, favoris: FavorisConfig } {
  return { global: window.WidgetAdapter.config.global, favoris: window.WidgetAdapter.config.favoris }
}

export {
  getFavorisPortail,
}
