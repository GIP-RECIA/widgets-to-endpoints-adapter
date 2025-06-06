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

import { getDocumentsPublisher } from '../services/documentsPublisherService'
import { getFavorisMediacentre } from '../services/favorisMediacentreService'
import { getFavorisPortail } from '../services/favorisPortailService'
import { WidgetKeyEnum } from '../WidgetKeyEnum'

export class WidgetAdapter {
  getKeys = () => {
    return Object.values(WidgetKeyEnum) as string[]
  }

  getJsonForWidget = (key: string, soffit: string) => {
    switch (key) {
      case WidgetKeyEnum.DOCUMENTS_PUBLISHER:
        return getDocumentsPublisher(soffit)
      case WidgetKeyEnum.FAVORIS_MEDIACENTRE:
        return getFavorisMediacentre(soffit)
      case WidgetKeyEnum.FAVORIS_PORTAIL:
        return getFavorisPortail()
      default:
        return undefined
    }
  }
}
