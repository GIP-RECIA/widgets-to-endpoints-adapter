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

import type { Config } from '../types/ConfigType.ts'
import { portletRegistryToArray } from './utils/portlet-registry-to-array.ts'

// let registryPortlets: Map<string, object> = new Map()
let registryJson: any
let registryPortletsArray: Array<any> = []

function getRegistryPortletsArray(): Array<any> {
  return registryPortletsArray
}

// function getRegistryPortletsMap(): Map<string, object> {
//   return registryPortlets
// }

function getRegistryJson(): any {
  return registryJson
}

async function getRegistry(config: Config): Promise<any[]> {
  const response = await internalGetRegistry(config)

  registryPortletsArray = portletRegistryToArray(response)
  registryJson = response
  return registryPortletsArray
}

async function internalGetRegistry(config: Config): Promise<any> {
  try {
    const timeout = 60000
    const response = await fetch(config.global.portletRegistryUri, {
      method: 'GET',
      signal: AbortSignal.timeout(timeout),
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

// function getConfig(): { global: GlobalConfig, favoris: FavorisConfig } {
//   return { global: window.WidgetAdapter.config.global, favoris: window.WidgetAdapter.config.favoris }
// }

export {
  getRegistry,
  getRegistryJson,
  getRegistryPortletsArray,
  // getRegistryPortletsMap,
}
