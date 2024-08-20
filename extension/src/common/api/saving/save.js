import { request } from '../_request/request'

/* API CALLS - Should return promises
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export function saveToPocket(saveObject, userId) {
  return request({
    path: 'com.atproto.repo.createRecord',
    data: {
        repo: userId,
        collection: "com.habitat.pouch.link",
        record: {
            url: saveObject.url,
            createdAt: new Date().toISOString(),
        }
      }
  }).then(response => {
    return response
      ? { saveObject, status: 'ok', response }
      : undefined
  })
}
