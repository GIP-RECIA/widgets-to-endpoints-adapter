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
import {
  faCalendarXmark,
  // faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'
import { getIconWithStyle } from '../utils/fontawesomeUtils.ts'
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

  // const buttonSearch: WidgetItem = {
  //   id: 'search-button',
  //   name: 'I18N$Rechercher$',
  //   icon: getIconWithStyle(faMagnifyingGlass, [], ['icon']),
  //   dispatchEvents: [
  //     {
  //       type: 'openSearchEsidoc',
  //     },
  //   ],
  // }
  // itemArrayResponse.push(buttonSearch)
  for (let index = 0; index < responseArray.length; index++) {
    const element = responseArray[index]
    try {
      const ressourceLightAsItem: WidgetItem = {
        id: element.permalien,
        name: element.titre,
        icon: element.retard
          ? getIconWithStyle(faCalendarXmark, [], ['icon'])
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
