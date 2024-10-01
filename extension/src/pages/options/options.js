import ReactDOM from 'react-dom'
import React, { useEffect, useState } from 'react'
import { css, cx } from 'linaria'
import { openTabWithUrl } from 'common/interface'
import { SET_SHORTCUTS } from 'common/constants'
import { getSetting } from 'common/interface'
import { COLOR_MODE_CHANGE } from 'actions'
import { getOSModeClass, getLoginUrl, getLogoutUrl } from 'common/helpers'
import { Button } from 'components/button/extensions-button'
import { radioStyles, inputStyles } from '../injector/globalStyles'
import { SET_HABITAT_DOMAIN } from '../../actions'

const inputWrapper = css`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`

const inputGroup = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-grow: 1;
  margin-right: 12px;
  padding-right: 12px;
`

const buttonGroup = css`
  display: flex;
  justify-content: flex-end;
`

const input = css`
  flex-grow: 1;
  padding: 8px 12px;
  border: 1px solid black;
  border-radius: 4px;
  font-size: 16px;
  width: 80%;
  color: var(--color-textPrimary);
  background-color: var(--color-backgroundPrimary);

  &:focus {
    outline: none;
    border-color: var(--color-actionFocus);
  }
`

const viewMode = css`
  padding: 8px 0;
  font-size: 16px;
  color: var(--color-textPrimary);
  margin-right: 12px;
`

const errorMessage = css`
  color: red;
  font-size: 14px;
  margin-top: 5px;
`

const HabitatDomainInput = ({ initialValue, onSave, mode = 'edit' }) => {
  const [isEditing, setIsEditing] = useState(mode === 'edit')
  const [value, setValue] = useState(initialValue || '')
  const [error, setError] = useState('')

  useEffect(() => {
    setValue(initialValue || '')
  }, [initialValue])

  const validate = (domain) => {
    if (domain.startsWith('http://') || domain.startsWith('https://')) {
      setError('Please enter the domain without http:// or https://')
      return false
    }
    if (domain.endsWith('/')) {
      setError('Please enter the domain without a trailing slash (/)')
      return false
    }
    setError('')
    return true
  }

  const handleChange = (e) => {
    setValue(e.target.value)
    validate(e.target.value)
  }

  const handleSave = () => {
    if (validate(value)) {
      onSave(value)
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  if (!isEditing) {
    return (
      <div className={cx(inputWrapper)}>
        <div className={cx(inputGroup)}>
          <span className={cx(viewMode)}>{value}</span>
        </div>
        <div className={cx(buttonGroup)}>
          <Button type='inline' onClick={() => setIsEditing(true)}>Edit</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cx(inputWrapper)}>
      <div className={cx(inputGroup)}>
        <input
          className={cx(input)}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter Habitat domain"
        />
        {error && <div className={cx(errorMessage)}>{error}</div>}
      </div>
      <div className={cx(buttonGroup)}>
        <Button type='inline' onClick={handleSave}>Save</Button>
      </div>
    </div>
  )
}


const container = css`
  color: var(--color-textPrimary);
  font-size: 16px;
  width: 100vw;
  height: 100vh;

  a {
    color: var(--color-textPrimary);
    text-decoration: underline;
    display: inline-block;
  }
`
const wrapper = css`
  max-width: 550px;
  margin: 0 auto;
  padding: 100px 20px;
`
const title = css`
  font-size: 33px;
  line-height: 40px;
  font-weight: 600;
  margin: 10px 0 15px 0;
`
const header = css`
  border-bottom: 1px solid var(--color-dividerPrimary);
  margin-bottom: 20px;
`
const user = css`
  margin-right: 10px;
  margin-bottom: 10px;
  display: inline-block;
`
const section = css`
  display: flex;
  padding: 20px 0;

  @media (max-width: 599px) {
    flex-direction: column;
  }
`
const sectionLabel = css`
  display: flex;
  align-items: center;
  flex: 1;
  font-weight: 500;
`
const sectionAction = css`
  flex: 2;

  @media (max-width: 599px) {
    margin: 10px 0 0 20px;
  }
