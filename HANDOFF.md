# HANDOFF — 数秘AIライフコンパス

> 最終更新: 2026-05-31 / 次セッションは最初にこれを読む

## 本番URL / リポ
- 公開: https://kodawarimax.github.io/numerology-ai-compass/ （GitHub Pages, main push で反映）
- repo: kodawarimax/numerology-ai-compass / 本体は単一 `index.html`（HTML+JS+Tailwind CDN、ビルド不要）
- ローカル確認: `python3 -m http.server 8777 --directory <dir>` → http://localhost:8777/index.html（file://不可）

## このセッションで完成した内容（すべて坂本さん確認済み・✅）
1. **数秘チャート刷新**（列アンカー型ツリー＋運命数を社会数の真横にCSSブリッジ接続）RIO 95点
2. **マトリックスコード新4機能**: 職業適性 / 自分軸・他人軸・導き軸(3軸カード) / 他人との相性診断 / 個人年予報。RIO 95点
3. **数秘マンダラ 3×3グリッド**（230枚OCR・ワークブック正典由来）:
   - 盤面 **上段1·2·3 / 中段4·5·6 / 下段7·8·9**（坂本さん指示で転置済み）
   - 列ラベル（左→右）= **自分軸SELF(1·4·7,赤) / 他人軸SHARE(2·5·8,青) / 導き軸SPIRIT(3·6·9,金)**
   - 行ラベル = PLAN企画(1·2·3) / ARRANGE調整(4·5·6) / DEVELOP展開(7·8·9)
   - 四隅斜め = 達成(1·5·9) / 哲学(3·5·7)
   - 各軸に意味語付与、点灯=未保有opacity0.5/保有軸色(lit-1/2/3濃淡)、aria-label・role=dialog・Enter操作・凡例
   - 関連: `#card-mandala` / `renderMandala()` / `MANDALA_GRID=[[1,2,3],[4,5,6],[7,8,9]]` / `COL_AXES` / `ROW_AXES` / `NUM_LIT_CLS`
4. **ウェルカムモーダル修正**: カードに `max-h-[90vh] overflow-y-auto` 追加で「セッションを始める」ボタンが見切れる問題を解消
5. 全機能 console 0エラー / モバイル390px横溢れ0px を維持

## ⚠️ デプロイ状態（重要・未完了）
- **コミット `ee12507`（チャート刷新＋新4機能）まではローカルコミット済み**。
- **その後の差分（マンダラ実装・転置・文字情報付与・ウェルカム修正＝index.html +1160行相当）は未コミット・未push。**
- 本番(GitHub Pages)へは**未反映**。反映には commit + `git push origin main` が必要。
- ⚠️ 過去に main 直 push が Claude の安全分類器に拒否された経緯あり。デプロイ時は坂本さんの明示承認を取り、3証拠（コミットSHA・pushログ・本番URLスモークテスト）を添付すること。

## データ正典（SoT）
- wiki: `/Users/jungosakamoto/Claude/knowledge-empire/wiki/concepts/numerology/`
  - `11_numerology_mandala_3x3.md`（マンダラ定義・※盤面は転置前の旧表記なので要更新）
  - `data/numerology-dataset.json`（職業適性/相性/関係性9種/羅針盤キーワード等）
- アプリ側 `data/numerology-dataset.json` は **手編集禁止**（wiki→app 一方向同期）。新データはJS定数で持つ。
- マンダラ算出式は画像になく、既存アプリ算出値を盤面にマッピングする方式。

## 次セッションの選択肢
- A) 本番デプロイ（承認後 commit+push、3証拠付き報告）
- B) さらにUX磨き（RIO最終採点）
- C) 未実装の正典コンセプト（日橋数/カルマ数/セフィロト等。前回の表参照）

## 教訓（このセッション）
- 完了通知(task-notification)が来るまでスコアや結果を確定扱いしない。実行中outputファイルの途中状態を成果と誤認しない。
- RIOの95点固定ループは消耗が大きい。実用水準到達後は1回採点 or ユーザー判断を仰ぐ。
- Playwrightスクショの保存先は環境依存で読めないことがある→DOM実測(computedStyle/getBoundingClientRect)で検証する方が確実。
