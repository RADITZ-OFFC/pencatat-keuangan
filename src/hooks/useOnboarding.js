import { useState } from 'react'

const KEY = 'pencatat_onboarded'

export function useOnboarding() {
  const [done, setDone] = useState(() => localStorage.getItem(KEY) === 'true')

  const finish = () => {
    localStorage.setItem(KEY, 'true')
    setDone(true)
  }

  return { onboardingDone: done, finishOnboarding: finish }
}
