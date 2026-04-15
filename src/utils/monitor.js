export function trackEvent(eventName, payload = {}) {
  const event = {
    eventName,
    payload,
    timestamp: Date.now(),
    userAgent: navigator.userAgent
  }
  console.log('[Monitor]', event)
  if (window.__database__) {
    window.__database__.insert(event)
  }
}

export function trackOperation(module, action, detail = {}) {
  const record = {
    module,
    action,
    detail,
    timestamp: Date.now()
  }
  console.log('[OpLog]', record)
  if (window.__database__) {
    window.__database__.insertOperation(record)
  }
}