 


> Open this page at [https://jasonswearingen.github.io/footsmash/](https://jasonswearingen.github.io/footsmash/)

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open [https://arcade.makecode.com/](https://arcade.makecode.com/)
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for **https://github.com/jasonswearingen/footsmash** and import

## Edit this project ![Build status badge](https://github.com/jasonswearingen/footsmash/workflows/MakeCode/badge.svg)

To edit this repository in MakeCode.

* open [https://arcade.makecode.com/](https://arcade.makecode.com/)
* click on **Import** then click on **Import URL**
* paste **https://github.com/jasonswearingen/footsmash** and click import


#### Metadata (used for search, rendering)

* for PXT/arcade
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>


# running in VSCode

- from: https://forum.makecode.com/t/how-to-attach-makecode-typescript-to-virtual-studio/16670/2

here are the steps you can use:

- Install https://nodejs.org/en/
- Open the terminal of your choice
- Install the makecode CLI:
- npm install makecode -g
- Navigate to the folder where you want to create your project:
- cd path/to/directory/
- Create your project:
- makecode init arcade
- Install your dependencies:
- makecode install
- Open VSCode:
- code .
- Start the makecode simulator:
- makecode serve
- In a browser, open up the url that is printed in the console (http://127.0.0.1:7001 2)
- Now you can code your project in vscode and every time you save a file, the game in the browser will automatically refresh.