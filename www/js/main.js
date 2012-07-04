$(document).ready(function(){
	// Layout
	w = $(window).width()
	h = $(window).height()
	min_indent = 30
	layout__init(min_indent)

	// Start
	$('.start__tostart, .search').hide()
	$('.start__tooffers').show()
	$('#offers').hide()
	start__init()
	
	// Offers
	offers__init()
	if ( $('.popup').size() ) popup__init()
	if ( $('.checkbox').size() ) checkbox__init()

	// One page app
	url = ''
	handlers()
	var hash = location.hash

	if ( hash == '' ) {
		hash = '#!/start'
		location.hash = hash
	} else {
		url = hash.slice(3).split('/')
		hash__parse()
	}

})

function handlers() {
	// Change hash handler
	$(window).bind('hashchange', function() {
		var hash = location.hash
		if ( hash == '' ) hash = '#!/start'
		url = hash.slice(3).split('/')
		popup__hide()
		hash__parse()
	});

	// Normalize layout on resize
	$(window).bind('resize',function(){
		w = $(window).width()
		h = $(window).height()
		layout__init(min_indent)
		start__init()
	})

	// Collect info
	$('.filter input').bind('change',function(){
		offers()
	})
}

function hash__parse() {
	switch ( url[0] ) {
		case 'offer':
			offer()
			break
		case 'offers':
			offers()
			start__toggle(1)
			ajax__offers()
			break
		case 'start':
			start__toggle(0)
			break
		default:
			hash = '#!/start'
			location.hash = hash
	}
}

function layout__init(a) {
	var wrap = ( Math.ceil( (w-2*a)/240 ) -1 )*240
	var half = wrap/2
	$('.wrap').css({'width':wrap+'px'})
	$('.start__wrap').css({'margin':'0 0 0 -'+half+'px'})

	// Scroll in menu
	var menuHeight = h - 220
	$('.filter__scrollpane').css({'height':menuHeight+'px'}).jScrollPane()

	$(window).bind('scroll', function() {
		position = $('#flag').offset().top;
		if ( position >= 69 ) $('.sidebar').addClass('stick')
		else $('.sidebar').removeClass('stick')
	});
}

function start__init() {
	// Settings
	var indent = h-120

	// SLider
	start__slider()
}

function start__slider() {
	// Init
	if ( $('.start__control_paging').html() == '' ) {
		var current = 0
		var bullets = ''
		var step = $('.start__list').width()
		var id = 0
		$('.start__item').each(function(){
			bullets += '<li class="start__control_paging_item" data-rel="'+id+'"></li>'
			id++
		})
		var count = id - 1
		$('.start__control_paging').append(bullets)
	}

	// Handlers
	$('.start__control_prev').bind('click',function(){
		if (current>0) go(current-1)
	})
	$('.start__control_next').bind('click',function(){
		if (current<count) go(current+1)
	})
	$('.start__control_paging_item').bind('click',function(){
		var e = $(this)
		if ( !e.hasClass('active') ) {
			var rel = parseInt($(this).attr('data-rel'))
			go(rel)
		}
	})

	function go(num) {
		console.log(num)
		var indent = -1 * step * num
		$('.start__list').stop().animate({'left':indent+'px'},700)
		$('.start__control_paging_item').removeClass('active')
		$('.start__control_paging_item[data-rel="'+num+'"]').addClass('active')
		current = num
	}
}



function checkbox__init() {
	$('.checkbox').each(function(){
		var el = $(this)
		var active = ''
		if ( el.is(':checked') ) active = ' active'
		var id = el.attr('id')
		var name = el.attr('name')
		var html = '<label for="'+id+'" data-name="'+name+'" class="pcheckbox'+active+'"></label>'
		el.after(html).hide()
	})

	// Handlers
	$('label').bind('click',function(){
		var el = $(this)
		var id = el.attr('for')
		var input = $('#'+id)
		if ( input.hasClass('checkbox') ) {
			var name = input.attr('name')
			$('.pcheckbox[for='+id+']').toggleClass('active')
		}
		return true
	})
}

function offers__init() {
	// Gallery in large elements
	$('.ll__gallery_list').slideIt({
		'time' : '500',
		'prev' : '.ll__gallery_control_prev',
		'next' : '.ll__gallery_control_next'
	})

	// Handlers
	$('.offer__wrap').hover(function(){
		$(this).stop().animate({'top':'-100%'},300)
	}, function(){
		$(this).stop().animate({'top':0},300)
	})
	$('.offer').bind('click',function(){
		var id = $(this).attr('id')
		location.hash = '#!/offer/'+id
	})
}

