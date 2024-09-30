import { request } from '../_request/request'

/* API CALLS - Should return promises
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export function getOnSaveTags(url) {
  return request({
    path: 'suggested_tags/',
    data: {
      url,
      version: 2
    }
  }).then(response => response)
}

export function syncItemTags(url, tags) {
    return request({
      path: 'pouch_api/api/v1/tag',
      data: {
            uri: url,
            tag: tags[0], // TODO: support multiple tags
        }
    }).then(response => {
      return response
        ? { status: 'ok', response }
        : undefined
  })
}

export function fetchStoredTags(since) {
  return request({
    path: 'get/',
    data: {
      tags: 1,
      taglist: 1,
      forcetaglist: 1,
      account: 1,
      since: since ? since : 0
    }
  }).then(response => response)
}
