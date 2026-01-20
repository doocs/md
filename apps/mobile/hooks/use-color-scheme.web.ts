import { useSyncExternalStore } from 'react'
import { useColorScheme as useRNColorScheme } from 'react-native'

const emptySubscribe = () => () => {}

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )

  const colorScheme = useRNColorScheme()

  return hasHydrated ? colorScheme : 'light'
}
