import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// Separate path for electron:
// https://learnvue.co/2021/05/build-vue-3-desktop-apps-in-just-5-minutes-vite-electron-quick-start-guide/
const path = require('path')
const basePath = () => {
  if (process.env.VITE_BUILD_MODE === 'electron') {
    return path.resolve(__dirname, './dist/')
  }
  if (process.env.VITE_BUILD_MODE === 'release') {
    return './'
  }
  return '/atom/'
}

// https://stackoverflow.com/questions/66389043/how-can-i-use-vite-env-variables-in-vite-config-js
export default ({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())}
  // import.meta.env.VITE_NAME available here with: process.env.VITE_NAME

  return defineConfig({
    plugins: [vue()],
    base: basePath()
  })
}
