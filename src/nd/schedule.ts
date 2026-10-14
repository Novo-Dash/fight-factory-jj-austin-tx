import { useEffect, useState } from 'react'
import { unitOf } from './config'
import { fetchPrograms, type Program } from './programs'
import type { Audience } from './types'

// Schedule section of the LP: the same live list as the modal (the app's schedule, edited by the
// team and by the AI calendar agent), so both change together. Weekly grid, Monday first.

export type ScheduleEntry = { program: Program; from: string; to: string | null }
export type ScheduleDay = { day: number; name: string; entries: ScheduleEntry[] }

const NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function weeklySchedule(programs: Program[]): ScheduleDay[] {
  return [1, 2, 3, 4, 5, 6, 0].map((day) => ({
    day,
    name: NAMES[day],
    entries: programs
      .flatMap((program) => program.weekly.filter((w) => w.day === day).map((w) => ({ program, from: w.from, to: w.to })))
      .sort((a, b) => a.from.localeCompare(b.from)),
  }))
}

/** `status` loading | ready | error; `days` Monday..Sunday (days with no class keep an empty list). */
export function useSchedule({ audience, unit }: { audience?: Audience | null; unit?: string } = {}) {
  const [state, setState] = useState<{ status: 'loading' | 'ready' | 'error'; days: ScheduleDay[] }>({ status: 'loading', days: [] })
  useEffect(() => {
    let alive = true
    fetchPrograms(audience, unitOf(unit))
      .then((programs) => alive && setState({ status: 'ready', days: weeklySchedule(programs) }))
      .catch(() => alive && setState({ status: 'error', days: [] }))
    return () => {
      alive = false
    }
  }, [audience, unit])
  return state
}
