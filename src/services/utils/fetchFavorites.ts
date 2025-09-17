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

import type { FavorisConfig } from '../../types/configSubtypes/FavorisConfigType.ts'
import type { GlobalConfig } from '../../types/configSubtypes/GlobalConfigType.ts'

export default async function () {
  try {
    const timeout = getConfig().global.timeout
    const response = await fetch(getConfig().favoris.favorisUri, {
      method: 'GET',
      signal: AbortSignal.timeout(timeout),
    })
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }
    const data = await response.json()
    if (
      data?.authenticated
      && data?.layout?.globals?.hasFavorites
      && data?.layout?.favorites
    ) {
      return data.layout.favorites
    }
    return []
  }
  catch (err) {
    console.error(err)
    return []
  }
}

function getConfig(): { global: GlobalConfig, favoris: FavorisConfig } {
  return { global: window.WidgetAdapter.config.global, favoris: window.WidgetAdapter.config.favoris }
}
