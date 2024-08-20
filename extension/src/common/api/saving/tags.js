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

export function syncItemTags(rkey, userId, url, tags) {
    return request({
      path: 'com.atproto.repo.putRecord',
      data: {
          repo: userId,
          collection: "com.habitat.pouch.link",
          rkey: rkey,
          record: {
              url: url,
              createdAt: new Date().toISOString(),
              tags: tags,
          }
        }
    }).then(response => {
      console.log("RESPONSE: ", response);
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
