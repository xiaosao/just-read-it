import bro from "webextension-polyfill/dist/browser-polyfill";
// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// A generic onclick callback function.
bro.contextMenus.onClicked.addListener(function genericOnClick(info) {
  console.log(info);
  switch (info.menuItemId) {
    case "radio":
      // Radio item function
      console.log("Radio item clicked. Status:", info.checked);
      break;
    case "checkbox":
      // Checkbox item function
      console.log("Checkbox item clicked. Status:", info.checked);
      break;
    default:
      // Standard context menu item function
      console.log("Standard context menu item clicked.");
  }
});

// A generic onclick callback function.

bro.runtime.onInstalled.addListener(function () {
  // Create one test item for each context type.
  let contexts: browser.contextMenus.ContextType[] = ["page", "selection", "link", "editable", "image", "video", "audio"];
  for (let i = 0; i < contexts.length; i++) {
    let context = contexts[i];
    let title = "Test '" + context + "' menu item";
    bro.contextMenus.create({
      title: title,
      contexts: [context],
      id: context,
    });
  }

  // Create a parent item and two children.
  let parent = bro.contextMenus.create({
    title: "Test parent item",
    id: "parent",
  });
  bro.contextMenus.create({
    title: "Child 1",
    parentId: parent,
    id: "child1",
  });
  bro.contextMenus.create({
    title: "Child 2",
    parentId: parent,
    id: "child2",
  });

  // Create a radio item.
  bro.contextMenus.create({
    title: "radio",
    type: "radio",
    id: "radio",
  });

  // Create a checkbox item.
  bro.contextMenus.create({
    title: "checkbox",
    type: "checkbox",
    id: "checkbox",
  });

  // Intentionally create an invalid item, to show off error checking in the
  // create callback.
  bro.contextMenus.create({ title: "Oops", parentId: 999, id: "errorItem" }, function () {
    if (bro.runtime.lastError) {
      console.log("Got expected error: " + bro.runtime.lastError.message);
    }
  });
});
