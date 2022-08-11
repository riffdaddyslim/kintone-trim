((PLUGIN_ID) => {
  'use strict';
  const CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
  if (!CONFIG.selectedFieldCodes) return

  const EVENTS = []
  for (let fieldCode of CONFIG.selectedFieldCodes.split(",")) {
    EVENTS.push(`app.record.index.edit.change.${fieldCode}`)
    EVENTS.push(`app.record.edit.change.${fieldCode}`)
    EVENTS.push(`app.record.create.change.${fieldCode}`)
  }
  
  kintone.events.on(EVENTS, (eventObj) => {
    const CODE = eventObj.type.split(".").pop()
    eventObj.record[CODE].value = eventObj.record[CODE].value.trim()

    return eventObj
  })
})(kintone.$PLUGIN_ID)