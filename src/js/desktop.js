((PLUGIN_ID) => {
  'use strict';
  const CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
  if (!CONFIG.selectedFieldCodes) return

  kintone.events.on(["app.record.create.submit", "app.record.edit.submit", "app.record.index.edit.submit"], (eventObj) => {
    for (let fieldCode of CONFIG.selectedFieldCodes.split(",")) {
      eventObj.record[fieldCode].value = eventObj.record[fieldCode].value.trim()
    }
    return eventObj
  })
})(kintone.$PLUGIN_ID)