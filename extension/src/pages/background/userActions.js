import { saveSuccess } from './postSave'

import { isSystemPage, isSystemLink } from 'common/helpers'
import { getSetting, setSettings } from 'common/interface'
import { closeLoginPage } from 'common/helpers'
import { setToolbarIcon } from 'common/interface'
import { localize } from 'common/locales'
import { authorize } from 'common/api'
import { saveToPocket } from 'common/api'
import { syncItemTags } from 'common/api'
import { removeItem } from 'common/api'

import { SAVE_TO_POCKET_REQUEST } from 'actions'
import { SAVE_TO_POCKET_SUCCESS } from 'actions'
import { SAVE_TO_POCKET_FAILURE } from 'actions'

import { TAG_SYNC_REQUEST } from 'actions'
import { TAG_SYNC_SUCCESS } from 'actions'
import { TAG_SYNC_FAILURE } from 'actions'

import { REMOVE_ITEM_REQUEST } from 'actions'
import { REMOVE_ITEM_SUCCESS } from 'actions'
import { REMOVE_ITEM_FAILURE } from 'actions'

import { UPDATE_TAG_ERROR } from 'actions'
import { getLoginUrl, getLogoutUrl, getPouchUrl, getHabitatUrl } from '../../common/helpers'
import {
  LOCAL_STORAGE_KEY_ACCESS_TOKEN,
  LOCAL_STORAGE_KEY_REFRESH_TOKEN,
  LOCAL_STORAGE_KEY_USER_ID,
} from '../../common/constants'
import { getAccessToken } from '../../common/helpers'

var postAuthSave = null

/* Browser Action - Toolbar Icon Clicked
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export function browserAction(tab) {
  if (isSystemPage(tab)) return openHabitatHome() // open list on non-standard pages

  const { id: tabId, title, url: pageUrl } = tab

  save({ pageUrl, title, tabId })
}

/* Context Clicks - Right/Option Click Menus
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export function contextClick(info, tab) {
  const { menuItemId, linkUrl, pageUrl } = info
  const { id: tabId, title } = tab

  if (menuItemId === 'toolbarContextClickHome') return openHabitatHome()
  if (menuItemId === 'toolbarContextClickList') return openPouch()
  if (menuItemId === 'toolbarContextClickLogOut') return logOut()
  if (menuItemId === 'toolbarContextClickLogIn') return logIn()

  // Open list on non-standard pages/links
  if (isSystemLink(linkUrl || pageUrl)) return openPouch()

  return save({ linkUrl, pageUrl, title, tabId })
}

/* Saving
–––––––––––––––––––––––––––––––––––––––––––––––––– */
async function save({ linkUrl, pageUrl, title, tabId }) {
  // send message that we are requesting a save
  chrome.tabs.sendMessage(tabId, { action: SAVE_TO_POCKET_REQUEST })

  try {
    // Are we authed?
    const access_token = await getAccessToken()
    const user_id = await getSetting(LOCAL_STORAGE_KEY_USER_ID)
    if (!access_token) return logIn({ linkUrl, pageUrl, title, tabId })

    const url = linkUrl || pageUrl

    const { response: payload } = await saveToPocket({ url, title, tabId }, user_id)

    // send a message with the response
    const message = payload
      ? { action: SAVE_TO_POCKET_SUCCESS, payload }
      : { action: SAVE_TO_POCKET_FAILURE, payload }

    chrome.tabs.sendMessage(tabId, message)

    if (payload) saveSuccess(tabId, { ...payload, url: pageUrl, isLink: true })
  } catch (error) {
    // If it is an auth error let's redirect the user
    if (error?.xErrorCode === '107') {
      return logIn({ linkUrl, pageUrl, title, tabId })
    }

    // Otherwise let's just show the error message
    const payload = { message: error }
    const errorMessage = { action: SAVE_TO_POCKET_FAILURE, payload }
    chrome.tabs.sendMessage(tabId, errorMessage)
  }
}

