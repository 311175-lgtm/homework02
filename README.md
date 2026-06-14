# homework02

## To-Do List 專案

這是一個進階版瀏覽器 To-Do List，支援：

- 新增 / 修改 / 刪除待辦事項
- 任務分類、狀態流程、優先級、預估時數、標籤與到期日
- 篩選、排序、週回顧與日曆匯出
- Quote API 自動新增任務
- Google Apps Script + Google Spreadsheet 同步備援
- GitHub Pages 部署

## 功能說明

### 表單欄位
- `分類`：學業類、開發類、生活類
- `狀態`：待處理、進行中、阻塞中、待驗證、完成
- `優先級`：使用艾森豪矩陣，幫助你區分重要／緊急
- `預估時數`：支援 0.5 小時單位
- `標籤`：情境標籤，例如 `#有空檔`、`#精神集中時`
- `到期日`：可輸出為日曆事件

### 進階功能
- 篩選：依分類、狀態、優先級、關鍵字搜尋
- 排序：最新建立、到期日、優先級、狀態
- 週回顧：顯示過去 7 天完成任務與預估時數
- 日曆匯出：將到期任務輸出為 `todolist.ics`
- 本地備援：若沒有設定 GAS，仍會使用 localStorage 保存資料

## 使用方式

1. 開啟 `docs/index.html`（或 GitHub Pages 網站）
2. 填寫任務並新增
3. 若要同步 Google Spreadsheet，先設定 `docs/js/gas.js` 的 `GAS_BASE_URL`

## Google Apps Script 設定

1. 建立新的 Google Apps Script 專案
2. 建立 Spreadsheet 並新增欄位：
   `ID,Task,Status,CreateTime,Category,Priority,Estimate,Tags,DueDate,Completed,CompletedAt`
3. 將 `docs/GAS_Code.gs` 貼到 Apps Script 編輯器
4. 在 `GAS_BASE_URL` 填入部署後的 Web App URL
5. 部署為「任何人，包括匿名使用者」

## 部署

已將專案推送至 GitHub。若使用 GitHub Pages請確認源為 `docs/` 資料夾。

本機測試可用：

```bash
python3 -m http.server 8000
```

並開啟： `http://localhost:8000/docs/`
