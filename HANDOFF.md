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

## ✅ デプロイ状態（2026-05-31 本番反映済み・最新）
- **最新コミット `fd73c3c`** を `origin/main` へ push 済み（`f5144da..fd73c3c`、PUSH_EXIT=0）。本番スモーク合格（HTTP200 / VOCATION_MATRIX・classifyAxes・computeVocation 全存在）。
  - `fd73c3c` 反映: (1)3軸を値で正典分類(1,4,7自分/2,5,8他人/3,6,9導き=マンダラ縦列一致)。classifyAxes(r)で3軸カード/レポート3軸章/3軸レーダー図を統一。※克服数・挑戦数も含めたまま(坂本さん承認)。(2)天職2マトリクス機能=系統A運命数(社会×成長)/系統B成熟数(社会×人格)の重ね読みで共通職種を天職コア提示。運命数1-6は成熟数代用。data/vocation-matrix.json(全55セルにdesc解説文+keywords)をJS定数化。メイン職業適性+精密レポートpr-ch-career に反映、.voc-sectionでデザイン統一。
  - 元データ: ワークブック「THE MATRIX CODE」(Lina Eda)天職章 IMG_3401-3412。OCR全文は /tmp/suuhi_ocr/。HEIC原本は gdrive:数秘データ(172枚)。
- 旧 **`f5144da`**（精密レポートRIO設計フル刷新: 表紙/タイポ/章番号/カード階層/引用/チャート図/マンダラ図/相性図SVG/3軸レーダー図/個人年円図）も本番反映済み。
- デプロイ履歴（古い順）: `6b25ddc`(マンダラ影響力★/+10/+15/メインチャート影響力色) → `5b01103`(精密レポート深掘り: 内なる力学/行動提言/13000字) → `7f9ef79`(精密レポートRIO設計フル刷新)。
- `7f9ef79` 反映内容: 精密レポートに表紙(#pr-cover)・タイポ階層(本文16px/行間1.8)・章番号・重点章/結びカード・引用ブロック・数秘チャート図/マンダラ図(html2canvas)・**相性図SVG(共鳴スコア)**・**3軸レーダー図SVG**・**個人年サイクル円図SVG**。内なる力学章を各数章直後へ移動。
- 本番実機(花子2000-1-1,相性1985/5/20)検証: cover/axes/pyear/compat 全Y・図4種・本文約15000字・console0・overflowX0。
- 6ポジ個別色(上品ダスティ): 運命=ダスティ藤/成熟=くすみ金/成長=セージ/誕生=青磁/社会=くすみティール/克服=ダスティローズ。★影響力バッジ併存。
- 規律: main直pushは坂本さん明示承認(「今すぐデプロイ」)時のみ。3証拠(SHA・pushログ・本番スモーク)を必ず添付。勝手な機能追加(別ページ/印刷/英語化を一度捏造実装し叱責)は厳禁=指示範囲のみ実装。

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
