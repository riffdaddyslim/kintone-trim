// Plugin consts
const TRIMMABLE_TYPES = ["SINGLE_LINE_TEXT", "MULTI_LINE_TEXT"];
const PLUGIN_ID = kintone.$PLUGIN_ID;
const APP_ID = kintone.app.getId();
const CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
const SELECTED_FIELDS = CONFIG.selectedFields ? new Set(CONFIG.selectedFields.split(",")) : new Set()

// HTML Elements
const FIELD_SELECT = document.getElementById('fieldSelect');
const ADD_FIELD_BUTTON = document.getElementById('addFieldBtn');
const ALL_FIELDS_SELECTED_MSG = document.getElementById('allFieldsSelectedMsg');
const SELECTED_FIELDS_COUNTER = document.querySelector('[data-selected-fields]');
const SELECTED_FIELDS_LIST = document.getElementById('selectedFieldsList');
const FORM = document.getElementById('dataTimmerForm');
const CANCEL_BUTTON = document.getElementById('cancelBtn');

// Plugin Variables
let formFields = null;

// Main function
(() => {
  'use strict';
  
  // Load functions
  getFields().then(res => {
    formFields = Object.values(res.properties).filter(field => TRIMMABLE_TYPES.includes(field.type))
    renderFieldSelect()
    renderSelectedFields()
  }).catch(err => {
    throw new Error(err)
  })

  // Attaches event listeners to HTML elements
  FORM.addEventListener('submit', formSubmitEvent);
  ADD_FIELD_BUTTON.addEventListener("click", addFieldEvent);

  CANCEL_BUTTON.addEventListener('click', function() {
    window.location.href = '../../' + APP_ID + '/plugin/';
  });
})()

function formSubmitEvent(e) {
  e.preventDefault();
  kintone.plugin.app.setConfig({selectedFields: Array.from(SELECTED_FIELDS).join(",")}, function() {
    alert('The plug-in settings have been saved. Please update the app!');
    window.location.href = '../../flow?app=' + APP_ID;
  });
}

// Sets the value of the selected fields
function addFieldEvent() {
  SELECTED_FIELDS.add(FIELD_SELECT.value)
  renderFieldSelect()
  renderSelectedFields()
}

function removeFieldEvent(e) {
  SELECTED_FIELDS.delete(e.target.dataset.code)
  renderFieldSelect()
  renderSelectedFields()
}

function getFields() {
  return new Promise((resolve, reject) => {
    const RESPONSE = (res) => resolve(res)
    const ERR = (err) => { reject(err) }
    kintone.api(kintone.api.url("/k/v1/app/form/fields", true), "GET", {"app": APP_ID}, RESPONSE, ERR)
  })
}

function renderFieldSelect() {
  FIELD_SELECT.innerHTML = ""
  const NON_SELECTED_FIELDS = formFields.filter(field => !SELECTED_FIELDS.has(field.code))
  if (NON_SELECTED_FIELDS.length === 0) {
    FIELD_SELECT.setAttribute("disabled", true)
    ADD_FIELD_BUTTON.setAttribute("disabled", true)
    ALL_FIELDS_SELECTED_MSG.style.display = "inline-block"
  } else {
    FIELD_SELECT.removeAttribute("disabled")
    ADD_FIELD_BUTTON.removeAttribute("disabled")
    ALL_FIELDS_SELECTED_MSG.style.display = "none"
  }

  for (let field of NON_SELECTED_FIELDS) {
    const OPTION = document.createElement("option")
    OPTION.text = field.label
    OPTION.value = field.code
    FIELD_SELECT.appendChild(OPTION)
  }
}

function renderSelectedFields() {
  SELECTED_FIELDS_LIST.innerHTML = SELECTED_FIELDS.size === 0 ? "<p>No fields selected</p>" : ""
  SELECTED_FIELDS_COUNTER.dataset.selectedFields = SELECTED_FIELDS.size
  for (let code of SELECTED_FIELDS) {
    const ITEM = document.createElement("li")
    const FIELD = formFields.find(field => field.code === code)
    ITEM.textContent = FIELD.label
    ITEM.dataset.code = FIELD.code
    ITEM.addEventListener("click", removeFieldEvent)
    SELECTED_FIELDS_LIST.appendChild(ITEM)
  }
}