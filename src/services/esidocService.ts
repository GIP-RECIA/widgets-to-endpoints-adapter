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

import type { Item } from '../types/Item'
import { CustomError } from '../classes/CustomError'
import { instance } from '../utils/axiosUtils'

let date: Date
let itemList: any[]
const apiUrl: string = import.meta.env.VITE_ESIDOC_API_URL

async function getEsidocSubtitle(soffit: string): Promise<string> {
  if (date === undefined) {
    await getEsidocInfo(apiUrl, soffit)
  }
  return `I18N$CacheUpdate$${date.toLocaleTimeString()}`
}

async function getEsidocItems(soffit: string): Promise<string> {
  if (itemList === undefined) {
    await getEsidocInfo(apiUrl, soffit)
  }

  const responseArray: any[] | undefined = itemList
  if (responseArray === undefined) {
    return ''
  }

  const itemArrayResponse: Item[] = []

  const buttonSearch: Item = {
    name: 'I18N$Rechercher$',
    link: '',
    icon: '<svg style="width: 20px;height: 20px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>',
    target: '_blank',
    rel: 'noopener noreferrer',
    event: 'openSearchEsidoc',
    eventpayload: '{}',
  }
  itemArrayResponse.push(buttonSearch)
  for (let index = 0; index < responseArray.length; index++) {
    const element = responseArray[index]
    try {
      const ressourceLightAsItem: Item = {
        name: element.titre,
        link: `/portail/api/ExternalURLStats?fname=ESIDOC&service=${element.permalien}`,
        icon: element.retard ? '<svg style="width: 20px;height: 20px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M128 0c17.7 0 32 14.3 32 32l0 32 128 0 0-32c0-17.7 14.3-32 32-32s32 14.3 32 32l0 32 48 0c26.5 0 48 21.5 48 48l0 48L0 160l0-48C0 85.5 21.5 64 48 64l48 0 0-32c0-17.7 14.3-32 32-32zM0 192l448 0 0 272c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 192zM305 305c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47z"/></svg>' : '',
        target: '_blank',
        rel: 'noopener noreferrer',
        event: '',
        eventpayload: '',
      }
      itemArrayResponse.push(ressourceLightAsItem)
    }
    catch (error) {
      console.error(`missing field in payload: ${error}`)
    }
  }
  return JSON.stringify(itemArrayResponse)
}

async function getEsidocInfo(esidocApiUrl: string, soffit: string) {
  try {
    const response = await instance.get(esidocApiUrl, { headers: { Authorization: `Bearer ${soffit}` } })
    const infoArray: any[] = response.data.itemForResponseList
    itemList = infoArray
    const dateFromPayload = new Date(response.data.lastUpdateInstant)
    date = dateFromPayload
    return infoArray
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

export {
  getEsidocItems,
  getEsidocSubtitle,
}
