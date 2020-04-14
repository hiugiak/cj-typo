# 中日文排版工具

优化中日文网页的文字排版

## 背景

由于中文和日文都主要使用全角字符，包括汉字、假名和大部分标点符号。为了美观，需要调整连续出现的全角标点之间的间隔，具体规则参阅 [Requirements for Japanese Text Layout](https://www.w3.org/TR/jlreq/#positioning_of_consecutive_opening_brackets_closing_brackets_comma_full_stops_and_middle_dots) 以及[中文排版需求](https://www.w3.org/TR/clreq/#compression_rules_for_consecutive_punctuation_marks)。此外，全角字符（汉字与假名）和半角字符（拉丁字母与阿拉伯数字）之间，还需要增加额外的间隔。

本脚本的实现思路可以查阅文章：[中文网页实现标点挤压](https://blog.hiugiak.com/articles/implement-punctuation-compression-on-chinese-pages/)。

## 安装

本项目使用了 [node](http://nodejs.org/) 和 [npm](https://npmjs.com/)，使用前请确保已正确安装这两个软件。

```shell
$ git clone https://github.com/hiugiak/cj-typo.git
$ cd cj-typo
$ npm install
$ npm run build
```

编译后的文件可以在 `dist` 目录下找到。复制 `dist\` 下的文件到你的项目中，然后在 HTML 头部加入加入下面两个文件：

```html
<link href="cj-typo.css" rel="stylesheet">
<script src="cj-typo.min.js"></script>
```

## 使用

假设你要用简体中文的规则，优化所有 `.cj-typo` 类元素里的内容，执行下面 Javascript 代码：

```js
var cjTypo = new CJTypo({
  lang: CJTypo.Lang.SC
})
cjTypo.render('.cj-typo');
```

可将 `CJTypo.Lang.SC` 和 `.cj-typo` 替换为你自己的选项，具体查看[选项](#选项)一节。

要预览优化效果，可查看 [sample.html](sample.html) 文件。

**要求**：标点符号之间的间隔调整，需要字体支持 [OpenType 的“halt”特性](https://helpx.adobe.com/fonts/using/open-type-syntax.html#halt)。或者你也可以使用 [fonts](fonts) 文件夹里的字体。

## 选项

* lang: `CJTypo.Lang`

    **必需**。选择要应用哪套规则，`CJTypo.Lang.SC` 为简体中文，`CJTypo.Lang.TC` 为繁体中文，`CJTypo.Lang.JP` 为日文。

* includeLangCodes: `string[]`

    包含的语言代码。若是一个子元素的 `lang` 属性被设置为本选项之外的其他代码，该元素将被跳过。

    **Default**

    | lang | includeLangCodes |
    | ---- | ---------------- |
    | TC   | `zh`, `zh-TW`, `zh-HK` |
    | SC   | `zh`, `zh-CN` |
    | JP   | `ja` |

* strictMode: `boolean`

    若是本选项打开，将以精确的模式匹配标点符号，比如简体中文里的间隔号“·”只能是 U+00B7。否则，将以模糊的模式匹配标点符号，比如，U+00B7、U+2027 以及 U+30FB 都被认为是简体中文里的间隔号。

    **Default**: `true`

## License

[MIT](LICENSE) @ Zhou Xiaojie