import { useTuesdayCheck } from '@/composables/useTuesdayCheck'

describe('useTuesdayCheck', () => {
  afterEach(() => vi.useRealTimers())

  it('isTuesday is true when the system time is a Tuesday', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-09T12:00:00')) // Tuesday

    const { isTuesday } = useTuesdayCheck()
    expect(isTuesday.value).toBe(true)
  })

  it('isTuesday is false when the system time is a Monday', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-08')) // Monday

    const { isTuesday } = useTuesdayCheck()
    expect(isTuesday.value).toBe(false)
  })
})
