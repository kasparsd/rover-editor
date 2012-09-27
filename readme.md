# Rover Editor

Rover is a simple web based text editor with support for Markdown syntax highlighting and Dropbox storage.

## Author

Kaspars Dambis  
<http://konstruktors.com>  
[@konstruktors](http://twitter.com/konstruktors)

## Rover Uses

* 	[highlight.js](http://softwaremaniacs.org/soft/highlight/en/) [on GitHub](https://github.com/isagalaev/highlight.js) by [Ivan Sagalaev](http://softwaremaniacs.org/) for syntax highlighting.
	
	I have modified the library to remove syntax detection, in order to improve performance (it reformats content on every `keydown`).

* 	[dropbox-js](https://github.com/dropbox/dropbox-js) by [Dropbox](https://github.com/dropbox) for synchronisation with Dropbox.