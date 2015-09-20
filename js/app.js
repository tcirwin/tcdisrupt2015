var API_URL = "http://api.walmartlabs.com/v1/"
var API_KEY = "x5a7gjsb4gje7n8csj43qy7r"

var lifeEvents = {};

function createEvents(txt) {
  var vals = txt.split('\n');
  var currentEvent = null;
  var first = false;
  while (vals.length) {
    var v = vals.shift();
    if (v) {
      if (!currentEvent) {
        currentEvent = v;
        lifeEvents[v] = [];
        var $opt = $('<option value="' + v + '">' + v + "</option>");
        if (first) {
          first = true;
          $opt.attr('selected', true);
        }
        $('#lifeEvent').append($opt);

      } else {
        lifeEvents[currentEvent].push(v);
      }
    } else {
      currentEvent = null;
    }
  }
  lifeEventChanged();
}

function loadEvents() {
  $.ajax({
    url: 'resources/events.txt',
    method: 'GET',
    success: createEvents
  })
}

var walmart = {
  search: function(query, success) {
    $.ajax({
      url: API_URL + "search",
      method: 'GET',
      jsonp: "callback",
      dataType: 'jsonp',
      data: {
        query: query,
        lmit: 3,
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

function clearProducts() {
  $('#productList').empty();
}

function renderProducts(products) {
  var $list = $('#productList');
  products.forEach(function(product) {
    $list.append(render('productListItem', product));
  })
}

var currentEvent = {
  name: null,
  counter: null,
  terms: null,
  timeoutId: null
}

function loadNextEventTerm() {
  if (currentEvent.counter < currentEvent.terms.length) {
    walmart.search(currentEvent.terms[currentEvent.counter], function(res) {
      console.log(res);
      renderProducts(res.items.slice(0, 3));
      currentEvent.counter++;
      currentEvent.timeoutId = setTimeout(loadNextEventTerm, 500);
    })
  }
}

function lifeEventChanged() {
  if (currentEvent.timeoutId) { clearTimeout(currentEvent.timeoutId); }
  var eventName = $('#lifeEvent').val();
  currentEvent.name = eventName;
  currentEvent.counter = 0;
  currentEvent.terms = lifeEvents[eventName];
  clearProducts();
  loadNextEventTerm();
}

$('#lifeEvent').on('change', function() {
  lifeEventChanged($('#lifeEvent').val());
});

loadEvents();
