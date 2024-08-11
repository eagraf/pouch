import { getRequest } from '../_request/request'

/* API CALLS - Should return promises
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export function authorize(guid, userCookies) {
  return getRequest(
    {
      path: 'com.atproto.server.getSession',
    },
    true,
  )
}
