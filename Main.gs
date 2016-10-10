/*
MIT License

Copyright (c) 2016 Pavel Zdenek [pavel dot zdenek at gmail dot com]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var dryRun = false // true: no modification to the document

// regex for "Convert All"
var SEARCH_ALL = "TRAC#([1-9][0-9]+)"
// regex for "Convert Selected" ("TRAC#" is optional)
var VALIDATE_ONE = "\s*(TRAC#)?([1-9][0-9]+)\s*"

var ID_TOKEN = "%ID%"
// the label that the above regex results will be turned to
var LINK_LABEL = "#" + ID_TOKEN
var LINK_URL = "https://issues.adblockplus.org/ticket/" + ID_TOKEN
// for fetching the issue summary
var FETCH_URL = LINK_URL + "?format=tab"

function onOpen()
{
  var ui = DocumentApp.getUi();
  ui.createMenu("ABP")
  .addItem('TRAC: Convert All Issues', 'convertAllIssues')
  .addItem('TRAC: Convert Selected Issue', 'convertSelectedIssues')
  .addToUi();
}

function convertAllIssues()
{
  var doc = DocumentApp.getActiveDocument()
  if (!doc) {
    croak("No document to work on")
    return
  }
  var body = doc.getBody()
  if (!body) {
    croak("No body to work on")
    return
  }
  // will find just the first one (i.e. no "g" regex qualifier)
  var rangeElement = body.findText(SEARCH_ALL)
  if (!rangeElement) {
    croak("No issue tokens found: "+ SEARCH_ALL)
    return
  }
  var rex = new RegExp(SEARCH_ALL)
  while (rangeElement)
  {
    var textElement = verifyEditableTextElement(rangeElement)
    if (!textElement) {
      continue
    }
    // This runs a regexp on a text range which a Body.findText already matched.
    // But findText does not support match groups which is needed for getting the actual issue number out
    var rexResult = rex.exec(textElement.getText())
    if (!rexResult) {
      croak("Failed regex on found text '"+textElement.getText()+"'")
      continue
    }
    replaceIssueElement(textElement, rangeElement.getStartOffset(), rangeElement.getEndOffsetInclusive(), rexResult[1])
    // continue where left off
    rangeElement = body.findText(SEARCH_ALL, rangeElement)
  }
}

function convertSelectedIssues()
{
  var doc = DocumentApp.getActiveDocument()
  if (!doc) {
    croak("No document to work on")
    return
  }
  var selectionRange = doc.getSelection();
  if (!selectionRange) {
    croak("Nothing selected")
    return
  }
  var rex = new RegExp(VALIDATE_ONE)
  selectionRange.getRangeElements().forEach(function(rangeElement) {
    var textElement = verifyEditableTextElement(rangeElement)
    if (!textElement) {
      return
    }
    var startOffset = rangeElement.getStartOffset()
    var endOffset = rangeElement.getEndOffsetInclusive()
    if(startOffset < 0 || endOffset < startOffset)
    {
      // Easily summoned up by selecting a text at end of a line
      croak("GAS botched the selection, range is ["+startOffset+","+endOffset+"]")
      return
    }
    var selectionText = textElement.getText().substr(startOffset, endOffset - startOffset + 1)
    var rexResult = rex.exec(selectionText)
    if (!rexResult) {
      croak("Failed regex on selected text '"+selectionText+"'")
      return
    }
    replaceIssueElement(textElement, startOffset, endOffset, rexResult[2])
  })
}

function replaceIssueElement(textElement, startOffset, endOffset, id)
{
  var summary = fetchIssueSummary(id, FETCH_URL.replace(ID_TOKEN, id))
  if (!summary) {
    croak("Failed fetching URL for issue "+id)
    summary = "___FAILED___"
  }
  var newLabel = LINK_LABEL.replace(ID_TOKEN, id)
  var newLink = LINK_URL.replace(ID_TOKEN, id)
  if (!dryRun) {
    textElement.deleteText(startOffset, endOffset)
    textElement.insertText(startOffset, newLabel)
    var endOffset = startOffset + newLabel.length
    textElement.insertText(endOffset, " " + summary)
    textElement.setLinkUrl(startOffset, endOffset - 1, newLink)
  }
}
