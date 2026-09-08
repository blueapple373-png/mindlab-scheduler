# MINAMI MINDLAB Threads Scheduler

Google Sheetsの「投稿キュー」を正本にし、本人が完成投稿文を確認して `投稿承認=TRUE`、`状態=待機` にした行だけをThreadsへ送る構成です。投稿時にAI生成は行いません。VercelはApps Scriptの中継URLを呼び、Apps Scriptが対象スプレッドシートを読み書きします。

## 安全設計

- `POSTING_ENABLED=false` の間はThreadsへ投稿しない
- ブラウザにThreadsトークンを保存しない
- Googleサービスアカウント鍵を使わない
- Apps Script中継は `GAS_SECRET` で保護
- Cronは `CRON_SECRET`、管理画面は `DASHBOARD_SECRET` で保護
- 投稿直前に状態を `投稿中` にして二重投稿を抑制
- 成否を投稿キューと投稿履歴へ記録

## 必要な環境変数

`.env.example` を参照してください。初回確認までは必ず `POSTING_ENABLED=false` にします。

Vercel側に必要な値:

- `GAS_ENDPOINT_URL`
- `GAS_SECRET`
- `THREADS_ACCESS_TOKEN`
- `CRON_SECRET`
- `DASHBOARD_SECRET`
- `POSTING_ENABLED=false`

Apps Script側には、スクリプトプロパティとして同じ `GAS_SECRET` を保存します。中継コードは `gas/ThreadsQueueBridge.gs` を使います。

## Cron

`vercel.json` は毎日12:30 JST（03:30 UTC）に `/api/cron` を実行します。Vercel Cronは本番デプロイでのみ有効です。
