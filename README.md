nodejs-book-best-practice
=========================

Node.js new version Book, the Best Practice

### Generator

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
