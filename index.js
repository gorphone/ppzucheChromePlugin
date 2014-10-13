function getDomainFromUrl(url){
	var host = "null";
	if(typeof url == "undefined" || null == url)
		url = window.location.href;
	var regex = /.*\:\/\/([^\/]*).*/;
	var match = url.match(regex);
	if(typeof match != "undefined" && null != match)
		host = match[1];
	return host;
}

function getParameterByName(queryString, name) {
    // Escape special RegExp characters
    name = name.replace(/[[^$.|?*+(){}\\]/g, '\\$&');
    // Create Regular expression
    var regex = new RegExp("(?:[?&]|^)" + name + "=([^&#]*)");
    // Attempt to get a match
    var results = regex.exec(queryString);
    return results && decodeURIComponent(results[1].replace(/\+/g, " ")) || '';
}

function getHash ( queryString ){
	var results = /#.*$/.exec(queryString);

	return results && results[0];
}

var backgroundData = {},
	isGaLoad = {},
	gaTimer = {},
	tabHash = {},
	noop = function(){};


function reqHandle( details ){
	chrome.tabs.getSelected(null,function(tab) {
	    var tablink = tab.url,
	    	domain = getDomainFromUrl(tab.url).toLowerCase();
		
		if( domain.indexOf("ppzuche.com") > -1 ){
			var queryString = /\?[^#]+(?=#|$)|$/.exec(details.url)[0];
			var gaId = getParameterByName(queryString, 'utmac'),
				gaEvent = getParameterByName(queryString, 'utme');

			isGaLoad[tab.id] = true;

			if(  gaId !== 'UA-44242190-1' && !( /(staging|s\d+)\.ppzuche\.com/.test(domain) && gaId == 'UA-44242190-9') ){
				alert('ga载入异常，请检查\n\n gaId: ' + gaId);
			}


			if( gaEvent && isGaLoad ){
				gaEvent = gaEvent.match(/\((.*)\)/);
				gaEvent[1] && (gaEvent = gaEvent[1]);

				if(!backgroundData.ga){
					backgroundData.ga = [];
				}

				backgroundData.ga.push( gaEvent.split('*') );
			}
		}
	});
}

chrome.webRequest.onCompleted.addListener(reqHandle, {
    urls: [
        "http://*.google-analytics.com/*"
    ]
});

chrome.webRequest.onErrorOccurred.addListener( function ( details ){
	if(!backgroundData.request){
		backgroundData.request = [];
	}

	//alert('存在失败的请求，请关注~');

	backgroundData.request.push( details.url );
}, {
    urls: [
    	"*://*.ppzuche.com/*",
        "*://*.google-analytics.com/*"
    ],
    types: ['object','xmlhttprequest','script','stylesheet','image']
});

chrome.webRequest.onResponseStarted.addListener( function ( details ){
	if(!backgroundData.request){
		backgroundData.request = [];
	}

	if(details.statusCode != 200 && details.statusCode != 304 && details.statusCode != 302){
		backgroundData.request.push( details.url + '<strong> code: ' + details.statusCode + '</strong>' );
	}
}, {
    urls: [
    	"*://*.ppzuche.com/*",
        "*://*.google-analytics.com/*"
    ],
    types: ['object','xmlhttprequest','script','stylesheet','image']
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	var domain = getDomainFromUrl(tab.url).toLowerCase(),
		status = typeof changeInfo == 'string' ? changeInfo : changeInfo.status;	

	if(status == 'loading'){
		isGaLoad[tabId] = false;
	}

	if( domain.indexOf("ppzuche.com") > -1 ){
		chrome.pageAction.show(tabId);	

		//5s ga 检查超时
		if( !gaTimer[tabId] && status == 'complete' ){
			var hash = getHash(tab.url);

			//hash changed
			if ( hash && tabHash[tabId] !== hash ){
				tabHash[tabId] = hash;
				return ;
			}


			gaTimer[tabId] = setTimeout(function(){
				clearTimeout(gaTimer[tabId]);
				gaTimer[tabId] = null;


				if(!isGaLoad[tabId]){
					alert( 'ga载入超时，请检查' );
				}
			}, 5000);
		}
			
	}else{
		backgroundData  = {};
	}
});


//alert('log');