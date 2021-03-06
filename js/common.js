// common.js
var esp8266 = {
  "name": "Webapp",
  "type": "WEBAPP",
  "espbot_api": "2.2.0",
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
      $('#th_history').hide();
      $('#th_ctrl_settings').hide();
      $('#st_relay').hide();
      $('#dev_journal').show();
      $('#dev_settings').show();
      $('#dev_gpio').show();
      $('#dev_debug').show();
      $('#dev_list').show();
      $('#app_info').show();
      break;
    case "THERMOSTAT":
      $('#app_home').show();
      $('#th_history').show();
      $('#th_ctrl_settings').show();
      $('#st_relay').hide();
      $('#dev_journal').show();
      $('#dev_settings').show();
      $('#dev_gpio').hide();
      $('#dev_debug').show();
      $('#dev_list').show();
      $('#app_info').show();
      break;
    case "SMART_TIMER":
      $('#app_home').show();
      $('#th_history').hide();
      $('#th_ctrl_settings').hide();
      $('#st_relay').show();
      $('#dev_journal').show();
      $('#dev_settings').show();
      $('#dev_gpio').show();
      $('#dev_debug').show();
      $('#dev_list').show();
      $('#app_info').show();
      break;
    default:
      $('#app_home').hide();
      $('#th_history').hide();
      $('#th_ctrl_settings').hide();
      $('#st_relay').hide();
      $('#dev_journal').hide();
      $('#dev_settings').hide();
      $('#dev_gpio').hide();
      $('#dev_debug').hide();
      $('#dev_list').show();
      $('#app_info').hide();
      break;
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
        case "ESPBOT": page = "/html/espbot/" + esp8266.api + "/home_espbot.html"; break;
        case "THERMOSTAT": page = "/html/thermostat/" + esp8266.api + "/home_thermostat.html"; break;
        case "SMART_TIMER": page = "/html/smart_timer/" + esp8266.api + "/home_smart_timer.html"; break;
        default: page = "/html/devlist.html";
      }
      break;
    case "history":
      switch (esp8266.type) {
        case "THERMOSTAT": page = "/html/thermostat/" + esp8266.api + "/history.html"; break;
        default: page = "/html/devlist.html";
      }
      break;
    case "ctrl_settings":
      switch (esp8266.type) {
        case "THERMOSTAT": page = "/html/thermostat/" + esp8266.api + "/ctrl_settings.html"; break;
        default: page = "/html/devlist.html";
      }
      break;
    case "relay":
      switch (esp8266.type) {
        case "SMART_TIMER": page = "/html/smart_timer/" + esp8266.api + "/relay.html"; break;
        default: page = "/html/devlist.html";
      }
      break;
    case "dev_journal":
      switch (esp8266.type) {
        case "ESPBOT": page = "/html/espbot/" + esp8266.api + "/events_journal.html"; break;
        case "THERMOSTAT": page = "/html/thermostat/" + esp8266.api + "/events_journal.html"; break;
        case "SMART_TIMER": page = "/html/smart_timer/" + esp8266.api + "/events_journal.html"; break;
        default: page = "/html/devlist.html";
      }
      break;
    case "dev_settings": page = "/html/espbot/" + esp8266.espbot_api + "/device.html"; break;
    case "dev_gpio": page = "/html/espbot/" + esp8266.espbot_api + "/gpio.html"; break;
    case "dev_debug": page = "/html/espbot/" + esp8266.espbot_api + "/debug.html"; break;
    case "app_info":
      switch (esp8266.type) {
        case "ESPBOT": page = "/html/espbot/" + esp8266.api + "/info_espbot.html"; break;
        case "THERMOSTAT": page = "/html/thermostat/" + esp8266.api + "/info_thermostat.html"; break;
        case "SMART_TIMER": page = "/html/smart_timer/" + esp8266.api + "/info_smart_timer.html"; break;
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
    hide_spinner(500);
  } else {
    if (xhr.responseText !== undefined) {
      var answer = JSON.parse(xhr.responseText);
      alert("" + answer.error.reason);
      hide_spinner(500);
    }
    else {
      alert("Device unreachable");
      hide_spinner(500);
    }
  }
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
  switch (esp8266.type) {
    case "ESPBOT":
      esp8266.espbot_api = esp8266.api;
      break;
    case "SMART_TIMER":
      switch (esp8266.api) {
        case "1.2.0":
          esp8266.espbot_api = "2.2.0";
          break;
        case "1.3.0":
          esp8266.espbot_api = "2.3.0";
          break;
        default:
          esp8266.espbot_api = "2.2.0";
          break;
      }
      break;
    case "THERMOSTAT":
      switch (esp8266.api) {
        case "2.1.1":
          esp8266.espbot_api = "2.2.0";
          break;
        case "2.2.0":
          esp8266.espbot_api = "2.3.0";
          break;
        default:
          esp8266.espbot_api = "2.2.0";
          break;
        }
        break;
    default:
      esp8266.espbot_api = esp8266.api;
      break;
  }
  update_sidebar();
  goto("app_home");
  $('#deviceModal').modal('hide');
}

function dev_didnt_reply() {
  alert("Device didn't answer...");
  esp8266.type = "none";
  update_sidebar();
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