function start__toggle(toOffers) {
	if (toOffers) {
		$('.start').stop().animate({'height':'120px'},800)
		$('.start__tooffers').stop().animate({'opacity':0},300,function(){
			$(this).hide()
			var ext = $('.start__tostart, .search')
			if ( ext.is(':hidden') )
				ext
					.show()
					.css({'opacity':0,})
					.animate({'opacity':1},300)
		})
		$('#offers').stop().slideDown(800, function(){
			$('.main').masonry({
				itemSelector : '.offer',
				columnWidth : 240
			});
		})
	} else {
		$('.start').stop().animate({'height':'100%'},800)
		$('.start__tostart, .search').stop().animate({'opacity':0},300,function(){
			$(this).hide()
			var ext = $('.start__tooffers')
			if ( ext.is(':hidden') )
			ext
				.show()
				.css({'opacity':0,})
				.animate({'opacity':1},300)
		})
		$('#offers').stop().slideUp(800)
	}
}

function popup__init() {
	var popup = $('.popup')
	// Normalize indents
	popup.each(function(i){
		var el = $(this)
		var mt = -0.5 * el.height()
		var ml = -0.5 * el.width()
		el.css({'margin':mt+'px 0 0 '+ml+'px'})
	})
	// Open popup
	$('.js_popup').bind('click',function(){
		var rel = $(this).attr('data-rel')
		popup__show(rel)
	})
	// Close popup
	$('#overlay, .popup__close').bind('click',function(){
		popup__hide()
	})
}

function popup__show(rel) {
	// Hide old popup
	popup__hide()

	$('#overlay, #'+rel)
		.css({'opacity':0,'display':'block'})
		.stop()
		.animate({'opacity':1},300)
	if ( $('.scrollpane').size() ) $('.scrollpane').jScrollPane()
	if ( $('.offercard__nav').size ) tabs__init()
}

function popup__hide() {
	$('#overlay, .popup').hide();
}

function tabs__init() {
	// Init
	var id = 0
	$('.offercard__nav_item').each(function(i){
		$(this).find('.js__link').attr('data-rel',id)
		$('.offercard__pages_item').eq(id).attr('id','tab_'+id)
		id++
	})
	tabs__go(0)

	// Handlers
	$('.offercard__nav_item .js__link').bind('click',function(){
		tabs__go( $(this).attr('data-rel') )
	})
}

function tabs__go(num) {
	$('.offercard__pages_item').hide()
	$('#tab_'+num).show()
	$('.offercard__nav_item').removeClass('current')
	$('.js__link[data-rel='+num+']').parent().addClass('current')

	if ( $('#tab_'+num).find('.scrollpane').size() ) $('#tab_'+num).find('.scrollpane').jScrollPane()
}

function offer() {
	// Offers on background
	start__toggle(1)

	var id = url[1]
	if ( ajax__offer(id) ) {
		popup__show('offer-'+id)
	}
}

function offers() {
	var get = '?'

	// Section
	var section = 'section=' + $('.filter input[name="section"]:checked').val() + '&'

	// Price
	var price = ''
	if ( $('.filter input[name="price"]').is(':checked') ) price = 'price='+$('.filter input[name="price_val"]').val()+'&'

	// Categories
	var category = ''
	var categoryTemp = ''
	$('.filter__cats_item').each(function(){
		var e = $(this)
		var input = e.find('input')
		if ( input.is(':checked') ) categoryTemp += 'cats[]='+input.val()+'&'
	})
	if ( categoryTemp != '' ) category = categoryTemp

	get += section + price + category

	console.log(get)
}

function ajax__offers() {
	// Collect sidebar form and send ajax-query
	console.log('Аякс вежливо просит показать кучу акций')
}

function ajax__offer(id) {
	// Build popup and send ajax-query
	console.log('Аякс вежливо просит показать всплывающее окно с акцией под номером '+id)

	// BEGIN TEMPORARY
	$('.popup').attr('id', 'offer-'+id)
	// END TEMPORARY

	return true
}

/* 

TO DO

Change hash on close popup
fix slideIt bug
Change hash with change form data


*/