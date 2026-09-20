import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'

/** Mouse: kéo sau 8px. Touch: giữ ~200ms để vẫn vuốt được list/board. */
export function useAppDndSensors() {
  return useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )
}
