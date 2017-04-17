window.isSetTradeConfig = false;

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var tabStatus = changeInfo.status;

    if (window.isSetTradeConfig && tabStatus == 'complete') {
    	console.log('tabId: #' + tabId + ' onUpdated...');
        function returnMsgCallback(res) {
            console.log(res, 'Got a callback msg from cs...');
        }

        chrome.tabs.sendMessage(tabId, {
        	type: 'autoTrade',
        	taobaoItem: autoTrade.getTaobaoItem()
        }, returnMsgCallback);
    }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
	console.log(tabId, removeInfo);
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	console.log(msg, '(Received a msg from cs...)');
	console.log(sender.tab.id, '(Received a msg from cs...)');

	var seq = autoTrade.getCurrentSeq();

	autoTrade.setTradeDoneBySeq(seq++);

    if (seq == autoTrade.getTaobaoItemListSize()) {
    	return;
    }

    autoTrade.setTaobaoItem(seq, autoTrade.getTaobaoListContentBySeq(seq));
    triggerAutoTrade();

    chrome.tabs.remove([sender.tab.id]);
});

// 儲存自動執行點選 taobao item 內容的所有狀態
var autoTrade = (function() {
	var totalItem = 0;
	var taobaoItem = {
		seq: 0,
		content: {
			id: '0',
			colorSku: '',
			sizeSku: '',
			amount: 0
		}
	};
	// var taobaoItemList = [];
	var taobaoItemList = [
		{
			content: {id: '', colorSku: '', sizeSku: '', amount: 0},
			done: 0
		}
	];
  	return {
  		chromeTabsCreate: function(url) {
    		chrome.tabs.create({url: url});
    		console.log('#' + taobaoItem.seq + ' tabs created...');
  		},
  		tradeConfigFromContentScript: function(port) {
  			port.onMessage.addListener(function(msg) {
  				chrome.tabs.query({
			        currentWindow: true,
			        active: true
			    }, function(currentTabs) {
			    	var currentTabId = currentTabs[0].id
		  			function returnMsgCallback(res) {
			            console.log(res, 'Get TaobaoItems from content script...');
			            if (res.succsess && typeof res.taobaoItems != 'undefined') {

			            	autoTrade.initTaobaoItemList(res.taobaoItems);
			            	triggerAutoTrade();
			           	} else {
						    port.postMessage({success: false, message: 'Error: content script 找不到 定義的 taobaoItemList javascript 物件結構！'});
			           	}
			        }
		  			chrome.tabs.sendMessage(currentTabId, {
			        	type: 'tradeConfigFromContentScript'
			        }, returnMsgCallback);
			    });
		    });
  		},
  		initTaobaoItemList: function(list) {
			taobaoItemList = list;
			taobaoItem.seq = 0;
			taobaoItem.content = taobaoItemList[0].content;
			totalItem = taobaoItemList.length;
	    },
	    getTaobaoItemList: function() {
	    	return taobaoItemList;
	    },
	    getTaobaoItemListSize: function() {
	    	return totalItem;
	    },
	    getTaobaoListContentBySeq: function(seq) {
			return taobaoItemList[seq].content;
	    },
	    getTaobaoItem: function() {
			return taobaoItem;
	    },
	    setTaobaoItem: function(seq, itemContent) {
			taobaoItem.seq = seq;
			taobaoItem.content = itemContent;
	    },
	    getCurrentSeq: function() {
			return taobaoItem.seq;
	    },
	    setTradeDoneBySeq: function(seq) {
	    	taobaoItemList[seq].done = 1;
	    }
  	};
})();

chrome.runtime.onConnect.addListener(function(port) {
	console.log(port);

	switch(port.name) {
	    case 'tradeConfigFromPopup':
	        setTradeConfigFromPopup(port);
	        break;
	    case 'tradeConfigFromContentScript':
			autoTrade.tradeConfigFromContentScript(port);
	        break;
	    case 'parseBillPage':
	        break;
	    default:
	    	console.log("It doesn't match port name:" + port.name);
	}
});

var setTradeConfigFromPopup = function(port) {
	port.onMessage.addListener(function(msg) {
		console.log(msg, 'trade config message recieved');

		if (msg.taobaoItems.length == 0) {
	        port.postMessage({success: false, message: 'Error: taobaoItemList 不得為空值！'});
	        return;
	    }
	    autoTrade.initTaobaoItemList(msg.taobaoItems);
	    triggerAutoTrade();
	});
}

var triggerAutoTrade = function() {

    var taobaoItemId = autoTrade.getTaobaoItem().content.id;
    var url = 'https://item.taobao.com/item.htm?id=' + taobaoItemId;
    autoTrade.chromeTabsCreate(url);

    window.isSetTradeConfig = true;
}
