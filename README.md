# Espbot Web App

## Summary

Web interface for ESP8266 apps based on espbot.

Currently working for:

[Espot standalone](https://github.com/quackmore/espbot)

[Esp smart timer](https://github.com/quackmore/smart_timer)

[Esp thermostat](https://github.com/quackmore/esp_thermostat)

You need to have an http server running on localhost to use the app.

### Running an http server on localhost with docker

    $ docker run -d --name <your_container_name> -p 80:80 -v <web_app_directory>/bin/upgrade/www:/usr/share/nginx/html:ro nginx:alpine

### Running an http server on localhost with nodejs

    $ cd <web_app_directory>
    $ npx http-server

### Running an http server on Android with Termux and nginx

Checkout Termux documentation.

## License

Espbot Web App comes with a [BEER-WARE] license.

Enjoy.
