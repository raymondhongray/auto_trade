function renderBySelectorName(selectorName, text) {
    document.querySelectorAll(selectorName)[0].textContent = text;
}

var bp = chrome.extension.getBackgroundPage();
var myTaobaoItems = [
    {
        content: {id: '527361405258', colorSku: '20509:28315', sizeSku: '1627207:149938866', amount: 10},
        done: 0
    },
    {
        content: {id: '545998369080', colorSku: '20509:1446377418', sizeSku: '1627207:7201401', amount: 8},
        done: 0
    }
];

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded');
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
