/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2020 Zhou Xiaojie. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { NodeUtils } from "./util";

export interface Options {
  strictMode?: boolean,
  compressPunctuations?: boolean,
  autoSpace?: boolean
}

export class BaseStyler {
  /* Character Categories */
  protected basicMarks = "\\u3001\\u3002\\uff0c\\uff0e";
  /**
   * unicode range for additional basic marks in non-strict mode
   */
  protected basicMarksExt = "";
  protected middleDots = "\\u30fb";
  /**
   * unicode range for additional middle dots in non-strict mode
   */
  protected middleDotsExt = "";
  protected openingBrackets = "\\u2018\\u201c\\u3008\\u300a" +
    "\\u300c\\u300e\\u3010\\u3014\\u3016\\uff08\\uff3b\\uff5b";
  protected openingBracketsExt = "";
  protected closingBrackets = "\\u2019\\u201d\\u3009\\u300b" +
    "\\u300d\\u300f\\u3011\\u3015\\u3017\\uff09\\uff3d\\uff5d";
  protected closingBracketsExt = "";
  protected hyphens = "\\u002c\\u002e\\u002d\\u2013\\u2014\\uff5e";
  protected hiragana = "\\u3041-\\u3096";
  protected katakana = "\\u30a1-\\u30fa";
  protected ideographs = (() => {
    let ideographs = "\\u2e80-\\u2fdf\\u3100-\\u3120\\u3190-\\u319f" +
      "\\u31a0-\\u31ba\\u31c0-\\u31ff" +
      "\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff";
    if ("unicode" in RegExp.prototype) {
      ideographs += "\\u{20000}-\\u{2fa1f}"
    }
    return ideographs;
  })();
  protected lettersAndDigits = "\\u0030-\\u0039\\u0041-\\u005a\\u0061-\\u007a" +
    "\\u00c0-\\u00d6\\u00d8-\\u00f6\\u00f8-\\u02af" +
    "\\u0372\\u0373\\u0376\\u0377\\u037b-\\u037d\\u037f\\u0386\\u0388-\\u038a\\u038c\\u038e-\\u0481" +
    "\\u048a-\\u052f\\u053a-\\u0556\\u0561-\\u0587";

  protected options: Options = {
    strictMode: true,
    compressPunctuations: true,
    autoSpace: true
  }
  protected regExp: RegExp;

  constructor(options?: Options) {
    if (options) {
      Object.assign(this.options, options);
    }
  }
  protected init() {
    if (!this.options.strictMode) {
      this.basicMarks += this.basicMarksExt;
      this.middleDots += this.middleDotsExt;
      this.openingBrackets += this.openingBracketsExt;
      this.closingBrackets += this.closingBracketsExt;
    }
    let basicPatterns = this.getHalfWidthPatterns();
    let lookbehindPatterns = this.getHalfWidthPatternsLB();
    let regExpStr = `(${basicPatterns.join("|")})|(${lookbehindPatterns.join("|")})|` +
      `([${this.hiragana}${this.katakana}${this.ideographs}](?=[${this.lettersAndDigits}])|` +
      `[${this.lettersAndDigits}](?=[${this.hiragana}${this.katakana}${this.ideographs}]))`;
    let flags = "g";
    if ("unicode" in RegExp.prototype) {
      flags = "gu"
    }
    this.regExp = new RegExp(regExpStr, flags);
  }
  /**
   * Get patterns of which matched string will be transformed 
   * into half-width. If a pattern contains lookbehind 
   * assertion, you should return it in {@link getLookbehindPatterns} 
   * instead.
   */
  getHalfWidthPatterns(): string[] {
    return [
      `[${this.basicMarks}](?=[${this.closingBrackets}])`,
      `[${this.closingBrackets}](?=[${this.basicMarks}])`,
      `[${this.closingBrackets}]+(?=[${this.closingBrackets}])`,
      `[${this.closingBrackets}](?=[${this.middleDots}])`
    ];
  }
  /**
   * Similar to {@link getHalfWidthPatterns}, but the first character of the 
   * matched string will be excluded, equivalent to lookbehind 
   * assertion.
   */
  getHalfWidthPatternsLB(): string[] {
    return [
      `[${this.basicMarks}][${this.openingBrackets}]`,
      `[${this.closingBrackets}][${this.openingBrackets}]`,
      `[${this.openingBrackets}][${this.openingBrackets}]+`,
      `[${this.middleDots}][${this.openingBrackets}]`
    ];
  }
  /**
   * Apply styling on the node, includes punctuation compressing, adding 
   * kerning between western letters and Chinese and Japanese.
   * @param node a text node to be styled
   * @param precedingChar the preceding character of the node's content
   * @param followingChar the following character of the node's content
   */
  applyStyling(node: Node, precedingChar = "", followingChar = ""): void {
    if (node.nodeType != Node.TEXT_NODE) return;
    let text = node.textContent;
    if (text.trim().length < 1) return;

    // add previousChar and followingChar for better matching
    let minIndex = 0;
    let maxIndex = text.length;
    if (precedingChar) {
      text = precedingChar + text;
      minIndex = precedingChar.length;
      maxIndex += precedingChar.length;
    }
    if (followingChar) {
      text = text + followingChar;
    }

    let wrapperElem = document.createElement("span");
    let innerHtmlString = "";
    let lastPosition = minIndex;
    var result: RegExpExecArray;
    while ((result = this.regExp.exec(text)) !== null) {
      if (this.regExp.lastIndex == lastPosition) continue;
      var groupIndex: number;
      let matchedString = "";
      for (let i = 1; i < result.length; i++) {
        if (typeof result[i] != "undefined") {
          groupIndex = i;
          break;
        }
      }
      let startIndex = Math.max(result.index, lastPosition);
      let endIndex = Math.min(this.regExp.lastIndex, maxIndex);
      matchedString = text.substring(startIndex, endIndex);
      innerHtmlString += text.substring(lastPosition, startIndex);
      switch (groupIndex) {
        // omit first character
        case 2:
          if (this.options.compressPunctuations) {
            if (result.index >= lastPosition) {
              innerHtmlString += matchedString[0];
              matchedString = matchedString.substring(1);
              if (!matchedString) break;
            }
          }
        // half width
        case 1:
          if (!this.options.compressPunctuations) {
            innerHtmlString += matchedString;
          } else {
            var htmlString = `<span class="halfwidth">${matchedString}</span>`;
            innerHtmlString += htmlString;
          }
          break;
        // extra space between positional-width characters and full-width characters
        case 3:
          if (!this.options.autoSpace) {
            innerHtmlString += matchedString;
          } else {
            var htmlString = `<span class="extra-spaced">${matchedString}</span>`;
            innerHtmlString += htmlString;
          }
          break;
        default:
          break;
      }
      // move back one character to act like lookbehind assertion
      this.regExp.lastIndex -= 1;
      lastPosition = endIndex;
    }
    innerHtmlString += text.substring(lastPosition, maxIndex);
    wrapperElem.innerHTML = innerHtmlString;
    NodeUtils.replaceNode(node, ...Array.from(wrapperElem.childNodes));
  }
}

