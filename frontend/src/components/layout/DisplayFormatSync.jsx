import { useEffect } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { setGlobalShowDecimals } from '../../utils/format'

/**
 * Keeps amount fraction digits aligned with the "Show decimals" realm setting.
 */
export default function DisplayFormatSync() {
  const { data: settings } = useSettings()

  useEffect(() => {
    if (!settings) return
    setGlobalShowDecimals(settings.show_decimals)
  }, [settings])

  return null
}
