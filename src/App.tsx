import { useState } from 'react'
import { useEffect } from 'react'
import { LogIn, LogOut } from 'lucide-react'
import { AuthScreen } from '@/components/auth-screen'
import { getSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AttendanceList } from '@/components/attendance-list'
import { MonthlySummary } from '@/components/monthly-summary'
import { useRoute } from '@/lib/routing'
import { buttonVariants } from '@/components/ui/button'

const dateFormatter = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'full' })
const timeFormatter = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
})

function App() {
  const route = useRoute()
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [clockIn, setClockIn] = useState<Date | null>(null)
  const [clockOut, setClockOut] = useState<Date | null>(null)
  const [clockLoading, setClockLoading] = useState(false)
  const [clockError, setClockError] = useState<string | null>(null)
  const [today] = useState(() => new Date())

  useEffect(() => {
    let active = true
    const supabase = getSupabase()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null)
    })
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) console.error('ログイン状態を取得できませんでした。', error)
      setUser(data.session?.user ?? null)
      setAuthLoading(false)
    }).catch((error: unknown) => {
      if (!active) return
      console.error('ログイン状態を取得できませんでした。', error)
      setAuthLoading(false)
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])
  useEffect(() => {
    if (!user) { setClockIn(null); setClockOut(null); return }
    let active = true
    setClockLoading(true)
    void (async () => {
      try {
        const { data, error } = await getSupabase().from('attendances').select('clock_in, clock_out')
          .eq('user_id', user.id).order('clock_in', { ascending: false }).limit(1).maybeSingle()
        if (!active) return
        if (error) setClockError(`打刻状態を読み込めませんでした: ${error.message}`)
        else if (data) { setClockIn(new Date(data.clock_in)); setClockOut(data.clock_out ? new Date(data.clock_out) : null) }
        else { setClockIn(null); setClockOut(null) }
      } catch (error) {
        if (active) setClockError(`打刻状態を読み込めませんでした: ${error instanceof Error ? error.message : '不明なエラー'}`)
      } finally {
        if (active) setClockLoading(false)
      }
    })()
    return () => { active = false }
  }, [user])
  const status = clockOut ? '退勤済み' : clockIn ? '出勤済み' : '未出勤'

  async function handleClockIn() {
    if (!user || clockIn || clockLoading) return
    setClockLoading(true); setClockError(null)
    const now = new Date()
    const { data, error } = await getSupabase().from('attendances').insert({ user_id: user.id, clock_in: now.toISOString() }).select('clock_in, clock_out').single()
    if (error) setClockError(`出勤を保存できませんでした: ${error.message}`)
    else { setClockIn(new Date(data.clock_in)); setClockOut(null) }
    setClockLoading(false)
  }

  async function handleClockOut() {
    if (!user || !clockIn || clockOut || clockLoading) return
    setClockLoading(true); setClockError(null)
    const now = new Date()
    const { data, error } = await getSupabase().from('attendances').update({ clock_out: now.toISOString() }).eq('user_id', user.id).is('clock_out', null).eq('clock_in', clockIn.toISOString()).select('clock_out').maybeSingle()
    if (error) setClockError(`退勤を保存できませんでした: ${error.message}`)
    else if (!data) setClockError('未退勤の出勤記録が見つからず、退勤を保存できませんでした。')
    else setClockOut(new Date(data.clock_out))
    setClockLoading(false)
  }

  return (
    <main className="min-h-svh bg-muted/30 p-4 text-left">
      <div className={`mx-auto min-w-0 space-y-4 ${route === '/records' || route === '/summary' ? 'max-w-3xl' : 'max-w-lg'}`}>
        <header className="flex items-center justify-between gap-4 text-left">
          <div className="space-y-4 text-left">
          <p className="text-sm text-muted-foreground">attendance-app</p>
          <p className="text-lg font-medium">
            <time dateTime={today.toLocaleDateString('sv-SE')}>
              {dateFormatter.format(today)}
            </time>
          </p>
          </div>
          {user && <Button variant="outline" onClick={() => { void getSupabase().auth.signOut() }}>ログアウト</Button>}
        </header>

        {authLoading ? <p role="status">ログイン状態を確認しています…</p> : !user ? <AuthScreen /> : <>
        {route === '/records' ? <AttendanceList /> : route === '/summary' ? <MonthlySummary /> : route !== '/' ? (
          <Card>
            <CardHeader><h1 className="text-xl font-semibold">ページが見つかりません</h1></CardHeader>
            <CardContent><a href="#/" className="underline underline-offset-4">打刻画面へ戻る</a></CardContent>
          </Card>
        ) : <Card className="ring-2 ring-blue-600/20">
          <CardHeader className="gap-4">
            <h1 className="text-2xl font-bold">今日の打刻</h1>
            <p className="text-muted-foreground">勤務を始めるとき・終えるときに打刻してください。</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div role="group" aria-label="今日の出勤・退勤" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Button className="h-20 w-full justify-start gap-4 border-2 border-blue-700 bg-blue-700 px-4 text-left text-xl font-bold text-white shadow-md hover:bg-blue-800 focus-visible:ring-blue-600 disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 disabled:shadow-none" disabled={clockLoading || clockIn !== null} onClick={handleClockIn}>
                <LogIn aria-hidden="true" className="size-6!" />
                出勤する
              </Button>
              <Button className="h-20 w-full justify-start gap-4 border-2 border-blue-700 bg-white px-4 text-left text-xl font-bold text-blue-800 shadow-md hover:bg-blue-50 focus-visible:ring-blue-600 disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 disabled:shadow-none" variant="outline" disabled={clockLoading || !clockIn || clockOut !== null} onClick={handleClockOut}>
                <LogOut aria-hidden="true" className="size-6!" />
                退勤する
              </Button>
            </div>
            {clockError && <p role="alert" className="text-sm text-destructive">{clockError}</p>}
            <section aria-label="今日の打刻状況" aria-live="polite" aria-atomic="true" className="space-y-4 rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium">{status}</p>
              <dl className="space-y-4 text-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <dt className="text-muted-foreground">出勤時刻</dt>
                  <dd className="font-medium tabular-nums">
                    {clockIn ? <time dateTime={clockIn.toISOString()}>{timeFormatter.format(clockIn)}</time> : '未打刻'}
                  </dd>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <dt className="text-muted-foreground">退勤時刻</dt>
                  <dd className="font-medium tabular-nums">
                    {clockOut ? <time dateTime={clockOut.toISOString()}>{timeFormatter.format(clockOut)}</time> : '未打刻'}
                  </dd>
                </div>
              </dl>
            </section>
            <p className="text-xs leading-relaxed text-muted-foreground">
              デモ用の打刻です。記録はページを再読み込みするとリセットされます。
            </p>
          </CardContent>
        </Card>}
        <nav aria-label="画面切り替え" className="flex flex-wrap justify-start gap-4 border-t pt-4">
          {[{ path: '/', label: '打刻' }, { path: '/records', label: '一覧' }, { path: '/summary', label: '今月のまとめ' }].map((item) => (
            <a key={item.path} href={`#${item.path}`} aria-current={route === item.path ? 'page' : undefined} className={buttonVariants({ variant: route === item.path ? 'secondary' : 'outline', className: 'min-h-11 px-4 text-left' })}>
              {item.label}
            </a>
          ))}
        </nav>
        </>}
      </div>
    </main>
  )
}

export default App
