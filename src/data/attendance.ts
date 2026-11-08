export type AttendanceRecord = {
  id: string
  employeeId: string
  clockIn: string
  clockOut: string | null
}

export const records: AttendanceRecord[] = [
  { id: '6', employeeId: 'demo-employee', clockIn: '2026-11-07T09:00:00+09:00', clockOut: null },
  { id: '5', employeeId: 'demo-employee', clockIn: '2026-11-06T09:15:00+09:00', clockOut: '2026-11-06T18:00:00+09:00' },
  { id: '4', employeeId: 'demo-employee', clockIn: '2026-11-05T08:45:00+09:00', clockOut: '2026-11-05T17:30:00+09:00' },
  { id: '3', employeeId: 'demo-employee', clockIn: '2026-11-04T09:00:00+09:00', clockOut: '2026-11-04T18:30:00+09:00' },
  { id: '2', employeeId: 'demo-employee', clockIn: '2026-11-03T09:30:00+09:00', clockOut: '2026-11-03T18:00:00+09:00' },
  { id: '1', employeeId: 'demo-employee', clockIn: '2026-11-02T09:00:00+09:00', clockOut: '2026-11-02T18:00:00+09:00' },
]

