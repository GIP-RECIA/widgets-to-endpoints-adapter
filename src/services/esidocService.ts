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

import type { EsidocConfig } from '../types/configSubtypes/EsidocConfigType.ts'
import type { GlobalConfig } from '../types/configSubtypes/GlobalConfigType.ts'
import type { WidgetItem } from '../types/widgetType.ts'
import { WidgetKeyEnum } from '../WidgetKeyEnum.ts'

let date: Date
let itemList: any[]

async function getEsidocSubtitle(soffit: string): Promise<string> {
  if (date === undefined) {
    // should not happpen because getEsidocItems is called before and set date
    await getEsidocInfo(getConfig().esidoc.apiUri, soffit)
  }
  return `I18N$CacheUpdate$${date.toLocaleTimeString()}`
}

async function getEsidocItems(soffit: string): Promise<WidgetItem[]> {
  if (itemList === undefined)
    await getEsidocInfo(getConfig().esidoc.apiUri, soffit)

  const responseArray: any[] | undefined = itemList
  if (responseArray === undefined)
    return []

  const itemArrayResponse: WidgetItem[] = []

  const buttonSearch: WidgetItem = {
    id: 'search-button',
    name: 'I18N$Rechercher$',
    icon: '<svg style="width: 20px;height: 20px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>',
    dispatchEvents: [
      {
        type: 'openSearchEsidoc',
      },
    ],
  }
  itemArrayResponse.push(buttonSearch)
  for (let index = 0; index < responseArray.length; index++) {
    const element = responseArray[index]
    try {
      const ressourceLightAsItem: WidgetItem = {
        id: element.permalien,
        name: element.titre,
        icon: element.retard
          ? '<svg style="width: 20px;height: 20px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M128 0c17.7 0 32 14.3 32 32l0 32 128 0 0-32c0-17.7 14.3-32 32-32s32 14.3 32 32l0 32 48 0c26.5 0 48 21.5 48 48l0 48L0 160l0-48C0 85.5 21.5 64 48 64l48 0 0-32c0-17.7 14.3-32 32-32zM0 192l448 0 0 272c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48L0 192zM305 305c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47z"/></svg>'
          : '',
        link: {
          href: `${getConfig().global.context}/api/ExternalURLStats?fname=ESIDOC&service=${element.permalien}`,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        dispatchEvents: [
          {
            type: 'click-portlet-card',
            detail: {
              fname: WidgetKeyEnum.ESIDOC_PRETS,
            },
          },
        ],
      }

      itemArrayResponse.push(ressourceLightAsItem)
    }
    catch (error) {
      console.error(`missing field in payload: ${error}`)
    }
  }
  return itemArrayResponse
}

async function getEsidocInfo(esidocApiUrl: string, soffit: string): Promise<any[]> {
  try {
    const timeout = getConfig().global.timeout
    const response = await fetch(esidocApiUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(timeout),
      headers: { Authorization: `Bearer ${soffit}` },
    })

    if (!response.ok)
      throw new Error(`Response status: ${response.status}`)

    const json = await response.json()

    const infoArray: any[] = json.itemForResponseList
    itemList = infoArray
    const dateFromPayload = new Date(json.lastUpdateInstant)
    date = dateFromPayload

    return infoArray
  }
  catch (error) {
    console.error(error)
    throw error
  }
}

function getConfig(): { global: GlobalConfig, esidoc: EsidocConfig } {
  return {
    global: window.WidgetAdapter.config.global,
    esidoc: window.WidgetAdapter.config.esidoc,
  }
}

export {
  getEsidocItems,
  getEsidocSubtitle,
}
