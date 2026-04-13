# 解析レポート — AI Learning Platform Clone

## Source
- URL: https://ai-990267211963.us-west1.run.app/
- 解析日: 2026-04-12

## 技術スタック
- React 19.1.0 (ES Modules via esm.sh CDN)
- Tailwind CSS
- Google Generative AI (Gemini 2.5 Flash)
- jsPDF 2.5.1 + html2canvas 1.4.1
- marked 16.0.0

## 情報アーキテクチャ

```
App
├── Language Switcher (JA / EN)
├── Dashboard View
│   ├── Header (gradient bg)
│   │   ├── App Title
│   │   └── User Profile Summary
│   ├── Birth Date Input Form
│   │   ├── First Name (required)
│   │   ├── Last Name (optional)
│   │   ├── Email (optional)
│   │   ├── Birth Date (Year/Month/Day)
│   │   ├── Divination Date (optional)
│   │   ├── IT Knowledge Level (dropdown)
│   │   └── Gender (dropdown)
│   ├── Numerology Chart (matrix display)
│   │   ├── Life Path Number
│   │   ├── Destiny Number
│   │   ├── Maturity/Spirit/Ground/Persona Numbers
│   │   ├── Challenge Numbers (4 variants)
│   │   └── Personal Year/Month/Day cycles
│   ├── AI Skill Module Selection
│   │   └── 8 Learning Modules (grid cards)
│   └── XP / Gamification Status Bar
├── Learning Session View
│   ├── Question Display
│   ├── Answer Input
│   ├── AI Feedback (Gemini response)
│   ├── Progress Bar
│   └── XP Gain Animation
├── Modals
│   ├── Guidance Teaser
│   ├── Premium Plan
│   ├── Numerology Details
│   ├── AI Skill Selection
│   ├── PDF Page Editor
│   └── PDF Preview
└── PDF Report Export
```

## デザイン特徴
- モバイルファースト（max-w-md中心）
- ピンク→ローズのグラデーションCTA
- パープル/ピンク/インディゴの柔らかいグラデーション背景
- Lora書体（数秘術の数字表示に使用、クラシカルな印象）
- カードベースのUI、角丸(rounded-xl)、shadow-md
- ゲーミフィケーション要素（XPバー、レベルバッジ）

## クローン方針
- React SPAの視覚的再現をHTML + Tailwind CSで実装
- Dashboard View をメイン画面として完全再現
- Learning Module選択画面をグリッドカードで再現
- 数秘術チャートはCSS Gridで再現
- フォーム要素は機能的に実装（バリデーション含む）
- AI統合部分はモック/プレースホルダーで対応
