export const CacheControls = {
  PRIVATE_MAXAGE_0: 'private, max-age=0'
}

export const ContentTypes = {
  TEXT_XML_UTF8: 'text/xml; charset=utf-8'
}

export const Headers = {
  CACHE_CONTROL: 'Cache-Control',
  CONTENT_TYPE: 'Content-Type'
}

export const uuid = () => {
  let dt = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0
      dt = Math.floor(dt / 16)
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    }
  )
  return uuid
}
