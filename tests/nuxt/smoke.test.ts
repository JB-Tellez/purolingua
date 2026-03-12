// tests/nuxt/smoke.test.ts
// Validates @nuxt/test-utils wiring and that the index Vue page mounts.
// Source: https://nuxt.com/docs/4.x/getting-started/testing
// Note: app/pages/index.vue is created in Plan 02. Until then this test
// will fail to import — run with --project unit to skip it.
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'

describe('smoke', () => {
  it('index page mounts without error', async () => {
    const { default: IndexPage } = await import('../../app/pages/index.vue')
    const wrapper = await mountSuspended(IndexPage)
    expect(wrapper.exists()).toBe(true)
  })
})
