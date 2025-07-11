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
import { instance } from '../utils/axiosUtils'

const url: string = import.meta.env.VITE_PUBLISHER_RESOURCES_URI

async function getDocumentsPublisher(soffit: string): Promise<string> {
  const itemArrayResponse: Array<Item> = []

  const response = await getDocuments(soffit)

  for (let index = 0; index < response.data.length; index++) {
    const element = response.data[index]
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
  return await instance.get(url, { headers: { Authorization: `Bearer ${soffit}` } })
}

export {
  getDocumentsPublisher,
}
