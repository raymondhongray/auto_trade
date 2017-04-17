$(function() {
    console.log('執行VeryBuy批次自動拍Chrome擴充工具...');
    window.isTradeDone = false;

    /* Listen for messages */
	chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	    /* If the received message has the expected format... */

	    switch(msg.type) {
		    case 'autoTrade':
		    	var currentSeq = msg.taobaoItem.seq;
		    	var taobaoItem = msg.taobaoItem.content;
		    	runAutoTrade(taobaoItem.id, taobaoItem.colorSku, taobaoItem.sizeSku, taobaoItem.amount);
		    	// sendResponse 回傳訊息僅在同步內有效
		    	sendResponse({currentSeq: currentSeq});

		    	autoTradeEnsureDone(function() {
		    		console.log('msg', msg);
			    	console.log('#' + msg.taobaoItem.seq + ' done.', '(Received a msg from bp...)');
			        chrome.runtime.sendMessage({taobaoItemId: taobaoItem.id});
			    });
		        break;
		    case 'tradeConfigFromContentScript':
		    	// 要先 JSON.stringify() 再 encodeURIComponent()
		    	// 範例儲存方式 <div id="taobaoItemsContentScript" data-items="%5B%7B%22content%22%3A%7B%22id%22%3A%22527361405258%22%2C%22colorSku%22%3A%2220509%3A28315%22%2C%22sizeSku%22%3A%221627207%3A149938866%22%2C%22amount%22%3A10%7D%2C%22done%22%3A0%7D%2C%7B%22content%22%3A%7B%22id%22%3A%22545998369080%22%2C%22colorSku%22%3A%2220509%3A1446377418%22%2C%22sizeSku%22%3A%221627207%3A7201401%22%2C%22amount%22%3A8%7D%2C%22done%22%3A0%7D%5D">我是taobaoItems<div>
		    	var $targetElement = $('#taobaoItemsContentScript');
		    	if ($targetElement.length > 0 && typeof $targetElement.data('items') != 'undefined') {
		    		var taobaoItems = JSON.parse(decodeURIComponent($targetElement.data('items')));
		    		sendResponse({succsess: true, taobaoItems: taobaoItems});
		    	} else {
		    		sendResponse({succsess: false});
		    	}

		        break;
		    default:
		    	console.log("It doesn't match type:" + msg.type);
		}
	});
});

var autoTradeEnsureDone = function(callback) {
    if (!window.isTradeDone) {
        setTimeout(function() { autoTradeEnsureDone(callback); }, 50);
    } else {
        if (callback) {
            callback();
        }
    }
};

var runAutoTrade = function(taobaoItemId, colorSku, sizeSku, amount) {
	// if (confirm('是否要執行VeryBuy批次自動拍?') == false)
	// 	return;
	if (!taobaoItemId || !colorSku || !sizeSku || !amount) {
		alert('taobao項目任一參數不得為空值！');
		return;
	}

	setTimeout(function() {

	    document.querySelectorAll('.tb-cleafix > .J_SKU[data-pv="' + colorSku + '"] ')[0].classList.remove("tb-selected");
		document.querySelectorAll('.tb-cleafix > .J_SKU[data-pv="' + sizeSku + '"] ')[0].classList.remove("tb-selected");

		document.querySelectorAll('.tb-cleafix > .J_SKU[data-pv="' + colorSku + '"] > a')[0].click();
		document.querySelectorAll('.tb-cleafix > .J_SKU[data-pv="' + sizeSku + '"] > a')[0].click();

		setAmountByTriggerIncrease(amount);

		var amount_delay = amount * 350;

		setTimeout(function() {
		    document.getElementById("J_btn_addToCart").click();

			popupCloseEnsureExisted(function() {
				document.querySelectorAll('.J_popup_close.sea-iconfont')[0].click();
				window.isTradeDone = true;
			});
		}, amount_delay);
	}, 2000);

};

var popupCloseEnsureExisted = function(callback) {
    if (typeof document.querySelectorAll('.J_popup_close.sea-iconfont')[0] == 'undefined') {
        setTimeout(function() { popupCloseEnsureExisted(callback); }, 50);
    } else {
        if (callback) {
            callback();
        }
    }
};

var setAmountByTriggerIncrease = function(amount) {
	var i = 1;
	interval = setInterval(function(){
		if(i == amount) {
			clearInterval(interval);
			return;
		}
		document.querySelectorAll('.tb-increase.J_Increase.sea-iconfont')[0].click();
		i++
	}, 350);
}

var setAmountByAutoKeydown = function(amount) {
	var e = $.Event('keydown');
    e.which = parseInt(amount) + 48; // keycode of zero is 48
    $('#J_IptAmount').focus();
    $('#J_IptAmount').trigger(e);
}
