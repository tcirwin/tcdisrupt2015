var API_URL = "http://api.walmartlabs.com/v1/"
var API_KEY = "x5a7gjsb4gje7n8csj43qy7r"

var walmart = {
  search: function(query, success) {
    $.ajax({
      url: API_URL + "search",
      method: 'GET',
      jsonp: "callback",
      dataType: 'jsonp',
      data: {
        query: query,
        apiKey: API_KEY
      },
      success: success
    });
  }
}

function render(templateName, data) {
  if (!render.cache[templateName]) {
    render.cache[templateName] = _.template($('#' + templateName).html());
  }
  return render.cache[templateName](data);
}

render.cache = {};

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function renderProducts(products) {
  var $list = $('#productList');
  $list.empty();
  products.forEach(function(product) {
    $list.append(render('productListItem', product));
  })
}

$('#search').on('input', debounce(function() {
  $('#productList').empty();
  walmart.search($('#search').val(), function(res) {
    renderProducts(res.items);
  });
}, 200));
