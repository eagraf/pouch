/* Messaging
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export function sendMessage(message) {
  chrome.runtime.sendMessage(message)
}

/* Browser
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export function openTabWithUrl(url, inBackground) {
  let makeTabActive = inBackground === true ? false : true //eslint-disable-line no-unneeded-ternary
  return chrome.tabs.create({ url: url, active: makeTabActive })
}

/* Action Iconography
–––––––––––––––––––––––––––––––––––––––––––––––––– */

const iconPath = "../../assets/images/pouch-32x32.png"
const iconSavedPath = "../../assets/images/saved-icon.png"

export function setDefaultIcon() {
  //const imageData = inactiveIcon()
  const path = iconPath
  chrome.action.setIcon({ path })
}

export function setToolbarIcon(tabId, isSaved) {
  const path = isSaved ? iconSavedPath : iconPath
  chrome.action.setIcon({ tabId, path })
}

/* Local Storage
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export function getSetting(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        handleSettingError(chrome.runtime.lastError)
        return reject('Error when retrieving local settings. Please contact Pocket Support')
      }
      resolve(result[key])
    })
  })
}

export function setSettings(values) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(values, () => {
      if (chrome.runtime.lastError) {
        handleSettingError(chrome.runtime.lastError)
        return reject('Error when storing local settings. Please contact Pocket Support')
      }
      resolve()
    })
  })
}

function handleSettingError(err) {
  console.error(err)
}
