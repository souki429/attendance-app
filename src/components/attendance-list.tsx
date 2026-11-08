import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { records, type AttendanceRecord } from '@/data/attendance'

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
})
const timeFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false,
})

function formatWorkingTime(record: AttendanceRecord) {
  if (!record.clockOut) return '未確定'
  const minutes = Math.floor((new Date(record.clockOut).getTime() - new Date(record.clockIn).getTime()) / 60_000)
  return `${Math.floor(minutes / 60)}時間${minutes % 60}分`
}

export function AttendanceList() {
  const [showEmpty, setShowEmpty] = useState(false)
  const visibleRecords = showEmpty ? [] : records

  return (
    <Card>
      <CardHeader className="gap-4">
        <h1 className="text-xl font-semibold">勤怠一覧</h1>
        <p className="text-muted-foreground">自分の出勤・退勤の記録を確認できます。</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex w-fit cursor-pointer items-center gap-4 text-sm text-muted-foreground">
          <input type="checkbox" checked={showEmpty} onChange={(event) => setShowEmpty(event.target.checked)} className="size-4 accent-primary" />
          記録0件の表示を確認（デモ）
        </label>
        <Table className="min-w-[480px]">
          <TableCaption>自分の勤怠記録（ダミーデータ・{visibleRecords.length}件）</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">日付</TableHead>
              <TableHead scope="col">出勤時刻</TableHead>
              <TableHead scope="col">退勤時刻</TableHead>
              <TableHead scope="col" className="text-left">勤務時間</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 whitespace-normal text-left">
                  <p className="font-medium">勤怠記録はまだありません</p>
                  <p className="mt-2 text-muted-foreground">出勤・退勤の記録があると、ここに表示されます。</p>
                </TableCell>
              </TableRow>
            ) : visibleRecords.map((record) => (
              <TableRow key={record.id} className="tabular-nums">
                <TableCell><time dateTime={record.clockIn}>{dateFormatter.format(new Date(record.clockIn))}</time></TableCell>
                <TableCell><time dateTime={record.clockIn}>{timeFormatter.format(new Date(record.clockIn))}</time></TableCell>
                <TableCell>{record.clockOut ? <time dateTime={record.clockOut}>{timeFormatter.format(new Date(record.clockOut))}</time> : '未確定'}</TableCell>
                <TableCell className="text-left">{formatWorkingTime(record)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs leading-relaxed text-muted-foreground">勤務時間は退勤日時と出勤日時の差です。打刻画面のデモ記録とは連動していません。</p>
      </CardContent>
    </Card>
  )
}
