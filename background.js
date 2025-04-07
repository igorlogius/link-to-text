/* global browser */

browser.menus.create({
  title: "Link to Text: '%s'",
  contexts: ["selection"],
  documentUrlPatterns: ["<all_urls>"],
  onclick: async (info, tab) => {
    if (info.selectionText) {
      if (info.selectionText.length > 2) {
        //const find_result = await browser.find.find(info.selectionText);

        let uniq = await browser.tabs.executeScript({
          code: `
(() => {
 function getVisibleText(element) {
   window.getSelection().removeAllRanges();
   let range = document.createRange();
   range.selectNode(element);
   window.getSelection().addRange(range);
   let visibleText = window.getSelection().toString();
   window.getSelection().removeAllRanges();
   return visibleText;
 }
 const visibleText = getVisibleText(document.body);
 return (visibleText.indexOf("${info.selectionText}") === visibleText.lastIndexOf("${info.selectionText}"));
})();`,
        });

        uniq = uniq[0];

        let tmp = new URL(tab.url);

        // build fragment URL
        // reference: https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment/Text_fragments
        // example: https://example.com#:~:text=[prefix-,]textStart[,textEnd][,-suffix]

        const fragment_url =
          tmp.origin +
          tmp.pathname +
          tmp.searchParams +
          "#:~:text=" +
          encodeURIComponent(info.selectionText);

        if (uniq) {
          browser.tabs.executeScript(tab.id, {
            code: `prompt("INFO: Selected Text seems to be unique", "${fragment_url}");`,
          });
        } else {
          browser.tabs.executeScript(tab.id, {
            code: `prompt("WARN: Selected text does not seem to be unique", "${fragment_url}");`,
          });
        }
      }
    }
  },
});
