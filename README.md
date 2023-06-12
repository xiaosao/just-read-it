

```
<url-pattern> := <scheme>://<host><path>
<scheme> := '*' | 'http' | 'https' | 'file' | 'ftp' | 'urn'
<host> := '*' | '*.' <any char except '/' and '*'>+
<path> := '/' <any chars>
```


Paths inside the manifest are relative to the Vite project root, so the location of the manifest file doesn't matter.

- 双击出现浮球
- 鼠标滑动选择后出现浮球
- 点击鼠标右键可以出现
- 是否需要进行配置

browser.contextMenus
browser.contextMenus.ContextType 判断在哪些上下文可以出现菜单

browser.storage.local 相当于浏览器中的 localStorage

browser.storage.sync 浏览器账户进行同步的数据

inflate config, deflate config

chrome.contextMenus.onClicked.addListener

pako 有什么用