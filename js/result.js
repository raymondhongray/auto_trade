function renderVeryBuyResultTable() {
    var autoTradeItems = bp.autoTrade.getTaobaoItemList();
    var tbody = '';
    $.each(autoTradeItems, function(i, item) {
        var itemContent = item.content;
        tbody += '<tr><td>'
        + (i + 1) + '</td><td>'
        + itemContent.id + '</td><td>'
        + itemContent.name + '</td><td>'
        + itemContent.colorSku + '</td><td>'
        + itemContent.colorName + '</td><td>'
        + itemContent.sizeSku + '</td><td>'
        + itemContent.sizeName + '</td><td>'
        + itemContent.amount + '</td></tr>';
    });

    $('#trade-table > tbody').append(tbody);
}

function renderTaobaoCartResultTable() {
    var taobaoCartResult = bp.autoTrade.getTaobaoCartResult();
    var tbody = '';
    $.each(taobaoCartResult, function(i, item) {
        var itemContent = item;
        tbody += '<tr><td>'
        + (i + 1) + '</td><td>'
        + itemContent.id + '</td><td>'
        + itemContent.name + '</td><td>'
        + '-' + '</td><td>'
        + itemContent.colorName + '</td><td>'
        + '-' + '</td><td>'
        + itemContent.sizeName + '</td><td>'
        + itemContent.amount + '</td></tr>';
    });

    $('#taobao-cart-table > tbody').append(tbody);
}

// bp 可以單向使用background.js的函數
var bp = chrome.extension.getBackgroundPage();
// port.name = tradeConfigFromPopup 才會用到以下測試用的 data

document.addEventListener('DOMContentLoaded', function() {
    var itemList = bp.autoTrade.getTaobaoItemList();
    var itemListText = JSON.stringify(itemList);

    $('#app > .ori-result').text(itemListText);

    renderVeryBuyResultTable();

    taobaoCartResult = bp.autoTrade.getTaobaoCartResult();
    if (taobaoCartResult.length == 0) {
        alert('尚未存取從淘寶購物車爬到的資訊！');
    } else {
        cartResultText = JSON.stringify(taobaoCartResult);
        $('#app > .parse-result').text(cartResultText);
    }

    renderTaobaoCartResultTable();
});
