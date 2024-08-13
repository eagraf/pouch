import { getRequest } from '../_request/request'

/* API CALLS - Should return promises
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export function authorize(userCookies) {
  return getRequest(
    {
      path: 'com.atproto.server.getSession',
      token: userCookies.token,
    },
    true,
  )
}
