/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2020 Zhou Xiaojie. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export class NodeUtils {
  /**
   * Detect if a node is inline
   * @param node the node to detect on
   * @returns true if the node is inline
   */
  static isInline(node: Node): boolean {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
        return true;
      case Node.ELEMENT_NODE:
        let displayValue = window.getComputedStyle(<Element>node).display;
        return /inline.*/.test(displayValue);
      default:
        return false;
    }
  }

  /**
   * Determine the node is ignorable, which means 
   * the left sibling's text and right sibling's text 
   * are concatenated.
   * @param node the node to be determined
   * @returns true if the node is ignorable
   */
  static isIgnorable(node: Node) {
    if (node.nodeType == Node.ELEMENT_NODE) {
      const styles = window.getComputedStyle(<Element>node)
      return styles.position == "absolute" || parseFloat(styles.width) > 0;
    } else {
      return false;
    }
  }

  /**
   * Determine whether to skip the node or not
   * @param node the node to be determined
   * @param langCodes if the node's `lang` attribute is set 
   * to a lang code that not included in `langCodes`, it should 
   * be skipped.
   * @returns true if should skip the node
   */
  static shouldSkip(node: Node, langCodes?: string[]): boolean {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const skippedTag = ["CODE", "IMG"]
      let skippable = false;
      if (langCodes && (<HTMLElement> node).lang) {
        skippable = !langCodes.includes((<HTMLElement> node).lang);
      }
      return skippable || skippedTag.indexOf((<Element>node).tagName) > -1;
    }
    return false;
  }

  /**
   * Get the last character of the node's content text
   * @param node
   */
  static getLastChar(node: Node): string {
    switch (node.nodeType) {
      case Node.TEXT_NODE:
      case Node.ELEMENT_NODE:
        if (node.textContent.length > 0)
          return node.textContent[node.textContent.length - 1];
      default:
        return "";
    }
  }

  /**
   * Replace a node with one or multiple nodes.
   * @param oldNode the node to be replaced
   * @param newNodes the new node(s) to replace `oldNode`
   */
  static replaceNode(oldNode: Node, ...newNodes: Node[]) {
    let parentNode = oldNode.parentNode;
    var currentNode: Node;
    if (newNodes.length > 0) {
      currentNode = newNodes[newNodes.length - 1];
      parentNode.replaceChild(currentNode, oldNode);
      for (let i = newNodes.length - 2; i >= 0; i -= 1) {
        parentNode.insertBefore(newNodes[i], currentNode);
        currentNode = currentNode.previousSibling
      }
    }
  }
}