import { createProxy } from '@vitest/proxy'


config.transformers.push(async (source, id, options) => {
  if (id.startsWith('https:')) {
    // Intercept https: URLs
    return createProxy(source, id, options)
  }
  return source
})