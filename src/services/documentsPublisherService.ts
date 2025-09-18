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

import type { GlobalConfig } from '../types/configSubtypes/GlobalConfigType.ts'
import type { PublisherConfig } from '../types/configSubtypes/PublisherConfigType.ts'
import type { WidgetItem } from '../types/widgetType.ts'

async function getDocumentsPublisher(soffit: string): Promise<WidgetItem[]> {
  const itemArrayResponse: Array<WidgetItem> = []

  const response = await getDocuments(getConfig().publisher.resourcesUri, soffit)

  for (let index = 0; index < response.length; index++) {
    const element = response[index]
    const item: WidgetItem = {
      id: element.article.guid,
      name: element.article.title,
      icon: '/images/portlet_icons/Documents.svg',
      dispatchEvents: [
        {
          type: getConfig().publisher.eventName ?? '',
          detail: {
            uuid: element.uuid ?? '',
          },
        },
      ],
    }
    itemArrayResponse.push(item)
  }

  return itemArrayResponse
}

async function getDocuments(url: string, soffit: string): Promise<any> {
  try {
    const timeout = getConfig().global.timeout
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(timeout),
      headers: { Authorization: `Bearer ${soffit}` },
    })

    if (!response.ok)
      throw new Error(`Response status: ${response.status}`)

    const json = await response.json()

    return json
  }
  catch (error) {
    console.error(error)
    throw error
  }
}

function getConfig(): { global: GlobalConfig, publisher: PublisherConfig } {
  return {
    global: window.WidgetAdapter.config.global,
    publisher: window.WidgetAdapter.config.publisher,
  }
}

export {
  getDocumentsPublisher,
}
