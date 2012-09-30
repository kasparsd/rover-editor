

var dropbox_browser = document.getElementById('dropbox-browser');
var editor_area = document.getElementById('rover');
var doc_title = document.getElementById('doc-title');
var preview_area = document.getElementById('preview');
var showdown = new Showdown.converter();

var client = new Dropbox.Client({
		key: "OmgelmwkX6A=|DKcxwZXyEzMxlWUoKdWi0Wmb3WDTj9JIs55wa7frZg==", 
		sandbox: true
	});

client.authDriver( new Dropbox.Drivers.Redirect({ 
	'rememberUser' : true 
}) );

client.authenticate(function( error, client ) {
	if (error)
		console.log( error );
	else
		init();
});

var init = function () {
	// Load the Dropbox file browser
	dropbox_browser_load_folder( '/' );

	// Add user editor style to DOM
	var rover_style = document.createElement('style');
	rover_style.id = 'rover_style';
	document.body.appendChild(rover_style);

	// Import the editor stylesheet
	client.readFile( 'rover-theme.css', function( error, data ) {
		
		// Store the default style on Dropbox for future use
		if ( 1 == 1 || error && error.status == 404 ) {

			// Use AJAX to retrieve the default Rover stylesheet
			var areq = new XMLHttpRequest();
			areq.open( 'GET', 'rover-theme.css', true );

			areq.onreadystatechange = function() {
				if ( areq.readyState == 4 && areq.responseText ) {
					// Apply CSS to the current page
					rover_style.innerHTML = areq.responseText;

					// Store the default theme on Dropbox
					client.writeFile( 'rover-theme.css', areq.responseText, function( error, stat ) {});

					return;
				}
			}
			
			areq.send( null );
		} else {
			rover_style.innerHTML = data;
		}

	});
}

var dropbox_browser_load_folder = function( path, parent ) {
	client.readdir( path, function( error, entries, dir_stat, entry_stats ) {
		if (error) {
			console.log(error);
			return;
		}

		// Build the file list
		var ul = document.createElement('ul');

		for ( var e in entries ) {
			var li = document.createElement('li');

			// Create file anchor
			var link = document.createElement('a');
			link.innerText = entry_stats[e].name;
			link.href = entry_stats[e].path;

			li.appendChild( link );

			if ( entry_stats[e].isFile )
				li.className = 'file';
			else if ( entry_stats[e].isFolder )
				li.className = 'folder';

			if ( entry_stats[e].isFile && entry_stats[e].name.indexOf('.md') == -1 )
				li.className += ' disabled';

			ul.appendChild( li );
		}

		if ( parent )
			parent.appendChild( ul );
		else {
			dropbox_browser.appendChild( ul );
			dropbox_browser.style.visibility = 'visible';
			document.getElementById('dropbox-auth').style.visibility = 'hidden';
		}
	});
}


var editor_load_file = function( file ) {
	// Empty the editor
	editor_area.className += 'loading';
	editor_area.innerText = '';
	doc_title.innerText = file.replace(/\\/g,'/').replace( /.*\//, '' );

	client.readFile( file, function( error, data ) {
		if ( error )
			console.log( 'is error', error );

		editor_area.innerText = data;

		if ( file.indexOf('.md') !== -1 ) {
			hljs.highlightBlock( editor_area, false, true );
			preview_area.innerHTML = showdown.makeHtml( editor_area.innerText );
		}

		editor_area.className = editor_area.className.replace( 'loading', '' );
	});
}


var panes = new Swipe( document.getElementById('pages'), {
		callback: function( a, b ) {
			for ( s in this.slides )
				if ( s == this.index )
					this.slides[s].style.overflow = null;
				else if ( s > -1 )
					this.slides[s].style.overflow = 'hidden';

			if ( b == 1 )
				preview_area.innerHTML = showdown.makeHtml( editor_area.innerText );
		}
	});

var posi_key = '語';
var posi = document.createTextNode( posi_key );
var posi_location = 0;
var keys_ignore = [ 91, 17, 18, 8, 9, 229, 16, 32 ];

editor_area.onkeydown = function(e) {
	if ( e.keyCode == 9 )
		e.preventDefault();

	if ( e.metaKey || e.shiftKey || e.keyLocation )
		return;

	if ( keys_ignore.indexOf( e.keyCode ) == -1 )
		window.getSelection().getRangeAt(0).insertNode( posi );
}

editor_area.onpaste = function(e) {
	e.preventDefault();

	var clipboard = e.clipboardData.getData('text/plain');
	var an = window.getSelection().anchorNode;
	var offset = window.getSelection().anchorOffset + clipboard.length + 0;

	if ( an.nodeValue ) {
		an.nodeValue = an.nodeValue + clipboard;
		window.getSelection().collapse( an, offset );
	}
}

editor_area.onkeypress = function(e) {
	// Apply highlighting only if position indicator is present
	if ( this.innerText.indexOf( posi_key ) == -1 )
		return;

	hljs.highlightBlock( this, false, true );
	
	remove_posi( this );
}

var remove_posi = function( el ) {
	// Remove position indicator from the markup
	for ( child in el.childNodes ) {
		var cn = el.childNodes[ child ];

		if ( cn.nodeValue ) {
			var cn_posi = cn.nodeValue.indexOf( posi_key );

			if ( cn_posi !== -1 ) {
				cn.nodeValue = cn.nodeValue.replace( posi_key, '' );
				window.getSelection().collapse( cn, cn_posi );
			}
		} else {
			remove_posi( cn );
		}
	}
}

document.onkeydown = function(e) { 
	// Override Cmd+S for saving
	if ( e.metaKey && e.keyCode >= 65 && e.keyCode <= 90 ) {
		if ( String.fromCharCode(e.keyCode) == 'S' ) {
			client.writeFile( 'index.md', editor_area.innerText, function( error, stat ) {
				console.log( error, stat );
			});
			
			return false;
		}
	}
}

var dropbox_touch_handler = function(e) {

	// This is a file that we can't edit, bail out
	if ( e.target.offsetParent.className.indexOf('disabled') !== -1 )
		return false;

	if ( e.target.offsetParent.className.indexOf('file') !== -1 ) {
		// Load the file into editor
		editor_load_file( e.target.pathname );
		panes.slide(1);

		history.pushState( 'home', 'home', '#!/edit' + e.target.pathname );
	} else if ( e.target.offsetParent.className.indexOf('folder') !== -1 ) {
		// Unfold the folder
		if ( ! e.target.nextSibling )
			dropbox_browser_load_folder( e.target.pathname, e.target.offsetParent );

		// Toggle expand state
		if ( e.target.offsetParent.className.indexOf('expanded') == -1 )
			e.target.offsetParent.className += ' expanded';
		else
			e.target.offsetParent.className = e.target.offsetParent.className.replace(' expanded', '');
	}

	return false;
}

dropbox_browser.onclick = dropbox_touch_handler;
dropbox_browser.ontouchstart = dropbox_touch_handler;

window.addEventListener( 'popstate', function(e) {
	//console.log(e);
   	if ( e.state == 'home' )
   		panes.slide(0);
});




