const Craw = require("crawler");

var c = new Craw({
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			var $ = res.$;
			console.log($('table tr').map(function() {
				return $(this).find('td').map(function() {
				  return $(this).html();
				}).get();
			  }).get());
		}
	}
});

c.queue('https://eztv.re/search/?q1=&q2=1582&search=Search');