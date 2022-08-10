// Plugin consts
const APP_ID = kintone.app.getId();
const PLUGIN_ID = kintone.$PLUGIN_ID;
const CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
const SELECTED_FIELD_CODES = CONFIG.selectedFieldCodes ? new Set(CONFIG.selectedFieldCodes.split(",")) : new Set()

// HTML Elements
const FIELD_CODE_INPUT = document.getElementById('fieldCodeInput');
const FIELD_CODE_DATALIST = document.getElementById('fieldCodeDatalist');
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
  
  getFields().then(res => {
    // Gets the fields of the current form
    formFields = Object.values(res.properties)

    // Load functions
    renderFieldCodeDatalist()
    renderSelectedFields()
  }).catch(err => {
    throw new Error(err)
  })

  // Attaches event listeners to HTML elements
  FORM.addEventListener('submit', formSubmitEvent);
  ADD_FIELD_BUTTON.addEventListener("click", addFieldEvent);

  CANCEL_BUTTON.addEventListener('click', function() {
    window.location.href = '../../' + APP_ID + '/plugin/#/';
  });

  document.addEventListener("keydown", e => {
    if (FIELD_CODE_INPUT === document.activeElement && e.key === "Enter") {
      e.preventDefault()
      ADD_FIELD_BUTTON.click()
    } 
  })
})()

// Function called when FORM is submitted
function formSubmitEvent(e) {
  e.preventDefault();
  const CODES = SELECTED_FIELD_CODES.size === 0 ? "" : Array.from(SELECTED_FIELD_CODES).join(",")
  kintone.plugin.app.setConfig({
    selectedFieldCodes: CODES
  }, () => {
    alert('The plug-in settings have been saved. Please update the app!');
    window.location.href = '../../flow?app=' + APP_ID;
  });
}

// Function called when ADD_FIELD_BUTTON is clicked
function addFieldEvent() {
  if (FIELD_CODE_INPUT.value === "") return alert("No field code entered")
  if (SELECTED_FIELD_CODES.has(FIELD_CODE_INPUT.value)) return alert("Field code already selected")
  SELECTED_FIELD_CODES.add(FIELD_CODE_INPUT.value)
  FIELD_CODE_INPUT.value = ""
  renderFieldCodeDatalist()
  renderSelectedFields()
}

// Function called when a field list item is clicked on
function removeFieldEvent(e) {
  SELECTED_FIELD_CODES.delete(e.target.dataset.code)
  renderFieldCodeDatalist()
  renderSelectedFields()
}

// Function that wraps kintone's api call to get all the form's fields in a promise
function getFields() {
  return new Promise((resolve, reject) => {
    kintone.api(kintone.api.url("/k/v1/app/form/fields", true), "GET", {"app": APP_ID}, resolve, reject)
  })
}

// Function to render the field select options
function renderFieldCodeDatalist() {
  FIELD_CODE_DATALIST.innerHTML = ""
  const NON_SELECTED_FIELDS = formFields.filter(field => !SELECTED_FIELD_CODES.has(field.code))

  // if (NON_SELECTED_FIELDS.length === 0) {
  //   // ! CHANGE TO A BETTER DISLAY TO NOTIFY THAT THERE IS NO MORE FIELDS AVAILABLE
  //   FIELD_SELECT.setAttribute("disabled", true)
  //   ADD_FIELD_BUTTON.setAttribute("disabled", true)
  //   ALL_FIELDS_SELECTED_MSG.style.display = "inline-block"
  // } else {
  //   FIELD_SELECT.removeAttribute("disabled")
  //   ADD_FIELD_BUTTON.removeAttribute("disabled")
  //   ALL_FIELDS_SELECTED_MSG.style.display = "none"
  // }

  for (let field of NON_SELECTED_FIELDS) {
    const OPTION = document.createElement("option")
    OPTION.value = field.code
    FIELD_CODE_DATALIST.appendChild(OPTION)
  }
}

// Function to render all the selected fields
function renderSelectedFields() {
  SELECTED_FIELDS_LIST.innerHTML = SELECTED_FIELD_CODES.size === 0 ? "<p>No fields selected</p>" : ""
  SELECTED_FIELDS_COUNTER.dataset.selectedFields = SELECTED_FIELD_CODES.size
  
  for (let code of SELECTED_FIELD_CODES) {
    const ITEM = document.createElement("li")
    ITEM.setAttribute("class", "field-item")

    const P = document.createElement("p")
    P.textContent = code
    ITEM.appendChild(P)

    const CLOSE = document.createElement("button")
    CLOSE.setAttribute("class", "field-item-close")
    CLOSE.textContent = "Remove"
    CLOSE.dataset.code = code
    ITEM.appendChild(CLOSE)
    CLOSE.addEventListener("click", removeFieldEvent)
    
    SELECTED_FIELDS_LIST.appendChild(ITEM)
  }
}