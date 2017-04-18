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
            // document.getElementById('auto-trade').removeAttribute('disabled');
        }
    });
}

var bp = chrome.extension.getBackgroundPage();
var myTaobaoItems = [
    {id: '527361405258', colorSku: '20509:28315', sizeSku: '1627207:149938866', amount: 10},
    {id: '545998369080', colorSku: '20509:1446377418', sizeSku: '1627207:7201401', amount: 8}
];

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded');
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
