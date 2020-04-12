/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2020 Zhou Xiaojie. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { BaseStyler, SCStyler, TCStyler, JPStyler, Options as StylerOptions } from "./styler";
import { NodeUtils } from "./util";

import './cj-typo.css';

enum Lang {
  TC,
  SC,
  JP
}

interface Options extends StylerOptions {
  lang: Lang,
  includeLangCodes?: string[]
}

/**
 * default values for {@link Options#includeLangCodes}
 */
const defaultLangCodes = new Map();
defaultLangCodes.set(Lang.TC, ["zh", "zh-TW", "zh-HK"]);
defaultLangCodes.set(Lang.SC, ["zh", "zh-CN"]);
defaultLangCodes.set(Lang.JP, ["jp"]);

export default class CJTypo {
  static readonly Lang = Lang;
  private options: Options;
  private styler: BaseStyler;
  constructor(options: Options) {
    this.options = options;
    switch (this.options.lang) {
      case Lang.TC:
        this.styler = new TCStyler(this.options);
        break;
      case Lang.SC:
        this.styler = new SCStyler(this.options);
        break;
      case Lang.JP:
        this.styler = new JPStyler(this.options);
        break;
      default:
        throw `unsupported language code: ${this.options.lang}`;
    }
  }
  render(selector: string) {
    let elems = document.querySelectorAll(selector);
    Array.from(elems).forEach(e => {
      if (e.childNodes.length > 0)
        this.traverseAndStyle(e.childNodes[0]);
    });
  }
  /**
   * Traverse a tree and search leaf nodes to apply styling
   * @param node the root node to be traversed
   * @param precedingChar the preceding character of the node's content
   * @param followingChar the following character of the node's content
   * @returns first character of the node's content
   */
  private traverseAndStyle(node: Node, precedingChar = "", followingChar = ""): string {
    let inline = NodeUtils.isInline(node);
    let ignorable = NodeUtils.isIgnorable(node);

    if (node.nextSibling) {
      let lastChar = NodeUtils.getLastChar(node);
      if (!inline) {
        lastChar = "";
      } else if (ignorable && lastChar == "") {
        lastChar = precedingChar;
      }
      followingChar = this.traverseAndStyle(node.nextSibling, lastChar, followingChar);
    }

    if (!inline) {
      precedingChar = "";
      followingChar = "";
    }

    let firstChar = node.textContent.length > 0 ? node.textContent[0] : "";
    if (!NodeUtils.shouldSkip(node, this.options.includeLangCodes || defaultLangCodes.get(this.options.lang))) {
      if (node.hasChildNodes()) {
        firstChar = this.traverseAndStyle(node.childNodes[0], precedingChar, followingChar);
      } else {
        this.styler.applyStyling(node, precedingChar, followingChar);
      }
    } else {
      firstChar = "";
    }

    if (ignorable && inline && firstChar == "")
      firstChar = followingChar;
    return firstChar;
  }
}