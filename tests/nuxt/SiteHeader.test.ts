// tests/nuxt/SiteHeader.test.ts
// Contract tests for SiteHeader.vue — RED phase (component does not exist yet)
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect } from 'vitest'

describe('SiteHeader', () => {
  it('renders logo text from i18n (nav.logo)', async () => {
    const { default: SiteHeader } = await import('../../app/components/SiteHeader.vue')
    const wrapper = await mountSuspended(SiteHeader, {
      props: { lang: 'it' },
    })
    // Logo text should be present in the rendered output
    expect(wrapper.text()).toBeTruthy()
    expect(wrapper.exists()).toBe(true)
  })

  it('does NOT show back button when route path is "/" (root)', async () => {
    const { default: SiteHeader } = await import('../../app/components/SiteHeader.vue')
    const wrapper = await mountSuspended(SiteHeader, {
      props: { lang: 'it' },
      route: '/',
    })
    const backLink = wrapper.find('[data-back]')
    expect(backLink.exists()).toBe(false)
  })

  it('does NOT show back button when route path is "/it" (locale only)', async () => {
    const { default: SiteHeader } = await import('../../app/components/SiteHeader.vue')
    const wrapper = await mountSuspended(SiteHeader, {
      props: { lang: 'it' },
      route: '/it',
    })
    const backLink = wrapper.find('[data-back]')
    expect(backLink.exists()).toBe(false)
  })

  it('shows back button when route depth >= 2 (e.g. /it/rephrase)', async () => {
    const { default: SiteHeader } = await import('../../app/components/SiteHeader.vue')
    const wrapper = await mountSuspended(SiteHeader, {
      props: { lang: 'it' },
      route: '/it/rephrase',
    })
    const backLink = wrapper.find('[data-back]')
    expect(backLink.exists()).toBe(true)
  })

  it('back button links to parent path when on /it/rephrase', async () => {
    const { default: SiteHeader } = await import('../../app/components/SiteHeader.vue')
    const wrapper = await mountSuspended(SiteHeader, {
      props: { lang: 'it' },
      route: '/it/rephrase',
    })
    const backLink = wrapper.find('[data-back]')
    expect(backLink.attributes('href')).toBe('/it')
  })

  it('renders a locale switcher button/trigger', async () => {
    const { default: SiteHeader } = await import('../../app/components/SiteHeader.vue')
    const wrapper = await mountSuspended(SiteHeader, {
      props: { lang: 'it' },
    })
    const localeSwitcher = wrapper.find('[data-locale-switcher]')
    expect(localeSwitcher.exists()).toBe(true)
  })

  it('reset button is present in the DOM', async () => {
    const { default: SiteHeader } = await import('../../app/components/SiteHeader.vue')
    const wrapper = await mountSuspended(SiteHeader, {
      props: { lang: 'it' },
    })
    const resetButton = wrapper.find('[data-reset]')
    expect(resetButton.exists()).toBe(true)
  })
})
