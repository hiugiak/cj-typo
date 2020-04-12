[简体中文](README.cn.md)

# CJ Typographer

A optimizer for Chinese and Japanese typography on websites

## Background

Both Chinese and Japanese mainly use full-width characters, including Chinese characters, kana and some full-width punctuations. For aesthetic reasons, consecutive full-width punctuations requires space adjustment. See [Requirements for Japanese Text Layout](https://www.w3.org/TR/jlreq/#positioning_of_consecutive_opening_brackets_closing_brackets_comma_full_stops_and_middle_dots) for Japanese and [Requirements for Chinese Text Layout](https://www.w3.org/TR/clreq/#compression_rules_for_consecutive_punctuation_marks) for Chinese. Besides, extra spacing is necessary between full-width characters (Chinese characters and kana) and proportional-width character (Latin letters and digits).

## Install

This project uses [node](http://nodejs.org/) and [npm](https://npmjs.com/). Make sure you have had them installed.

```shell
$ git clone https://github.com/hiugiak/cj-typo.git
$ cd cj-typo
$ npm install
$ npm build
```

Built files can be found under `dist` directory. Copy files under `dist\` to your own project, and include them in HTML head:

```html
<link href="cj-typo.css" rel="stylesheet">
<script src="cj-typo.min.js"></script>
```

## Usage

If you want to optimize typography in all `.cj-typo` elements in Japanese style, run this Javascript code when HTML document is loaded:

```js
var cjTypo = new CJTypo({
  lang: CJTypo.Lang.JP
})
cjTypo.render('.cj-typo');
```

Replace `CJTypo.Lang.JP` and `.cj-typo:lang(ja)` with what you want. See [Options](#options) section.

Check out [sample](sample.html) for a preview.

**Requirement**: space adjustment between consecutive punctuations requires a font supports ["halt" OpenType feature](https://helpx.adobe.com/fonts/using/open-type-syntax.html#halt). Or you can use the fonts in [fonts](fonts) directory.

## Options

* lang: `CJTypo.Lang`

    **Required**. Which set of rules to be used, `CJTypo.Lang.SC` for simplified Chinese, `CJTypo.Lang.TC` for traditional Chinese and `CJTypo.Lang.JP` for Japanese.

* includeLangCodes: `string[]`

    Language codes to include. If a child element's `lang` attribute is set to other language codes, it will be skipped.

    **Default**

    | lang | includeLangCodes |
    | ---- | ---------------- |
    | TC   | `zh`, `zh-TW`, `zh-HK` |
    | SC   | `zh`, `zh-CN` |
    | JP   | `jp` |

* strictMode: `boolean`

    Match punctuation marks with precise unicodes, especially moddle dot "·" (U+00B7) in simplified Chinese, when strict mode is on. Otherwise, marks matching will be fuzzy, for example, U+00B7, U+2027 and U+30FB are all regarded as middle dot in simplified Chinese.

    **Default**: `true`

## License

[MIT](LICENSE) @ Zhou Xiaojie