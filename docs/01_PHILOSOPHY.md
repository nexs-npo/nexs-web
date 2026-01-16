# **01. Development Philosophy**

**Ver 1.1**

次世代社会デザイン研究機構（nexs）のWebプロダクト開発における意思決定の基準と、技術的な指針。

本プロジェクトにおいて、技術的判断に迷った際は本ドキュメントの優先順位に従うこと。

## **1. Core Values (優先順位)**

### **1st. 安全と信頼 (Safety & Trust)**

**「持たない」ことによる究極の安全を追求する。**

* **Zero PII Strategy:** 自宅サーバー（Self-Hosted DB）には、氏名・メールアドレス・パスワード等の個人情報（PII）を一切保存しない。
* **Risk Isolation:** 認証と個人管理は、堅牢な外部SaaS（Clerk）に委任する。万が一サーバーが侵害されても、流出するのは「公開済みの議論データ」と「無意味なID文字列」のみとする。
* **Transparency:** 障害発生時やダウン時は、隠さずその原因と復旧プロセスをコンテンツ化し、信頼の糧とする。

### **2nd. Open Source (Public Code)**

**コードもまた、社会への還元物である。**

* **Open by Default:** 原則として、ソースコード、ドキュメント、課題管理（Issues）は全て公開（Public Repository）とする。「隠すことで守るセキュリティ（Security by Obscurity）」には依存しない。
* **Secrets Discipline:** APIキー、接続文字列、トンネル認証情報などの「秘密情報（Secrets）」は、コードにいかなる形でもハードコードしない。必ず環境変数（.env）またはシークレット管理機能を使用する。
* **Reproducibility:** 第三者がこのリポジトリをForkし、自分の環境でnexsのシステム（または同様の社会実験）を再現・構築できるように設計する。

### **3rd. UX (User Experience for Humans & AI)**

**人間とAI、双方にとっての「読みやすさ」を設計する。**

* **Mobile First:** スマートフォンでの閲覧・操作体験を最優先する。PC版はその拡張に過ぎない。
* **Performance:** Astroによる静的生成（SSG）を基本とし、爆速の表示速度を担保する。
* **AI-Readiness:** AIエージェントが情報を取得・解釈しやすい構造（/llms.txtの設置、セマンティックなHTML）を作る。
* **Noise Reduction:** 広告、過度な装飾、ポップアップを排除し、思考を妨げない。

### **4th. 開発のしやすさ (Developer Experience)**

**AIとの協働を前提とした、疎結合なアーキテクチャ。**

* **Isolation (疎結合):** 機能（コンポーネント）間の依存関係を極限まで減らす。ある機能の修正が、予期せぬ他所への影響を与えないようにする。
* **Context Optimization:** 生成AI（Coding Assistant）に一度に渡すコンテキストが小さくて済むよう、ファイルやモジュールを適切に分割する。
* **Resilience:** 一部の機能（例：自宅サーバーの議論機能）がダウンしても、サイト全体（静的ページ）は生き残り続ける設計にする。

### **5th. コードの効率性 (Code Efficiency)**

**効率性低下の許容。**

* **WET over DRY:** 過度な共通化（DRY原則の徹底）によってコードが複雑になるくらいなら、多少の冗長性（WET: Write Everything Twice）やファイルの重複を許容する。
* **Overhead Acceptance:** 疎結合を維持するための通信オーバーヘッドや、ファイルサイズの増加は許容する。

## **2. AI-Readiness Guidelines**

「AIと一緒にWEBを見る時代」に向けた実装指針。

1. **専用エンドポイント (/llms.txt):** 人間用のHTMLとは別に、AIエージェントがサイト構造とコンテンツを効率よく学習・参照できるためのMarkdownファイルを配置する。
2. **セマンティックなマークアップ:** div ではなく article, section, nav を適切に使用する。
3. **構造化データ:** JSON-LDを用いてプロジェクト情報を機械可読にする。
