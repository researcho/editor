function getSelectionInfo(element) {
  if (document.activeElement !== element) {
    return { selectionStart: null, selectionLength: null, cursorPosition: null };
  }

  var selectionStart = 0;
  var selectionLength = 0;
  var cursorPosition = 0;
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;

  sel = win.getSelection();
  if (sel.rangeCount > 0) {
    var range = sel.getRangeAt(0);
    var preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(element);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);

    // Count characters and newlines
    selectionStart = getTextWithNewlines(preSelectionRange).length;
    selectionLength = getTextWithNewlines(range).length;
    cursorPosition = selectionStart + selectionLength;
  }

  return { selectionStart: selectionStart, selectionLength: selectionLength, cursorPosition: cursorPosition };
}

function getTextWithNewlines(range) {
  var container = document.createElement("div");
  container.appendChild(range.cloneContents());

  var text = "";
  var childNodes = container.childNodes;

  for (var i = 0; i < childNodes.length; i++) {
    var node = childNodes[i];
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === "BR") {
      text += "\n";
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      text += getTextWithNewlines(node.ownerDocument.createRange());
      range.selectNodeContents(node);
    }
  }

  return text;
}

export default getSelectionInfo;