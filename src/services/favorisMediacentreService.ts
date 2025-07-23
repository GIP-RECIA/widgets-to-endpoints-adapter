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
import type { Item } from '../types/Item'
import type { KeyValuePair } from '../types/KeyValuePair'
// eslint-disable-next-line unicorn/prefer-node-protocol
import { Buffer } from 'buffer'

declare global {
  interface Window {
    WidgetAdapter: WidgetAdapter
  }
}

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

  const response = await getFavorites(favorites, soffit)

  if (Array.isArray(response)) {
    for (let index = 0; index < response.length; index++) {
      const element = response[index]

      try {
        const displayName: string = element.nomRessource
        const regex = /[^A-Z1-9]+/i
        const hasSpecialChar: boolean = displayName.match(regex) != null
        const displayNameForRedirection: string = hasSpecialChar ? Buffer.from(displayName).toString('base64') : displayName

        const ressourceLightAsItem: Item = {
          name: element.nomRessource,
          link: linkPattern.replace('{fname}', element.idRessource).replace('{name}', displayNameForRedirection).replace('{b64}', hasSpecialChar.toString()),
          icon: '',
          target: '_blank',
          rel: 'noopener noreferrer',
          event: '',
          eventpayload: '',
          eventDNMA: '',
          eventpayloadDNMA: '',
        }
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
  try {
    const timeout = window.WidgetAdapter.timeout
    const response = await fetch(url, {
      method: 'POST',
      signal: AbortSignal.timeout(timeout),
      headers:
      { 'Authorization': `Bearer ${soffit}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ isMemberOf: groupArrayFiltered, favorites }),
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

async function getFavoritesFromPortal(getUserFavoriteResourcesUrl: string, fnameMediacentreUi: string) {
  try {
    const timeout = window.WidgetAdapter.timeout
    const response = await fetch(`${getUserFavoriteResourcesUrl}${fnameMediacentreUi}`, {
      method: 'GET',
      signal: AbortSignal.timeout(timeout),
    })
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }
    const json = await response.json()
    return json.mediacentreFavorites
  }
  catch (error) {
    console.error(error)
    throw error
  }
}

async function getConfig(configApiUrl: string, soffit: string) {
  try {
    const timeout = window.WidgetAdapter.timeout
    const response = await fetch(configApiUrl, {
      method: 'POST',
      signal: AbortSignal.timeout(timeout),
      headers:
      { 'Authorization': `Bearer ${soffit}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uais: [] }),
    })
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }
    const json = await response.json()
    const groups: Map<string, KeyValuePair<string>> = json.configListMap.groups
    groups.forEach((value, _key, _map) => {
      regExpArray.push(new RegExp(value.value))
    })
  }
  catch (error) {
    console.error(error)
    throw error
  }
}

async function getGroups(groupsApiUrl: string, soffit: string) {
  try {
    const timeout = window.WidgetAdapter.timeout
    const response = await fetch(groupsApiUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(timeout),
      headers: { Authorization: `Bearer ${soffit}` },
    })
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }
    const json = await response.json()
    const groups: Array<string> = json.groups.map(x => x.name)
    groupArrayRaw = groups
  }
  catch (error) {
    console.error(error)
    throw error
  }
}

export {
  getFavorisMediacentre,
}
