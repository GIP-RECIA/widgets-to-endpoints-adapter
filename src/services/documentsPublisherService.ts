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

declare global {
  interface Window {
    WidgetAdapter: WidgetAdapter
  }
}

const url: string = import.meta.env.VITE_PUBLISHER_RESOURCES_URI

async function getDocumentsPublisher(soffit: string): Promise<string> {
  const itemArrayResponse: Array<Item> = []

  const response = await getDocuments(soffit)

  for (let index = 0; index < response.length; index++) {
    const element = response[index]
    const item: Item = {
      name: element.article.title,
      link: '',
      target: '',
      rel: '',
      icon: '',
      event: import.meta.env.VITE_PUBLISHER_EVENT_NAME ?? '',
      eventpayload: JSON.stringify({ uuid: element.uuid ?? '' }),
      eventDNMA: '',
      eventpayloadDNMA: '',
    }
    itemArrayResponse.push(item)
  }
  return JSON.stringify(itemArrayResponse)
}

async function getDocuments(soffit: string) {
  try {
    const timeout = window.WidgetAdapter.timeout
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(timeout),
      headers: { Authorization: `Bearer ${soffit}` },
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

export {
  getDocumentsPublisher,
}
