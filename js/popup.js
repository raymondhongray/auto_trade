function renderBySelectorName(selectorName, text) {
    document.querySelectorAll(selectorName)[0].textContent = text;
}

function checkAutoTrade() {
    var port = chrome.runtime.connect({
        name: "checkAutoTradeState"
    });
    port.postMessage({});
    port.onMessage.addListener(function(msg) {
        if (msg.isAutoTradeStarted) {
            document.getElementById('auto-trade').setAttribute('disabled', 1);
        }
    });
}

// bp 可以單向使用background.js的函數
var bp = chrome.extension.getBackgroundPage();
// port.name = tradeConfigFromPopup 才會用到以下測試用的 data
var myTaobaoItems = [
    {id: '527361405258', colorSku: '1627207:149938866', sizeSku: '20509:28315', amount: 2},
    {id: '545998369080', colorSku: '1627207:7201401', sizeSku: '20509:1446377418', amount: 1}
];

document.addEventListener('DOMContentLoaded', function() {
    // bp.autoTrade.chromeTabsCreate('result.html');
    // 確認是否正在執行自動拍, 正在執行的話就disabled按鈕
    checkAutoTrade();
});

document.getElementById('auto-trade').addEventListener('click', function(e) {
    var port = chrome.runtime.connect({
        // name: "tradeConfigFromPopup"
        name: "tradeConfigFromContentScript"
    });
    port.postMessage({taobaoItems: myTaobaoItems});
    port.onMessage.addListener(function(msg) {
        console.log(msg, 'message recieved');
        if (!msg.success) {
            renderBySelectorName('.debugger', msg.message);
        }
    });
});
