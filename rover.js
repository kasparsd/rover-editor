
var editor_area = document.getElementById('rover');

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
	// Add user editor style to DOM
	var rover_style = document.createElement('style');
	rover_style.id = 'rover_style';
	document.body.appendChild(rover_style);

	// Import the editor stylesheet
	client.readFile( 'rover-theme.css', function( error, data ) {
		
		// Store the default style on Dropbox for future use
		if ( error && error.status == 404 ) {

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

	client.readFile( 'index.md', function( error, data ) {
		if ( error && error.status == 404 )
			client.writeFile( 'index.md', '# Welcome to Rover', function( error, stat ) {
				if ( ! error )
					init();
			});
		
		if ( error )
			console.log( 'is error', error );

		editor_area.innerText = data;
		hljs.highlightBlock( editor_area, false, true );
	});
}

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
};	