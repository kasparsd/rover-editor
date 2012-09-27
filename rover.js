
var editor_area = document.getElementById('editor-editarea');

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
	client.readFile("index.md", function( error, data ) {
		if ( error && error.status == 404 )
			client.writeFile( 'index.md', '', function( error, stat ) {
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
	console.log(e);
	if ( e.keyCode == 9 )
		e.preventDefault();

	if ( e.metaKey || e.shiftKey || e.keyLocation )
		return;

	if ( keys_ignore.indexOf( e.keyCode ) == -1 )
		window.getSelection().getRangeAt(0).insertNode( posi );
}

editor_area.onpaste = function(e) {
	e.preventDefault();

	var an = window.getSelection().anchorNode;
	var clipboard = e.clipboardData.getData('text/plain');
	var offset = window.getSelection().anchorOffset + clipboard.length + 0;

	if ( an.nodeValue ) {
		an.nodeValue = an.nodeValue + clipboard;
		window.getSelection().collapse( an, offset );
	}
}

editor_area.onkeypress = function(e) {
	if ( this.innerText.indexOf( posi_key ) == -1 )
		return;

	hljs.highlightBlock( this, false, true );
	
	remove_posi( this );
}

var remove_posi = function( el ) {
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
	if ( e.metaKey && e.keyCode >= 65 && e.keyCode <= 90 ) {
		if ( String.fromCharCode(e.keyCode) == 'S' ) {
			client.writeFile( 'index.md', editor_area.innerText, function( error, stat ) {
				console.log( error, stat );
			});
			return false;
		}
	}
};	