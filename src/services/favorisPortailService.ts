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

async function getFavorisPortail(): Promise<Array<Item>> {
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
    const favoriteAsItem: Item = new Item(value.title, `/portail/p/${value.fname}`, value.parameters.iconUrl.value)
    ItemArray.push(favoriteAsItem)
  }

  portletsFromJson.forEach(populateItemArray)
  return ItemArray
}

async function getFavorites() {
  return await instance.get(urlSwagger)
}

export {
  getFavorisPortail,
}