`

const OptionsApp = () => {
  const [storedTheme, setStoredTheme] = useState('light')
  const [accessToken, setAccessToken] = useState()
  const [userName, setUserName] = useState()
  const [habitatDomain, setHabitatDomain] = useState()
  const [completedInitialSetup, setCompletedInitialSetup] = useState(false)

  useEffect(async () => {
    const initialSetupCompleted = await getSetting('completed_initial_setup')
    setCompletedInitialSetup(initialSetupCompleted)

    if (initialSetupCompleted) {
      updateTheme(await getSetting('theme') || 'system')
      setAccessToken(await getSetting('access_token'))
      setUserName(await getSetting('user_id'))
      setHabitatDomain(await getSetting('habitat_domain'))
    }
  }, [])

  const setShortcuts = () => openTabWithUrl(SET_SHORTCUTS)
  const logoutAction = () => {
    getLogoutUrl().then(
      (url) => {
        openTabWithUrl(url)
      }
    )
  }
  const loginAction = () => {
    getLoginUrl().then(
      (url) => {
        openTabWithUrl(url)
      }
    )
  }

  const updateTheme = (mode) => {
    chrome.runtime.sendMessage({ type: COLOR_MODE_CHANGE, payload: { theme: mode } })
    const newTheme = (mode === 'system') ? getOSModeClass() : mode
    setStoredTheme(mode)

    const htmlTag = document && document.documentElement
    htmlTag?.classList.toggle(`pocket-theme-light`, newTheme === 'light')
    htmlTag?.classList.toggle(`pocket-theme-dark`, newTheme === 'dark')
  }

  const updateHabitatDomain = async (domain) => {
    await chrome.runtime.sendMessage({ type: SET_HABITAT_DOMAIN, payload: { habitat_domain: domain } })
    setHabitatDomain(domain)
  }

  const completedInitialDomainSetup = async () => {
    // TODO validate the domain.

    
    await chrome.storage.local.set({ 'completed_initial_setup': true })

    
    setCompletedInitialSetup(true)
  }

  if (!completedInitialSetup) {
    return (
      <div className={cx('pocket-extension', radioStyles, inputStyles, container)}>
        <section className={wrapper}>
          <header className={header}>
            <h1 className={title}>
              {chrome.i18n.getMessage('welcome_header')}
            </h1>
          </header>

          <div className={section}>
            <div className={sectionLabel}>
              {chrome.i18n.getMessage('options_habitat_domain_title')}
            </div>
            <div className={sectionAction}>
              <HabitatDomainInput
                initialValue={habitatDomain}
                onSave={updateHabitatDomain}
              />
            </div>
          </div>
          <div className={section}>
            <Button type='secondary' onClick={completedInitialDomainSetup}>
              {chrome.i18n.getMessage('welcome_complete_setup')}
            </Button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className={cx('pocket-extension', radioStyles, inputStyles, container)}>
      <section className={wrapper}>
        <header className={header}>
          <h1 className={title}>
            {chrome.i18n.getMessage('options_header')}
          </h1>
        </header>

        <div className={section}>
          <div className={sectionLabel}>
            {chrome.i18n.getMessage('options_login_title')}
          </div>
          <div className={sectionAction}>
            {(accessToken && userName) ? (
              <div>
                <span className={user}>{userName}</span>
                <Button type='secondary' onClick={logoutAction}>
                  {chrome.i18n.getMessage('options_log_out')}
                </Button>
              </div>
            ) : (
              <Button type='secondary' onClick={loginAction}>
                {chrome.i18n.getMessage('options_log_in')}
              </Button>
            )}
          </div>
        </div>

        <div className={section}>
          <div className={sectionLabel}>
            {chrome.i18n.getMessage('options_habitat_domain_title')}
          </div>
          <div className={sectionAction}>
            <HabitatDomainInput
              mode='view'
              initialValue={habitatDomain}
              onSave={updateHabitatDomain}
            />
          </div>
        </div>

        <div className={section}>
          <div className={sectionLabel}>
            {chrome.i18n.getMessage('options_shortcut_title')}
          </div>
          <div className={sectionAction}>
            <Button type='primary' onClick={setShortcuts}>
              {chrome.i18n.getMessage('options_shortcut_record')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

const root = document.getElementById('pocket-extension-anchor')

ReactDOM.render(<OptionsApp />, root)
