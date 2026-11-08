import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { records } from '@/data/attendance'

const dayFormatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' })

export function MonthlySummary() {
  const [today] = useState(() => new Date())
  const month = dayFormatter.format(today).slice(0, 7)
  const monthRecords = records.filter((record) => dayFormatter.format(new Date(record.clockIn)).startsWith(month))
  const days = new Set(monthRecords.map((record) => dayFormatter.format(new Date(record.clockIn)))).size
  const totalMilliseconds = monthRecords.reduce((total, record) => (
    record.clockOut ? total + new Date(record.clockOut).getTime() - new Date(record.clockIn).getTime() : total
  ), 0)
  const totalMinutes = Math.floor(totalMilliseconds / 60_000)

  return (
    <Card>
      <CardHeader className="gap-4">
        <h1 className="text-xl font-semibold">今月のまとめ</h1>
        <p className="text-muted-foreground">{new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long' }).format(today)}の勤務状況</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-4 rounded-lg bg-muted/50 p-4">
            <dt className="text-sm text-muted-foreground">出勤日数</dt>
            <dd className="text-2xl font-semibold tabular-nums">{days}<span className="ml-1 text-sm font-normal">日</span></dd>
          </div>
          <div className="space-y-4 rounded-lg bg-muted/50 p-4">
            <dt className="text-sm text-muted-foreground">合計勤務時間</dt>
            <dd className="text-2xl font-semibold tabular-nums">{Math.floor(totalMinutes / 60)}<span className="mx-1 text-sm font-normal">時間</span>{totalMinutes % 60}<span className="ml-1 text-sm font-normal">分</span></dd>
          </div>
        </dl>
        <p className="text-xs leading-relaxed text-muted-foreground">一覧と同じダミー記録を集計しています。出勤日時を基準に今月の記録を抽出し、退勤済みの記録だけを合計勤務時間に含めます。</p>
      </CardContent>
    </Card>
  )
}
