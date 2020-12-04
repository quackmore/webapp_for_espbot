// common.js
var esp8266 = {
  "name": "Webapp",
  "type": "WEBAPP",
  "api": "2.2.0",
  "ip": "192.168.10.1",
  "url": "http://192.168.10.1",
  "cors": true
};

// init app type, app name and sidebar as espbot

$(document).ready(function () {
  update_sidebar();
  init_dev_list()
    .then(function (last_dev_ip) {
      if (last_dev_ip) {
        $('#awaiting').modal('show');
        esp8266.ip = last_dev_ip;
        esp8266.url = "http://" + last_dev_ip;
        dev_verify();
      }
      else
        $("#page-content").load("/html/devlist.html", load_completed);
    });
});


// common functions for setting sidebar and load page content

function update_sidebar() {
  $('#app_type').text(esp8266.type);
  $('#dev-name').text(esp8266.name);
  switch (esp8266.type) {
    case "ESPBOT":
      $('#app_home').show();
      //$('#th_history').hide();
      $('#dev_journal').show();
      $('#dev_settings').show();
      $('#dev_gpio').show();
      $('#dev_debug').show();
      $('#dev_list').show();
      $('#app_info').show();
      return;
    default:
      $('#app_home').hide();
      //$('#th_history').hide();
      $('#dev_journal').hide();
      $('#dev_settings').hide();
      $('#dev_gpio').hide();
      $('#dev_debug').hide();
      $('#dev_list').show();
      $('#app_info').hide();
      return;
  }
}

function goto(page) {
  if (page === "dev_list") {
    $("#page-content").load("/html/devlist.html", load_completed);
    if ((window.matchMedia("(max-width: 768px)")).matches)
      $("#wrapper").removeClass("toggled");
    return;
  }
  $('#awaiting').modal('show');
  switch (page) {
    case "app_home":
      switch (esp8266.type) {
        case "ESPBOT": page = "/html/espbot/home_espbot.html"; break;
        case "THERMOSTAT": page = "/html/thermostat/home_thermostat.html"; break;
        default: page = "/html/devlist.html";
      }
      break;
    case "dev_journal": page = "/html/espbot/events_journal.html"; break;
    case "dev_settings": page = "/html/espbot/device.html"; break;
    case "dev_gpio": page = "/html/espbot/gpio.html"; break;
    case "dev_debug": page = "/html/espbot/debug.html"; break;
    case "app_info":
      switch (esp8266.type) {
        case "ESPBOT": page = "/html/espbot/info_espbot.html"; break;
        case "THERMOSTAT": page = "/html/thermostat/info_thermostat.html"; break;
        default: page = "/html/devlist.html";
      }
      break;
    default: page = "/html/devlist.html";
  }
  if ((window.matchMedia("(max-width: 768px)")).matches)
    $("#wrapper").removeClass("toggled");
  $("#page-content").load(page, load_completed);
}

// common functions for setting sidebar and load page content

function show_spinner() {
  return new Promise(function (resolve) {
    $('#awaiting').modal('show');
    resolve("spinner shown");
  });
}

function hide_spinner(timeout) {
  setTimeout(function () {
    $('#awaiting').modal('hide');
  }, timeout);
}

function load_completed(responseText, textStatus, xhr) {
  if (textStatus != "success") {
    alert("Uh oh, cannot load page");
    hide_spinner(500);
  }
}

function query_err(xhr, status) {
  if (status === "timeout") {
    alert("Request timeout!");
    $('#awaiting').modal('hide');
  } else {
    if (xhr.responseText !== undefined) {
      var answer = JSON.parse(xhr.responseText);
      alert("" + answer.error.reason);
      $('#awaiting').modal('hide');
    }
    else {
      alert("Device unreachable");
      $('#awaiting').modal('hide');
    }
  }
  // setTimeout(function () {
  //   $('#awaiting').modal('hide');
  // }, 500);
}

function esp_query(query) {
  if (!query.hasOwnProperty('timeout'))
    query.timeout = 4000;
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: query.type,
      url: esp8266.url + query.url,
      dataType: query.dataType,
      contentType: query.contentType,
      data: query.data,
      processData: query.processData,
      crossDomain: esp8266.cors,
      timeout: query.timeout,
      success: function (data) {
        if (query.success)
          query.success(data);
        resolve(data);
      },
      error: function (jqXHR, textStatus) {
        if (query.error)
          query.error(jqXHR, textStatus);
        reject(jqXHR, textStatus);
      }
    });
  });
}

// initialize esp devices from local storage

var esp_devices = [];

function init_dev_list() {
  var stored_devices = JSON.parse(localStorage.getItem('esp_devices'));

  if (stored_devices)
    esp_devices = stored_devices;
  else {
    // no device found, add default one
    var ap_dev = {};
    ap_dev.name = "Espbot default AP";
    ap_dev.ip = "192.168.10.1";
    esp_devices.push(ap_dev);
  }

  var last_dev_ip = localStorage.getItem('last_dev_ip');

  return new Promise(function (resolve) {
    resolve(last_dev_ip);
  });
}

// function for verifying communication to a device
// and updating app type, app name and sidebar according to the device type


function dev_replied(data) {
  localStorage.setItem("last_dev_ip", esp8266.ip);

  esp8266.name = data.device_name;
  esp8266.type = data.app_name;
  esp8266.api = data.api_version;
  update_sidebar();
  goto("app_home");
  $('#deviceModal').modal('hide');
}

function dev_didnt_reply() {
  alert("Device didn't answer...");
  goto("dev_list");
  $('#deviceModal').modal('hide');
  $('#awaiting').modal('hide');
}

function dev_get_info() {
  return esp_query({
    type: 'GET',
    url: '/api/info',
    dataType: 'json',
    timeout: 4000
  });
}

function dev_verify() {
  Promise.resolve(dev_get_info())
    .then(function (data) {
      dev_replied(data);
    }, function () {
      dev_didnt_reply();
    });
}