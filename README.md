# gas-doc-linkify
Apps Script to linkify numbered references in Google Document

> Progress isn't made by early risers. It's made by lazy men trying to find easier ways to do something.

**Robert Heinlein**, Time Enough For Love


### What it is
A [Google Apps Script](https://developers.google.com/apps-script/) that i wrote to ease my job for [Adblock Plus](https://www.adblockplus.org)

It is a "bound script" which means that it exists only in scope of Google Document where the three source files are copied into through "Tools/Script Editor..." and then any future copy of such template document. It is currently configurable just through variables in code at the top of `Main.gs` but fairly flexible from there. I may make it a proper Addon one day. So far it was rather a probe into a maturity and easiness of usage of GAS (hint: okay but not great, feels half baked)

### What it does
Creates a new item in Docs menu and two actions in there:

- **Convert All** : finds all configured tokens and replaces it by a link to a web resource where the link contains the numerical part of the token. The link is followed by a plain text of "summary" which is fetched from the constructed link.

- **Convert Selected** : does the same but just with the currently selected text range. The token form is slightly more permissive.

Most of the above function is configurable in `Main.gs`. What consists a "summary" and how it is parsed out is pretty much hardcoded at the moment though. Sorry. Have a look into `TracFetch.gs`

### Example

See my [StackOverflow question](http://stackoverflow.com/questions/39919492/in-google-document-need-to-replace-a-text-and-hyperlink-it-partially), depicting the above half-bakedness statement.
