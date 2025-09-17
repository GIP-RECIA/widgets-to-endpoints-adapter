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

import type { WidgetAdapter } from '../classes/WidgetAdapter.ts'
import type { Item } from '../types/Item'
import portletFromApiService from './portletFromApiService.ts'
import { getRegistryPortletsArray } from './registryService.ts'
import fetchFavorites from './utils/fetchFavorites.ts'
import byFavoriteOrder from './utils/sortByFavoriteOrder.ts'

declare global {
  interface Window {
    WidgetAdapter: WidgetAdapter
  }
}

async function getFavorisPortail(): Promise<string> {
  const favoritesTree = await fetchFavorites()
  const favorites = flattenFavorites(favoritesTree).map(f => f.fname)
  // registry portlet is fetched by the adapter before is it ready so the array is populated at this point
  const portlets = getRegistryPortletsArray()
  const favoritesSortedAndFiltered = portlets
    .filter(portlet => favorites.includes(portlet.fname))
    .sort(byFavoriteOrder(favorites))

  const ItemArray: Array<Item> = []

  favoritesSortedAndFiltered.forEach((value: any, _index: number) => {
    const favoriteAsItem: Item = {
      name: value.title,
      link: getUrl(value),
      icon: value.parameters.iconUrl ? value.parameters.iconUrl.value : '',
      target: getTarget(value),
      rel: getRel(value),
      event: '',
      eventpayload: '',
      eventDNMA: 'click-portlet-card',
      eventpayloadDNMA: JSON.stringify({ fname: value.fname }),
      id: value.fname,
    }
    ItemArray.push(favoriteAsItem)
  })
  return JSON.stringify(ItemArray)
}

function flattenFavorites(elem: any): Array<any> {
  if (Array.isArray(elem))
    return elem.flatMap(flattenFavorites)

  if (elem.content)
    return flattenFavorites(elem.content)

  if (elem.fname)
    return [elem]

  return []
}

function getUrl(portlet: any): string {
  return portlet?.parameters?.alternativeMaximizedLink?.value
    ? portlet.parameters.alternativeMaximizedLink.value
    : `${getConfig().global.context}/p/${portlet.fname}`
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
