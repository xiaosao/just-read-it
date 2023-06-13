import bro from "webextension-polyfill/dist/browser-polyfill";

// Copyright 2021 Google LLC
//
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file or at
// https://developers.google.com/open-source/licenses/bsd

// Initialize the demo on install
bro.runtime.onInstalled.addListener(({ reason }) => {
  if (reason !== "install") {
    return;
  }

  openDemoTab();

  // Create an alarm so we have something to look at in the demo
  bro.alarms.create('demo-default-alarm', {
    delayInMinutes: 1,
    periodInMinutes: 1
  });
});

bro.action.onClicked.addListener(openDemoTab);

function openDemoTab() {
  bro.tabs.create({ url: 'index.html' });
}
