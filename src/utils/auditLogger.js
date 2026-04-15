export function logOperation(module, action, beforeDetail, afterDetail) {
  const entry = {
    timestamp: new Date().toISOString(),
    module,
    action,
    before: beforeDetail,
    after: afterDetail,
    operator: JSON.parse(sessionStorage.getItem('user') || '{"name":"未知"}').name || 'admin'
  }
  console.warn('[安全审计]', entry)
}