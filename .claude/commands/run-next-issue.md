---
description: 次のissueを処理します [/run-next-issue]
allowed-tools: Write, Read, LS
---

# run-next-issue

## 目的
- https://github.com/pppp606/ink-chart/issues/1 から次のタスクを実行

### タスクの調査 (Task Tool使用)
- ghコマンドを利用して https://github.com/pppp606/ink-chart/issues/1 の内容を取得
- [✅ やること（TDD順 / マイクロコミット厳守）] から未処理のタスクを確認
- 一度のPRに最適な作業範囲の確定
- 作業内容をよく考えて調査
  - タスクを分割しリスト化（PRの詳細タスクに利用）

### PRの作成 (Task Tool使用)
1. 作業用のブランチを作成
2. ci skipでブランチをプッシュしPRを作成
3. 本文に含める要素:
   - Background & Purpose
   - Detailed Task List（タスクの調査で作成した分割しリスト）
   - Acceptance Criteria

### 作業 (Task Tool使用)
- https://github.com/pppp606/ink-chart/issues/1 のルールを復唱
- PRの詳細タスクリストに沿って作業
- 完了したタスクにチェックを入れる
- 全ての作業完了後に品質チェック(test,lint)
- 品質に問題がなければプッシュ
- ユーザーに報告しレビューを待つ
