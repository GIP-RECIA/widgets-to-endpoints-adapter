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

import type { FavorisConfig } from '../types/configSubtypes/FavorisConfigType'
import type { GlobalConfig } from '../types/configSubtypes/GlobalConfigType'

export default class portletFromApiService {
  static getUrl(portlet: any): string {
    return portlet?.parameters?.alternativeMaximizedLink
      ? portlet.parameters.alternativeMaximizedLink
      : `/${getConfig().global.context}/p/${portlet.fname}`
  }

  static getTarget(portlet: any): string {
    if (getAlternativeMaximizedUrl(portlet)) {
      return getAlternativeMaximizedTarget(portlet)
    }
    return '_self'
  }

  static getRel(portlet: any): string {
    return hasAlternativeMaximizedUrl(portlet)
      ? 'noopener noreferrer'
      : ''
  }
}

function hasAlternativeMaximizedUrl(portlet: any): string {
  return getAlternativeMaximizedUrl(portlet)
}

function getAlternativeMaximizedTarget(portlet: any): string {
  return portlet?.parameters?.alternativeMaximizedLinkTarget ?? '_blank'
}

function getAlternativeMaximizedUrl(portlet: any): string {
  return portlet?.parameters?.alternativeMaximizedLink
}

function getConfig(): { global: GlobalConfig, favoris: FavorisConfig } {
  return { global: window.WidgetAdapter.config.global, favoris: window.WidgetAdapter.config.favoris }
}
