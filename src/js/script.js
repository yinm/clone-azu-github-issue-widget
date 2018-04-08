'use strict'

const params = (() => {
  let vars = []
  let hash

  const hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&')

  for (let i = 0, length = hashes.length; i < length; i++) {
    hash = hashes[i].split('=')
    vars.push(hash[0])
    // support param without value
    vars[hash[0]] = hash[1] || true
  }

  if (typeof vars['state'] === 'undefined') {
    vars['state'] = 'open'
  }

  if (typeof vars['random'] === 'undefined') {
    vars['limit'] = '1'
  }

  if (typeof vars['random'] !== 'undefined') {
    vars['random'] = true
  }

  return vars
})()

function loadJSONP(path, callbackName) {
  const head = document.getElementsByTagName('head')[0]
  const element = document.createElement('script')
  element.src = `${path}&callback=${callbackName}`
  head.insertBefore(element, head.firstChild)
}

function shuffle(array) {
  let m = array.length
  let t
  let i

  while (m) {
    i = Math.floor(Math.random() * m--)
    t = array[m]
    array[m] = array[i]
    array[i] = t
  }

  return array
}

function APICallback(results) {
  const content = document.getElementById('js-main-content')
  const resultDataList = params['random'] ? shuffle(results.data) : results.data
  const ul = document.createElement('ul')
  const paramLimit = parseInt(params['limit'], 10)
  const limit = Math.min(paramLimit, resultDataList.length)
  for (let i = 0; i < limit; i++) {
    const issue = resultDataList[i]
    const li = document.createElement('li')
    const a = document.createElement('a')
    a.href = issue.html_url
    a.textContent = issue.title
    a.setAttribute('target', '_blank')
    li.appendChild(a)
    ul.appendChild(li)
  }

  content.appendChild(ul)
}

(function main() {
  const APIQueryKeyList = [
    'milestone',
    'state',
    'assignee',
    'creator',
    'mentioned',
    'labels',
    'sort',
    'direction',
    'since',
  ]

  const isAPIQueryKey = (key) => {
    return APIQueryKeyList.indexOf(key) !== -1
  }

  // key=value
  const APIQuery = Object.keys(params)
    .filter(isAPIQueryKey)
    .map((key) => { `${key}=${params[key]}` })

  // /repos/:owner/:repo/issues
  const APIEndPoint = `https://api.github.com/repos/${params.owner}/${params.repo}/issues?${APIQuery.join('&')}`
  loadJSONP(APIEndPoint, 'APICallback')
})()