/**
 * Copyright (C) 2023 GIP-RECIA, Inc.
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

/* eslint-disable node/prefer-global/process */
import type { ConfigEnv } from 'vite'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import { name } from './package.json'

// https://vitejs.dev/config/
export default ({ mode }: ConfigEnv) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  return defineConfig({
    base: process.env.VITE_BASE_URI,
    plugins: [],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      lib: {
        entry: './index.ts',
        formats: ['es'],
        name,
      },
      sourcemap: true,
    },
    server: {
      allowedHosts: true,
      proxy: {
        '^(?:/[a-zA-Z0-9_-]+){2}/api': {
          target: process.env.VITE_PROXY_URL,
          changeOrigin: true,
          rewrite: (path) => {
            const rewrite = path.replace(/^(?:\/[\w-]+){2}\/api/, '')
            console.log(rewrite)
            return rewrite
          },
        },
      },
    },
    define: {
      'process.env': { NODE_ENV: process.env.NODE_ENV },
      'APP_VERSION': JSON.stringify(process.env.npm_package_version),
    },
  })
}
