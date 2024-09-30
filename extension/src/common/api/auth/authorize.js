import { getRequest, request } from '../_request/request'

/* API CALLS - Should return promises
–––––––––––––––––––––––––––––––––––––––––––––––––– */
export function authorize(userCookies) {
  return getRequest(
    {
      path: 'xrpc/com.atproto.server.getSession',
      token: userCookies.access_token,
    },
    true,
  )
}

export function refreshSession(userCookies) {

  return request(
    {
      path: 'xrpc/com.atproto.server.refreshSession',
      token: userCookies.refresh_token,
    },
    true,
  )
}