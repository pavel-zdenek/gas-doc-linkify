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

var fetchResponseCache = Object.create(null)

function fetchIssueSummary(id, link)
{
  var response = fetchResponseCache[link]
  if (response) {
    if(response.code) {
      Logger.log("Cached response code "+response.code+": "+link)
      return null
    } else {
      return response.summary
    }
  }
  response = UrlFetchApp.fetch(link, { "muteHttpExceptions": true })
  if (response.getResponseCode() != 200)
  {
    Logger.log("Response code "+response.getResponseCode()+": "+link)
    fetchResponseCache[link] = { code: response.getResponseCode() }
    return null
  }
  var body = response.getContentText("UTF-8").trim()
  var firstEOL = body.indexOf("\n")
  if (firstEOL == -1) {
    Logger.log("Malformed response, no EOLs: "+link)
    return null
  }
  var firstLine = body.substring(0, firstEOL)
  var restLines = body.substring(firstEOL+1).trim()
  var keys = firstLine.split("\t")
  // would be insufficient for multiline issue description, but good enough for summary
  var values = restLines.split("\t")
  if (keys[0] !== "id" || values[0] !== id || keys[1] !== "summary")
  {
    Logger.log("Unexpected format of response: "+link)
    return null
  }
  var summaryMatchGroups = /^\s*\"?(.+?)\"?\s*$/.exec(values[1])
  if (!summaryMatchGroups) {
    Logger.log("Cannot match summary field in: "+link)
    return null
  }
  // if the summary had " in it originally, it is quoted entirely and inside " become ""
  var summary = summaryMatchGroups[1].replace(/""/g,'"')
  fetchResponseCache[link] = { summary: summary }
  return summary
}
