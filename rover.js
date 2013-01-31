

var dropbox_browser = document.getElementById('dropbox-browser');
var editor_area = document.getElementById('rover');
var doc_title = document.getElementById('doc-title');
var preview_area = document.getElementById('preview');

var has_touch_support = 'ontouchstart' in document.documentElement;

var links = {
	browser: document.getElementById('link-browser'),
	save: document.getElementById('link-save'),
	preview: document.getElementById('link-preview')
};

//var showdown = new Showdown.converter();
var codemirror = CodeMirror.fromTextArea( editor_area, {
		indentWithTabs: true,
		matchBrackets: true,
		lineWrapping: true,
		theme: 'rover'
	});

window.showdown_url_replace = function( url ) {
	var base = doc_title.getAttribute('rel').replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
	
	client.makeUrl( base + '/' + url, { download: true }, function( error, data ) {
		if ( error )
			console.log(error);
		else
			preview_area.innerHTML = preview_area.innerHTML.replace( url, data.url );
	});

	return url;
}

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

	/*
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
	*/
}

var dropbox_browser_load_folder = function( path, parent ) {

	client.readdir( unescape( path ), function( error, entries, dir_stat, entry_stats ) {
		if (error) {
			console.log(error);
			return;
		}

		// Build the file list
		var ul = document.createElement('ul');

		if ( parent ) {
			var li = document.createElement('li');
			var link = document.createElement('a');
			li.className = 'back';
			link.href = '..';
			ul.appendChild( li.appendChild( link ).parentNode );
			parent.parentNode.className = 'parent';
		}

		for ( var e in entries ) {
			var li = document.createElement('li');

			// Create file anchor
			var link = document.createElement('a');
			link.innerHTML = entry_stats[e].name;
			link.href = escape( entry_stats[e].path );

			li.appendChild( link );

			if ( entry_stats[e].isFile )
				li.className = 'file';
			else if ( entry_stats[e].isFolder )
				li.className = 'folder';

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
	doc_title.value = file.replace(/\\/g,'/').replace( /.*\//, '' );
	doc_title.setAttribute( 'rel', file );

	client.readFile( file, function( error, data ) {
		if ( error )
			console.log( 'is error', error );

		codemirror.setValue( data );
		//editor_area.className = editor_area.className.replace( 'loading', '' );
		editor_area.focus();
	});
}


var panes = new Swipe( document.getElementById('pages'), {
		callback: function( a, b ) {
			// Make only the current pane scroll, while the rest are overflow:hidden
			for ( s in this.slides )
				if ( s == this.index )
					this.slides[s].style.height = null;
				else if ( s > -1 )
					this.slides[s].style.height = 'inherit';

			// Update the preview pane, if moving to preview pane
			if ( b == 2 ) {
				//preview_area.innerHTML = showdown.makeHtml( editor_area.innerText );
			} else {
				editor_area.blur();
			}
		}
	});

document.onkeydown = function(e) { 
	// Override Cmd+S for saving
	/*
	if ( e.metaKey && e.keyCode >= 65 && e.keyCode <= 90 ) {
		if ( String.fromCharCode(e.keyCode) == 'S' ) {
			client.writeFile( 'index.md', codemirror.getValue(), function( error, stat ) {
				console.log( error, stat );
			});
			
			return false;
		}
	}
	*/
}

var dropbox_touch_handler = function(e) {

	if ( e.target.parentNode.className.indexOf('file') !== -1 ) {

		history.pushState( 'edit', 'edit', '#/edit' + e.target.pathname );
		panes.slide(1);

		// Load the file into editor
		editor_load_file( e.target.pathname );

	} else if ( e.target.parentNode.className.indexOf('folder') !== -1 ) {

		dropbox_browser_load_folder( e.target.pathname, e.target.parentNode );

		// Toggle expand state
		if ( e.target.parentNode.className.indexOf('expanded') == -1 )
			e.target.parentNode.className += ' expanded';
		else
			e.target.parentNode.className = e.target.parentNode.className.replace(' expanded', '');
	} else if ( e.target.getAttribute('href') == '..' ) {
		e.target.parentNode.parentNode.parentNode.className = e.target.parentNode.parentNode.parentNode.className.replace(' expanded', '');
		e.target.parentNode.parentNode.parentNode.parentNode.className = '';
	}

	e.stopPropagation();
	e.preventDefault();
}

dropbox_browser.onclick = dropbox_touch_handler;
dropbox_browser.ontouchstart = dropbox_touch_handler;

window.addEventListener( 'popstate', function(e) {
	if ( history.state == 'edit' ) {
		editor_load_file( location.hash.replace( '#/edit', '' ) );
		panes.slide(1);
	}

   	editor_area.blur();
   	return false;
});


var save_document = function(e) {
	var el = this;
	this.className += ' loading';

	client.writeFile( doc_title.getAttribute('rel'), codemirror.getValue(), function( error, stat ) {
		console.log( error, stat );
		el.className = el.className.replace( ' loading', '' );
	});

	e.preventDefault();
}

links.save.onclick = save_document;
links.save.ontouchend = save_document;

if ( has_touch_support ) {
	links.preview.parentNode.removeChild( links.preview );
	links.browser.parentNode.removeChild( links.browser );
}


