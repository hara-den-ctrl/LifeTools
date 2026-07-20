# 健康コンシェルジュ Ver0.7

LifeTools向けの食事・買い物・健康記録Webアプリです。

## Ver0.7の追加機能

- iPhone・PC共通の自動更新
- `version.json`をキャッシュせず確認
- 新バージョン検出時の更新通知
- 自動更新が有効な場合は数秒後に更新
- 手動の「今すぐ更新」と「あとで」
- 古いHealthToolsキャッシュの自動削除
- Service Workerの即時切替
- 設定画面
- 更新履歴
- 画面右上とフッターへVer0.7を表示

## アップロード方法

ZIPを解凍し、中にある次のファイルをLifeToolsリポジトリ直下へすべて上書きアップロードします。

- README.md
- UPLOAD_CHECK.txt
- app.js
- icon.svg
- index.html
- manifest.webmanifest
- service-worker.js
- styles.css
- version.json

今回はフォルダを使わず、`icon.svg`もリポジトリ直下へ配置しています。

## 自動更新の仕組み

アプリ起動時・オンライン復帰時・画面復帰時に`version.json`を確認します。
新しいバージョンがある場合は更新通知を表示し、自動更新が有効なら新しいキャッシュを取得して再起動します。

## 重要

Ver0.7を最初に反映するときだけ、iPhoneにVer0.6の古いキャッシュが残っている場合があります。
Safariで最新版が表示された後は、Ver0.7以降の更新機能が働きます。

## 免責

健康評価や予測レンジは参考情報です。医療診断、血糖測定、血液検査の代替ではありません。