export class SCStyler extends BaseStyler {
  protected basicMarksExt = "\\uff01\\uff1a\\uff1b\\uff1f";
  protected middleDots = "\\u00b7";
  protected middleDotsExt = "\\u2027\\u30fb";
  protected openingBrackets = "\\u2018\\u201c\\u3008\\u300a\\u3010\\u3014\\uff08\\uff3b";
  protected openingBracketsExt = "\\u300c\\u300e\\u3016\\uff5b\\uff5f";
  protected closingBrackets = "\\u2019\\u201d\\u3009\\u300b\\u3011\\u3015\\uff09\\uff3d";
  protected closingBracketsExt = "\\u300d\\u300f\\u3017\\uff5d\\uff60";

  constructor(options?: Options) {
    super(options);
    this.init();
  }

  getHalfWidthPatterns(): string[] {
    let patterns = super.getHalfWidthPatterns();
    removeFromArray(patterns, `[${this.closingBrackets}](?=[${this.middleDots}])`);
    patterns.push("[\\uff01\\uff1f]+(?=[\\uff01\\uff1f])");
    patterns.push(`[${this.middleDots}]`);
    return patterns;
  }

  getHalfWidthPatternsLB(): string[] {
    let patterns = super.getHalfWidthPatternsLB();
    removeFromArray(patterns, `[${this.middleDots}][${this.openingBrackets}]`);
    return patterns;
  }
}

export class TCStyler extends BaseStyler {
  protected basicMarksExt = "\\uff01\\uff1a\\uff1b\\uff1f";
  protected middleDots = "\\u2027";
  protected middleDotsExt = "\\u00b7\\uff0e\\u30fb";
  protected openingBrackets = "\\u3008\\u300a\\u300c\\u300e\\uff08";
  protected openingBracketsExt = "\\u2018\\u201c\\u3010\\u3014\\u3016\\uff3b\\uff5b\\uff5f";
  protected closingBrackets = "\\u3009\\u300b\\u300d\\u300f\\uff09";
  protected closingBracketsExt = "\\u2019\\u201d\\u3011\\u3015\\u3017\\uff3d\\uff5d\\uff60";

  constructor(options?: Options) {
    super(options);
    this.init();
  }

  getHalfWidthPatterns(): string[] {
    let patterns = super.getHalfWidthPatterns();
    removeFromArray(patterns, `[${this.basicMarks}](?=[${this.closingBrackets}])`);
    return patterns;
  }
}

export class JPStyler extends BaseStyler {
  protected middleDots = "\\u30fb\\uff1a\\uff1b";
  protected openingBrackets = "\\u300c\\u300e\\u301d\\uff08\\uff5f";
  protected openingBracketsExt = "\\u2018\\u201c\\u3008\\u300a\\u3010\\u3014\\u3016\\uff3b\\uff5b";
  protected closingBrackets = "\\u300d\\u300f\\u301f\\uff09\\uff60";
  protected closingBracketsExt = "\\u2019\\u201d\\u3009\\u300b\\u3011\\u3015\\u3017\\uff3d\\uff5d";

  constructor(options?: Options) {
    super(options);
    this.init();
  }
}

function removeFromArray<T>(array: Array<T>, element: T): T[] {
  let index = array.indexOf(element);
  if (index >= 0) {
    array.splice(index, 1);
  }
  return array;
}