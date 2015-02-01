relmanbot
=========

Friendly robot (based on @mleibovic's fennecbot) to help release management in #relman on irc.mozilla.org.

To install / run:

* git clone git@github.com:lsblakk/relmanbot.git
* cd relmanbot
* npm install 
* node server.js

To be polite, please create your own private IRC channel for testing.


deploying
=========

I've deployed it on a raspberry pi with forever (https://www.npmjs.com/package/forever)

* [sudo] npm install forever -g
* forever start -l forever.log -o out.log -e err.log server.js