/* Remove item
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export async function removeItemAction(tab, payload) {
  const { id: tabId } = tab
  const { itemId } = payload

  // send message that we are attempting to sync tags
  chrome.tabs.sendMessage(tabId, { action: REMOVE_ITEM_REQUEST })

  const { response } = await removeItem(itemId)
  const message = response
    ? { action: REMOVE_ITEM_SUCCESS, payload }
    : { action: REMOVE_ITEM_FAILURE, payload }

  chrome.tabs.sendMessage(tabId, message)

  if (response) setToolbarIcon(tabId, false)
}

/* Add tags to item
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export async function tagsSyncAction(tab, payload) {
  const { id: tabId } = tab
  const { item_id, url, tags } = payload

  // send message that we are attempting to sync tags
  chrome.tabs.sendMessage(tabId, { action: TAG_SYNC_REQUEST })

  const user_id = await getSetting('user_id')
  const { response } = await syncItemTags(url, tags)
  const message = response
    ? { action: TAG_SYNC_SUCCESS, payload }
    : { action: TAG_SYNC_FAILURE, payload }

  chrome.tabs.sendMessage(tabId, message)
}

/* Submit tags error
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export async function tagsErrorAction(tab, payload) {
  const { id: tabId } = tab
  chrome.tabs.sendMessage(tabId, { action: UPDATE_TAG_ERROR, payload })
}

/* Authentication user
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export async function authCodeRecieved(tab, payload) {
  try {
    // TODO check the result of authorize
    const authResponse = await authorize(payload)

    setSettings(payload);
  } catch (err) {
    console.log(err);
  }

  closeLoginPage()
  setContextMenus()

  if (postAuthSave) save(postAuthSave)
  postAuthSave = null
}

export function logOut() {
  getLogoutUrl().then(
    (url) => {
      chrome.tabs.create({ url })
    }
  )
}

export function loggedOutOfPocket() {
  chrome.storage.local.remove([
    LOCAL_STORAGE_KEY_ACCESS_TOKEN,
    LOCAL_STORAGE_KEY_REFRESH_TOKEN,
    LOCAL_STORAGE_KEY_USER_ID,
  ])
  setContextMenus()
}

export function logIn(saveObject) {
  postAuthSave = saveObject
  getLoginUrl().then(
    (url) => {
      chrome.tabs.create({ url })
    }
  )
}

export function openPouch() {
  getPouchUrl().then((url) => {
    chrome.tabs.create({ url })
  })
}

export function openHabitatHome() {
  getHabitatUrl().then((url) => {
    chrome.tabs.create({ url })
  })
}

export function openOptionsPage() {
  chrome.runtime.openOptionsPage()
}

/* Tab Changes
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export function tabUpdated(tabId, changeInfo) {
  if (changeInfo.status === 'loading' && changeInfo.url) {
    // if actively loading a new page, unset save state on icon
    setToolbarIcon(tabId, false)
  }
}

/* Theme Changes
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export async function setColorMode(tab, { theme }) {
  await setSettings({ theme })
}

/* Context Menus
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export async function setContextMenus() {
  chrome.contextMenus.removeAll()

  // Page Context - Right click menu on page
  chrome.contextMenus.create({
    title: localize('context_menu_save'),
    id: 'pageContextClick',
    contexts: ['page', 'frame', 'editable', 'image', 'video', 'audio', 'link', 'selection'], // prettier-ignore
  })

  // Browser Icon - Right click menu
  chrome.contextMenus.create({
    title: localize('context_menu_open_list'),
    id: 'toolbarContextClickList',
    contexts: ['action'],
  })

  chrome.contextMenus.create({
    title: localize('context_menu_discover_more'),
    id: 'toolbarContextClickHome',
    contexts: ['action'],
  })

  // Log In or Out menu item depending on existence of access token
  const access_token = await getSetting(LOCAL_STORAGE_KEY_ACCESS_TOKEN)
  if (access_token) {
    chrome.contextMenus.create({
      title: localize('context_menu_log_out'),
      id: 'toolbarContextClickLogOut',
      contexts: ['action'],
    })
  } else {
    chrome.contextMenus.create({
      title: localize('context_menu_log_in'),
      id: 'toolbarContextClickLogIn',
      contexts: ['action'],
    })
  }
}

/* Configure the Habitat domain to target for sending data to.
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export async function setHabitatDomain(tab, { habitat_domain }) {
  console.log('Setting habitat domain', habitat_domain)
  await setSettings({ habitat_domain })
}
