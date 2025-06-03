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
import { getToken } from '../utils/soffitUtils'

const url: string = import.meta.env.VITE_PUBLISHER_RESOURCES_URI
let soffit: string = ''

async function _fetchDocumentsPublisher(): Promise<Array<Item>> {
  const itemArrayResponse: Array<Item> = []

  const userInfoApiUrl: string = import.meta.env.VITE_APP_MEDIACENTRE_USER_INFO_API_URI

  soffit = await getToken(userInfoApiUrl)

  const response = await getDocuments()

  for (let index = 0; index < response.data.length; index++) {
    const element = response.data[index]
    const item: Item = new Item(element.article.title, element.article.files[0].uri)
    itemArrayResponse.push(item)
  }
  return itemArrayResponse
}

async function getDocuments() {
  return await instance.get(url, { headers: { Authorization: `Bearer ${soffit}` } })
}

export {
  _fetchDocumentsPublisher,
}
