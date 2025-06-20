# express-mute

A very simple library to suppress or "mute" deprecated requests from hitting your API without maintaining legacy routes.

It works as Express middleware, using a JSON config file to detect unwanted requests and respond early — before your route logic runs.

