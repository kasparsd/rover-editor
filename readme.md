# Rover Editor

**Rover is a *prototype* of a simple HTML5 based text editor that supports Markdown syntax highlighting and uses Dropbox for storage.**

![Screenshot of Rover Markdown Editor](https://raw.github.com/kasparsd/rover-editor/master/screenshot.png)

It is the first web based editor to support *real-time* Markdown highlighting and work in all browsers (including iPhone, iPad and all Webkit mobile).

It was inspired by [Mou](http://mouapp.com/), created by [Chen Luo](http://chenluois.com/).

## Author

Kaspars Dambis  
<http://konstruktors.com>  
[@konstruktors](http://twitter.com/konstruktors)

## Rover Uses

* 	[highlight.js](http://softwaremaniacs.org/soft/highlight/en/) [on GitHub](https://github.com/isagalaev/highlight.js) by [Ivan Sagalaev](http://softwaremaniacs.org/) for syntax highlighting.
	
	I have modified the library to remove syntax detection, in order to improve performance (it reformats content on every `keydown`).

* 	[dropbox-js](https://github.com/dropbox/dropbox-js) by [Dropbox](https://github.com/dropbox) for synchronisation with Dropbox.