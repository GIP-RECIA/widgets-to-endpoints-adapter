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

import type { AxiosResponse } from 'axios'
import type { KeyValuePair } from '../types/KeyValuePair'
import { CustomError } from '../classes/CustomError'
import { Item } from '../classes/Item'
import { instance } from '../utils/axiosUtils'

const url: string = import.meta.env.VITE_MEDIACENTRE_API_FAVORITES_URI
const regExpArray: Array<RegExp> = []
let groupArrayRaw: Array<string> = []
const groupArrayFiltered: Array<string> = []

async function getFavorisMediacentre(soffit: string): Promise<string> {
  const itemArrayResponse: Array<Item> = []

  const linkPattern: string = import.meta.env.VITE_REDIRECT_PATTERN

  await getGroups(import.meta.env.VITE_MEDIACENTRE_USER_RIGHTS_API_URI, soffit)

  await getConfig(import.meta.env.VITE_MEDIACENTRE_API_CONFIG_URI, soffit)

  for (const group of groupArrayRaw) {
    for (const regex of regExpArray) {
      if (regex.test(group)) {
        groupArrayFiltered.push(group)
      }
    }
  }

  const favorites: Array<string> = await getFavoritesFromPortal(import.meta.env.VITE_GET_USER_FAVORITE_RESOURCES_API_URI, import.meta.env.VITE_MEDIACENTRE_FNAME)

  if (favorites === undefined || favorites.length === 0) {
    return JSON.stringify(itemArrayResponse)
  }

  const response: AxiosResponse<any, any> = await getFavorites(favorites, soffit)

  if (Array.isArray(response.data)) {
    for (let index = 0; index < response.data.length; index++) {
      const element = response.data[index]

      try {
        const ressourceLightAsItem: Item = new Item(element.nomRessource, linkPattern.replace('{fname}', element.idRessource).replace('{name}', element.nomRessource), undefined)
        itemArrayResponse.push(ressourceLightAsItem)
      }
      catch (error) {
        console.error(`missing field in payload: ${error}`)
      }
    }
  }
  return JSON.stringify(itemArrayResponse)
}

async function getFavorites(favorites: Array<string>, soffit: string) {
  return await instance.post(url, { isMemberOf: groupArrayFiltered, favorites }, { headers: { Authorization: `Bearer ${soffit}` } })
}

async function getFavoritesFromPortal(getUserFavoriteResourcesUrl: string, fnameMediacentreUi: string) {
  try {
    const response = await instance.get(`${getUserFavoriteResourcesUrl}${fnameMediacentreUi}`)
    const data = response.data
    if (Object.keys(data).length === 0) {
      return new Array<string>()
    }
    return response.data.mediacentreFavorites
  }
  catch (e: any) {
    throw new CustomError(e.response.data.message, e.response.status)
  }
}

async function getConfig(configApiUrl: string, soffit: string) {
  try {
    const response = await instance.post(configApiUrl, { uais: [] }, { headers: { Authorization: `Bearer ${soffit}` } })
    const groups: Map<string, KeyValuePair<string>> = response.data.configListMap.groups
    groups.forEach((value, _key, _map) => {
      regExpArray.push(new RegExp(value.value))
    })
  }
  catch (e: any) {
    if (e.response) {
      throw new CustomError(e.response.data.message, e.response.status)
    }
    else if (e.code === 'ECONNABORTED') {
      throw new CustomError(e.message, e.code)
    }
  }
}

async function getGroups(groupsApiUrl: string, soffit: string) {
  try {
    const response = await instance.get(groupsApiUrl, { headers: { Authorization: `Bearer ${soffit}` } })
    const groups: Array<string> = response.data.groups.map(x => x.name)
    groupArrayRaw = groups
  }
  catch (e: any) {
    if (e.response) {
      throw new CustomError(e.response.data.message, e.response.status)
    }
    else if (e.code === 'ECONNABORTED') {
      throw new CustomError(e.message, e.code)
    }
    else {
      throw new Error(e.response)
    }
  }
}

export {
  getFavorisMediacentre,
}
