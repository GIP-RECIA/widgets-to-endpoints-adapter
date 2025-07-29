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

import uniqBy from 'lodash/uniqBy'
/**
 * Combines a array of arrays into a single level array
 * @param {Array<Portlet>} acc - accululator that combines all the arrays
 * @param {Array<Portlet>} arr - new array to add to the accumulator
 * @return {Array<Portlet>} merged arrays
 */
function flatten(acc: string | any[], arr: any) {
  return acc.concat(arr)
}

/**
 * Takes the returned array from treeWalker and removes duplicates
 * based on "fname"
 * @param {object} registryJson Portlet Registry Tree
 * @return {Array<Portlet>} list of portlets
 */
export function portletRegistryToArray(registryJson: any) {
  return customUnique(treeWalker(registryJson))
}

/**
 * Walks the portlet registry tree
 * @param {object} registryJson Portlet Registry Tree
 * @return {Array<Portlet>} list of portlets
 */
function treeWalker(registryJson: { registry: any, portlets: any[], name: any, categories: any[], subcategories: any[] }): any {
  if (registryJson.registry) {
    return treeWalker(registryJson.registry)
  }

  const portlets = registryJson.portlets || []

  if (portlets.length > 0) {
    portlets.forEach(p => (p.categories = [registryJson.name]))
  }

  if (registryJson.categories) {
    return portlets
      .concat(registryJson.categories.map(portletRegistryToArray))
      .reduce(flatten, [])
  }
  if (registryJson.subcategories) {
    return portlets
      .concat(registryJson.subcategories.map(portletRegistryToArray))
      .reduce(flatten, [])
  }

  return portlets
}

/**
 * Custom function to remove duplicates portlet on fname, but with merging categories.
 * @param {Array<Portlet>} array - Portlet List with duplicates.
 * @return {Array<Portlet>} Portlet List without duplicates.
 */
function customUnique(array: Array<any>) {
  const unique = uniqBy(array, 'fname')
  // we construct unique portlets array will all linked categories (reversing category and portlets child)
  unique.forEach((elem) => {
    const dupl = array.filter(e => e.fname === elem.fname)
    const allCategories = dupl.flatMap(({ categories }) => categories)
    elem.categories = [...new Set(allCategories)]
  })
  return unique
}
