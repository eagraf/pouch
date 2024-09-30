import { request } from '../_request/request'

/* API CALLS - Should return promises
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export function saveToPocket(saveObject, userId) {
  return request({
    path: "pouch_api/api/v1/links",
    data: {
      uri: saveObject.url,
      userDid: userId, // TODO this info should be included as part of the session
    }
  }).then(response => {
    return response
      ? { saveObject, status: 'ok', response }
      : undefined
  })
}
