nodejs-book-best-practice
=========================

Node.js new version Book, the Best Practice
Node.js 實戰手冊，中文完整 Node.js 開發手冊，從基礎教學到 Framework 教學，讓學習者可以快速上手。

## Convention

開發此書籍務必遵循 (Node.js 語法規則)[!] 。

### Generator

本書採用 Pandoc 編譯，可以透過 Pandoc 進行資料編譯，當然你也可以選擇直接透過 (輸出檔案)[！] 直接進行下載。

#### Installaction

```bash
$ git clone git@github.com:nodejs-tw/new-website.git
$ cd new-website
$ npm i
```

#### Config

```json
{
  "generator": {
    "[名稱]": {
      "template": "[Template 檔案（Jade）]",
      "source": "[Markdown  檔案來源]",
      "destination": "[輸出目錄]"
    }
  }
}
```

#### Command

```bash
$ node ./tools/generator/index.js [名稱1] [名稱2]
```

or

```bash
$ npm run gen
```
