chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var tabStatus = changeInfo.status;

    if (tabStatus == 'complete') {
    	console.log('tabId: #' + tabId + ' onUpdated...');
        function returnMsgCallback(res) {
            console.log(res, 'Got a callback msg from cs...');
        }

        chrome.tabs.sendMessage(tabId, {
        	taobaoItem: communicator.getTaobaoItem()
        }, returnMsgCallback);
    }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
	console.log(tabId, removeInfo);
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	console.log(msg, '(Received a msg from cs...)');
	console.log(sender.tab.id, '(Received a msg from cs...)');

	var seq = communicator.getCurrentSeq();

	communicator.setTradeDoneBySeq(seq++);
	console.log('test1', seq);
	console.log('test2', communicator.getTaobaoItemListSize());

    if (seq == communicator.getTaobaoItemListSize()) {
    	return;
    }
    communicator.setTaobaoItem(seq, communicator.getTaobaoListContentBySeq(seq));
    var taobaoItem = communicator.getTaobaoItem();
    var url = 'https://item.taobao.com/item.htm?id=' + taobaoItem.content.id;
    communicator.chromeTabsCreate(url);

    chrome.tabs.remove([sender.tab.id]);
});

// 做一個溝通物件給 popup.js
var communicator = (function() {
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
  		getTaobaoItemListFromContentScript: function() {
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
