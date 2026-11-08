import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getSupabase } from '@/lib/supabase'

const tokyoMonth = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit',
})

export function MonthlySummary() {
  const [today] = useState(() => new Date())
  const [recordCount, setRecordCount] = useState(0)
  const [totalMilliseconds, setTotalMilliseconds] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const month = tokyoMonth.format(today)
  const [year, monthNumber] = month.split('-').map(Number)
  const start = new Date(Date.UTC(year, monthNumber - 1, 1) - 9 * 60 * 60 * 1000).toISOString()
  const end = new Date(Date.UTC(year, monthNumber, 1) - 9 * 60 * 60 * 1000).toISOString()

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const supabase = getSupabase()
        const { data, error: queryError } = await supabase
          .from('attendances')
          .select('*')
          .gte('clock_in', start)
          .lt('clock_in', end)
        if (!active) return
        if (queryError) setError('今月の勤怠記録を読み込めませんでした。')
        else {
          const records = data ?? []
          setRecordCount(new Set(records.map(record => new Intl.DateTimeFormat('sv-SE', {
            timeZone: 'Asia/Tokyo',
          }).format(new Date(record.clock_in)))).size)
          setTotalMilliseconds(records.reduce((total, record) => (
            record.clock_out
              ? total + new Date(record.clock_out).getTime() - new Date(record.clock_in).getTime()
              : total
          ), 0))
        }
      } catch (error) {
        if (active) setError(error instanceof Error ? error.message : '勤怠記録を読み込めませんでした。')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [start, end])

  const totalMinutes = Math.floor(totalMilliseconds / 60_000)

  return (
    <Card>
      <CardHeader className="gap-4">
        <h1 className="text-xl font-semibold">今月のまとめ</h1>
        <p className="text-muted-foreground">{new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'long' }).format(today)}の勤務状況</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-4 rounded-lg bg-muted/50 p-4">
            <dt className="text-sm text-muted-foreground">出勤日数</dt>
            <dd className="text-2xl font-semibold tabular-nums">{loading ? '—' : recordCount}<span className="ml-1 text-sm font-normal">日</span></dd>
          </div>
          <div className="space-y-4 rounded-lg bg-muted/50 p-4">
            <dt className="text-sm text-muted-foreground">合計勤務時間</dt>
            <dd className="text-2xl font-semibold tabular-nums">{loading ? '—' : <>{Math.floor(totalMinutes / 60)}<span className="mx-1 text-sm font-normal">時間</span>{totalMinutes % 60}<span className="ml-1 text-sm font-normal">分</span></>}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
