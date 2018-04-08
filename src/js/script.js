'use strict'

const params = function() {
  let vars = [], hash
  const hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&')

  for (let i = 0, length = hashes.length; i < length; i++) {
    hash = hashes[i].split('=')
    vars.push(hash[0])
    // support param without value
    vars[hash[0]] = hash[1] || true
  }

  // default: state is `'open'`
  if (typeof vars['state'] === 'undefined') {
    vars['state'] = 'open'
  }
  // default: limit is `'1'`
  if (typeof vars['limit'] === 'undefined') {
    vars['limit'] = '1'
  }
  // default: random is `'false'`
  if (typeof vars['random'] !== 'undefined') {
    vars['random'] = true
  }

  return vars
}

function loadJSONP(path, callbackName) {
  const
    head = document.getElementsByTagName('head')[0],
    el = document.createElement('script')

  el.src = `${path}&callback=${callbackName}`

  head.insertBefore(el, head.firstChild)
}

function shuffle(array) {
  let
    m = array,
    t,
    i

  while (m) {
    i = Math.floor(Math.random() * m--)
    t = array[m]
    array[m] = array[i]
    array[i] = t
  }

  return array
}

function APICallback(results) {
  const
    content = document.getElementById('js-main-content'),
    resultDataList = params['random'] ? shuffle(results.data) : results.data,
    ul = document.createElement('ul'),
    paramLimit = parseInt(params['limit'], 10),
    limit = Math.min(paramLimit, resultDataList.length)

  for (let i = 0; i < limit; i++) {
    const
      issue = resultDataList[i],
      li = document.createElement('li'),
      a = document.createElement('a')

    a.href = issue.html_url
    a.textContent = issue.title
    a.setAttribute('target', '_blank')
    li.appendChild(a)
    ul.appendChild(li)
  }

  content.appendChild(ul)
}

(function main() {
  // https://developer.github.com/v3/issues/#list-issues-for-a-repository
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

  const isAPPIQueryKey = (key) => {
    return APIQueryKeyList.indexOf(key) !== -1
  }

  // key=value
  const APIQuery = Object.keys(params)
    .filter(isAPPIQueryKey)
    .map((key) => { `${key}=${params[key]}` })

  const APIEndPoint = `https://api.github.com/repos/${params.owner}/${params.repo}/issues?${APIQuery.join('&')}`
  loadJSONP(APIEndPoint, 'APICallback')
})()
