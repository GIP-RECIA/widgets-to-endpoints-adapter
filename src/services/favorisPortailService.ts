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

import { Item } from '../classes/Item'
import { instance } from '../utils/axiosUtils'

const urlSwagger: string = import.meta.env.VITE_PORTAL_FAVORITES_URI

async function getFavorisPortail(): Promise<string> {
  const response = await getFavorites()
  const portletsFromJson: Map<string, object> = new Map()
  for (let categoryIndex = 0; categoryIndex < response.data.registry.categories.length; categoryIndex++) {
    const category = response.data.registry.categories[categoryIndex]
    for (let subcategoryIndex = 0; subcategoryIndex < category.subcategories.length; subcategoryIndex++) {
      const subcategory = category.subcategories[subcategoryIndex]
      for (let portletIndex = 0; portletIndex < subcategory.portlets.length; portletIndex++) {
        const portlet = subcategory.portlets[portletIndex]
        portletsFromJson.set(portlet.fname, portlet)
      }
    }
  }

  const ItemArray: Array<Item> = []

  function populateItemArray(value, _key, _map) {
    const favoriteAsItem: Item = new Item(value.title, getUrl(value), import.meta.env.VITE_PORTAL_ICON_TAG.replace('{icon}', value.parameters.iconUrl.value), getTarget(value), getRel(value))
    ItemArray.push(favoriteAsItem)
  }

  portletsFromJson.forEach(populateItemArray)
  return JSON.stringify(ItemArray)
}

async function getFavorites() {
  return await instance.get(urlSwagger)
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

export {
  getFavorisPortail,
}
