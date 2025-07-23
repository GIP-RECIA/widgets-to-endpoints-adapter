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

import type { EsidocConfig } from './configSubtypes/EsidocConfigType'
import type { FavorisConfig } from './configSubtypes/FavorisConfigType'
import type { GlobalConfig } from './configSubtypes/GlobalConfigType'
import type { MediacentreConfig } from './configSubtypes/MediacentreConfigType'
import type { PublisherConfig } from './configSubtypes/PublisherConfigType'

export interface Config {
  esidoc: EsidocConfig
  favoris: FavorisConfig
  global: GlobalConfig
  mediacentre: MediacentreConfig
  publisher: PublisherConfig
}
