import * as handle from './userActions'
import { setDefaultIcon } from 'common/interface'
import { LOCAL_STORAGE_KEY_REFRESH_TOKEN } from 'common/constants'
import { refreshSession } from 'common/api/auth/authorize'
import { getSetting, setSettings } from 'common/interface'

import { AUTH_CODE_RECEIVED } from 'actions'
import { USER_LOG_IN } from 'actions'
import { LOGGED_OUT_OF_POCKET } from 'actions'
import { RESAVE_ITEM } from 'actions'
import { REMOVE_ITEM } from 'actions'
import { TAGS_SYNC } from 'actions'
import { OPEN_POCKET } from 'actions'
import { OPEN_OPTIONS } from 'actions'
import { COLOR_MODE_CHANGE } from 'actions'
import { SEND_TAG_ERROR } from 'actions'
import { SET_HABITAT_DOMAIN } from 'actions'

/* Initial Setup
–––––––––––––––––––––––––––––––––––––––––––––––––– */
chrome.runtime.onInstalled.addListener(function () {
  // Use SVG icons over the png for more control
  setDefaultIcon()

  handle.setContextMenus()

  // Open the options page
  handle.openOptionsPage()
})

/* Browser Action - Toolbar
–––––––––––––––––––––––––––––––––––––––––––––––––– */
chrome.action.onClicked.addListener(handle.browserAction)

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'save-to-pocket-action') handle.browserAction(tab)
})

/* Context Menus Handling
–––––––––––––––––––––––––––––––––––––––––––––––––– */
chrome.contextMenus.onClicked.addListener(handle.contextClick)

/* Tab Handling
–––––––––––––––––––––––––––––––––––––––––––––––––– */
// Update the icon to unsaved if we are change pages
chrome.tabs.onUpdated.addListener(handle.tabUpdated)

chrome.runtime.onMessage.addListener(function (message, sender) {
  const { type, payload } = message
  const { tab } = sender

  console.groupCollapsed(`RECEIVE: ${type}`)
  console.log(payload)
  console.groupEnd(`RECEIVE: ${type}`)

  switch (type) {
    case AUTH_CODE_RECEIVED:
      handle.authCodeRecieved(tab, payload)
      return
    case USER_LOG_IN:
      handle.logIn(tab)
      return
    case LOGGED_OUT_OF_POCKET:
      handle.loggedOutOfPocket(tab)
      return
    case REMOVE_ITEM:
      handle.removeItemAction(tab, payload)
      return
    case RESAVE_ITEM:
      handle.browserAction(tab)
      return
    case TAGS_SYNC:
      handle.tagsSyncAction(tab, payload)
      return
    case SEND_TAG_ERROR:
      handle.tagsErrorAction(tab, payload)
      return
    case COLOR_MODE_CHANGE:
      handle.setColorMode(tab, payload)
      return
    case OPEN_POCKET:
      handle.openPouch()
      return
    case OPEN_OPTIONS:
      handle.openOptionsPage()
      return
    case SET_HABITAT_DOMAIN:
      handle.setHabitatDomain(tab, payload)
      return
    default:
      return Promise.resolve(`Message received: ${type}`)
  }
})


// Set up an alarm to check and refresh the token periodically
// The access token expires after 2 hours, so let's refresh it one
// minute before it expires
chrome.alarms.create('refreshToken', { periodInMinutes: 119});


chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refreshToken') {
    console.log('Refreshing tokens...');
    refresh();
  }
});

async function refresh() {
  const refreshToken = await getSetting(LOCAL_STORAGE_KEY_REFRESH_TOKEN);


  const resp = await refreshSession({
      'refresh_token': refreshToken,
    })

    if (resp && resp.accessJwt && resp.refreshJwt) {

        setSettings({
          access_token: resp.accessJwt,
          refresh_token: resp.refreshJwt,
        })

    } else {
        console.error('Failed to refresh tokens');
    }
}
