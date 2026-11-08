import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getSupabase } from '@/lib/supabase'

type AttendanceRecord = {
  id: string
  clock_in: string
  clock_out: string | null
}

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
})
const timeFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false,
})

function formatWorkingTime(record: AttendanceRecord) {
  if (!record.clock_out) return '勤務中'
  const minutes = Math.floor((new Date(record.clock_out).getTime() - new Date(record.clock_in).getTime()) / 60_000)
  return `${Math.floor(minutes / 60)}時間${minutes % 60}分`
}

export function AttendanceList() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const supabase = getSupabase()
        const { data, error: queryError } = await supabase
          .from('attendances')
          .select('*')
          .order('clock_in', { ascending: false })
        if (!active) return
        if (queryError) setError('勤怠記録を読み込めませんでした。')
        else setRecords(data ?? [])
      } catch (error) {
        if (active) setError(error instanceof Error ? error.message : '勤怠記録を読み込めませんでした。')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [])

  return (
    <Card>
      <CardHeader className="gap-4">
        <h1 className="text-xl font-semibold">勤怠一覧</h1>
        <p className="text-muted-foreground">出勤・退勤の記録を確認できます。</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Table className="min-w-[480px]">
          <TableCaption>勤怠記録（{records.length}件）</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">日付</TableHead>
              <TableHead scope="col">出勤時刻</TableHead>
              <TableHead scope="col">退勤時刻</TableHead>
              <TableHead scope="col" className="text-left">勤務時間</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="h-40">読み込み中…</TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="h-40 whitespace-normal">勤怠記録はまだありません。</TableCell></TableRow>
            ) : records.map((record) => (
              <TableRow key={record.id} className="tabular-nums">
                <TableCell><time dateTime={record.clock_in}>{dateFormatter.format(new Date(record.clock_in))}</time></TableCell>
                <TableCell><time dateTime={record.clock_in}>{timeFormatter.format(new Date(record.clock_in))}</time></TableCell>
                <TableCell>{record.clock_out ? <time dateTime={record.clock_out}>{timeFormatter.format(new Date(record.clock_out))}</time> : '勤務中'}</TableCell>
                <TableCell className="text-left">{formatWorkingTime(record)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs leading-relaxed text-muted-foreground">勤務時間は出勤日時と退勤日時の差から計算します。</p>
      </CardContent>
    </Card>
  )
}
