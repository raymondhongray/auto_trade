$(function() {
    console.log('執行VeryBuy批次自動拍Chrome擴充工具...');
    window.isTradeDone = false;

    /* Listen for messages */
	chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	    /* If the received message has the expected format... */
	    if (msg) {
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
