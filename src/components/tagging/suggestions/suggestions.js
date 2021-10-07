import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'linaria'

const suggestionsWrapper = css`
  box-sizing: border-box;
  display: block;
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  width: 100%;
`
const suggestionsList = css`
  display: flex;
  flex-wrap: wrap;
  list-style-type: none;
  margin: 0;
  padding: 10px 0 0;
  text-align: left;
`
const suggestionItem = css`
  background-color: var(--color-calloutBackgroundPrimary);
  border: 1px solid var(--color-calloutBackgroundPrimary);
  border-radius: 50px;
  color: var(--color-teal30);
  cursor: pointer;
  display: inline-block;
  font-size: 14px;
  line-height: 16px;
  margin-bottom: 4px;
  margin-right: 4px;
  padding: 8px;
  text-align: center;
  text-transform: lowercase;
  transform: translateZ(0.1);

  &:hover {
    border: 1px solid var(--color-grey10);
  }

  .pocket-theme-dark & {
    color: var(--color-white100);

    &:hover {
      border-color: var(--color-white100);
    }
  }
`

const SuggestionItem = ({ suggestion, addTag, used }) => {
  const prevent = (e) => e.preventDefault()

  const handleClick = (e) => {
    e.stopPropagation()
    addTag(suggestion)
  }

  return !used.includes(suggestion) ? (
    <li
      className={suggestionItem}
      onMouseDown={prevent}
      onClick={handleClick}
    >
      {suggestion}
    </li>
  ) : null
}

export const Suggestions = ({ addTag, suggestions, used }) => {
  return (
    <div className={suggestionsWrapper}>
      <ul className={suggestionsList}>
        {suggestions.map((suggestion, index) => (
          <SuggestionItem
            key={index}
            suggestion={suggestion}
            addTag={addTag}
            used={used}
          />
        ))}
      </ul>
    </div>
  )
}

Suggestions.propTypes = {
  suggestions: PropTypes.array,
  addTag: PropTypes.func,
  used: PropTypes.array
}
