# Retro Tetris - 80年代風テトリス

このリポジトリは、80年代のレトロゲームスタイルで作られたテトリスゲームです。

## 🎮 ゲーム特徴

- **クラシックなテトリス**: 完全な10x20ゲームボードでオリジナルのテトリス体験
- **80年代レトロスタイル**: ネオンカラー、CRTモニター効果、スキャンライン
- **Korobeiniki音楽**: Web Audio APIで生成されるクラシックなテトリステーマ
- **7種類のテトロミノ**: I, O, T, S, Z, J, L ピース
- **レスポンシブデザイン**: モバイルデバイス対応

## 🕹️ 操作方法

- `←` `→` : ピースを左右に移動
- `↓` : ソフトドロップ（高速落下）
- `↑` : ピース回転
- `SPACE` : ハードドロップ（即座に落下）
- `P` : ポーズ/再開

## 🚀 使い方

1. `src/index.html` をブラウザで開くだけ！
2. "START" ボタンをクリックしてゲーム開始
3. レトロな80年代の世界でテトリスを楽しもう

## 🛠️ 技術スタック

- **HTML5**: セマンティックなマークアップとCanvas API
- **TailwindCSS**: CDNから読み込み、レスポンシブスタイリング
- **JavaScript ES6**: モダンなJavaScript、Web Audio API
- **CSS3**: カスタムアニメーション、CRT効果、ピクセルアート風スタイリング

## 📁 ファイル構成

```
src/
├── index.html      # メインのHTMLファイル
├── css/
│   └── styles.css  # レトロスタイリング
└── js/
    └── script.js   # ゲームロジック
```

## 🎨 ビジュアル特徴

- **Orbitronフォント**: 未来的なレトロフォント
- **ネオングロー効果**: テキストとボーダーの光る効果
- **グラデーション背景**: アニメーション付き背景
- **CRTモニター効果**: 曲面ディスプレイ風
- **スキャンライン**: ブラウン管TV風のライン効果
- **ピクセルパーフェクト**: ドット絵風の描画

## 🎵 音楽

- **Korobeiniki**: ロシア民謡をベースにしたクラシックなテトリステーマ
- **チップチューン**: Web Audio APIで生成するレトロなサウンド
- **ループ再生**: ゲーム中は継続的に音楽が流れます

## 💯 ゲーム機能

- **スコアシステム**: ライン消去でポイント獲得
- **レベルアップ**: 10ライン毎にレベルと速度が上昇
- **ネクストピース**: 次のピースのプレビュー表示
- **ポーズ機能**: ゲームの一時停止と再開
- **ゲームオーバー**: 敗北時の美しいオーバーレイ

## 🌐 ブラウザ対応

モダンブラウザ（Chrome, Firefox, Safari, Edge）で動作確認済み

必要な機能:
- HTML5 Canvas
- Web Audio API  
- ES6 JavaScript
- CSS3 アニメーション

## 📄 ライセンス

このプロジェクトはデモ目的で作成されています。
