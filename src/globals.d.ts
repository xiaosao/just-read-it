declare module "webextension-polyfill/dist/browser-polyfill" {
  declare const bro: typeof browser
  export default bro
}