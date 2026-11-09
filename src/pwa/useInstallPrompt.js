import { useCallback, useEffect, useRef, useState } from 'react'

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    window.navigator.standalone === true
  )
}

export function useInstallPrompt() {
  const promptEvent = useRef(null)
  const [canInstall, setCanInstall] = useState(false)
  const [installed, setInstalled] = useState(() => isStandalone())

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault()
      promptEvent.current = event
      setCanInstall(true)
    }
    const onAppInstalled = () => {
      promptEvent.current = null
      setInstalled(true)
      setCanInstall(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    const event = promptEvent.current
    if (!event) return null
    promptEvent.current = null
    setCanInstall(false)
    await event.prompt()
    const choice = await event.userChoice
    return choice?.outcome ?? null
  }, [])

  return { canInstall, installed, install }
}
