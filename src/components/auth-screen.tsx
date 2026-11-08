import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getSupabase } from '@/lib/supabase'

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const supabase = getSupabase()
      const { error, data } = mode === 'signup'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (mode === 'login') {
          setMessage('ログインに失敗しました')
          return
        }
        throw error
      }
      if (mode === 'signup' && !data.session) setMessage('確認メールを送信しました。メール内のリンクから登録を完了してください。')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '認証に失敗しました。')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="ring-2 ring-blue-600/20">
      <CardHeader className="gap-2">
        <h1 className="text-2xl font-bold">{mode === 'login' ? 'ログイン' : '新規登録'}</h1>
        <p className="text-muted-foreground">メールアドレスとパスワードを入力してください。</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <label className="block space-y-2 text-sm font-medium">
            メールアドレス
            <input className="flex h-11 w-full rounded-md border bg-background px-3 text-base" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            パスワード
            <input className="flex h-11 w-full rounded-md border bg-background px-3 text-base" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} required value={password} onChange={event => setPassword(event.target.value)} />
          </label>
          {message && <p role={mode === 'login' ? 'alert' : 'status'} className={`text-sm ${mode === 'login' ? 'text-destructive' : 'text-muted-foreground'}`}>{message}</p>}
          <Button type="submit" disabled={busy} className="w-full">{busy ? '処理中…' : mode === 'login' ? 'ログイン' : '登録する'}</Button>
          <button type="button" className="min-h-11 w-full text-sm underline underline-offset-4" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage('') }}>
            {mode === 'login' ? 'アカウントをお持ちでない方は新規登録' : 'アカウントをお持ちの方はログイン'}
          </button>
        </form>
      </CardContent>
    </Card>
  )
}
