import { useFiestaMode } from '@/composables/useFiestaMode'

describe('useFiestaMode', () => {
  afterEach(() => vi.useRealTimers())

  it('isActive is true when it is a Tuesday', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-09T12:00:00')) // Tuesday

    const { isActive } = useFiestaMode()
    expect(isActive.value).toBe(true)
  })

  it('isActive is false when it is not a Tuesday', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-08')) // Monday

    const { isActive } = useFiestaMode()
    expect(isActive.value).toBe(false)
  })
})
