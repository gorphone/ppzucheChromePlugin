document.addEventListener('DOMContentLoaded', function () {
	var backgroundData = chrome.extension.getBackgroundPage().backgroundData,
		ga = backgroundData.ga,
		req = backgroundData.request,
		dom = [];
	if( ga && ga.length ){
		$('#ga-table').append( '<tr><th>page</th><th>event</th><th>param</th></tr>' );

		for (var i = 0; i < ga.length; i++) {
			dom.push('<tr>');
			for (var j = 0; j < ga[i].length; j++) {
				dom.push('<td>' + ga[i][j] + '</td>' );
			}
	    	dom.push('</tr>');
	    }

	    $('#ga-table').append( dom.join('') ).show().siblings('p').hide();
	}

	if( req && req.length ){
		dom = [];

		for (var i = 0; i < req.length; i++) {
			dom.push( '<li>' + req[i] + '</li>' );
	    }

	    $('#fail-request').append(dom.join('')).find('.green').hide();
	}

});

$('#clear-data').click(function(){
	chrome.extension.getBackgroundPage().backgroundData = {};
	$('#ga-table').empty().hide().siblings('p').show();
	$('#fail-request').html('<p class="green">恭喜，目前各请求正常</p>');
	return false;
});