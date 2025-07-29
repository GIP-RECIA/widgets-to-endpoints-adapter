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

export default function flattenFavorites(elem: any): any {
  // undefined has no favorites
  if (elem === undefined) {
    return []
  }

  // recursively cycle through children
  if (Array.isArray(elem)) {
    return elem.flatMap(flattenFavorites)
  }

  const { content } = elem
  // if there is no content it is a leaf node
  if (!content) {
    const { fname } = elem
    // return fname when availible
    return fname ? [fname] : []
  }

  // if there is content process it
  return flattenFavorites(content)
}
