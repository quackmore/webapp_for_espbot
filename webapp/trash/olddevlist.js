// devlist.js
var esp8266 = {
  // "url": "",
  // "cors": false
  "url": "http://192.168.1.187",
  // "url": "http://192.168.100.100",
  // "url": "http://192.168.10.1",
  "cors": true
};

function ajax_error(xhr, status) {
  if (status === "timeout") {
    alert("Ajax timeout!");
  } else {
    if (xhr.responseText !== undefined) {
      var answer = JSON.parse(xhr.responseText);
      alert("" + answer.error.reason);
    }
    else {
      alert("Ajax error!");
    }
  }
  setTimeout(function () {
    $('#awaiting').modal('hide');
  }, 1000);
}

const esp8266_AP_IP = '192.168.10.1';

// devices.push('192.168.10.1');
// devices.push('192.168.10.2');
// 
// console.log('array:' + devices);
// 
// localStorage.setItem("devices", JSON.stringify(devices));

var stored_devices = JSON.parse(localStorage.getItem('esp8266_devices'));
var esp8266_devices = [];
if (stored_devices)
  esp8266_devices = stored_devices;
esp8266_devices.push('192.168.1.105');
esp8266_devices.push('192.168.1.187');
esp8266_devices.push(esp8266_AP_IP);

function append_device(ii) {
  for (ii = 0; ii < esp8266_devices.length; ii++) {
    $('#old_dev_list').append('<option value="' + ii + '">' + esp8266_devices[ii] + '</option>');
  }
}

function fillup_device_list() {
  var ii;
  Promise.resolve()
    .then(function () {
      return Promise.resolve($('#old_dev_list').empty());
    })
    .then(function () {
      return Promise.resolve(append_device(ii));
    })
    .then(function () {
      $('#old_dev_list').append('<option value="' + ii + '">Insert new IP...</option>');
    });
}

$('#old_dev_list').empty();
fillup_device_list();

$('#old_dev_list').on('change', function () {
  esp8266.url = 'http://' + $('#old_dev_list option:selected').text();
  console.log(esp8266.url);
});

// var names = [];
// names[0] = prompt("New member name?");
// localStorage.setItem("names", JSON.stringify(names));
// 
// var storedNames = JSON.parse(localStorage.getItem("names"));
// localStorage.setItem(key,value);
// 
// localStorage.getItem(key);

var data = [
  { "name": "primo", "ip": "192.168.1.185" },
  { "name": "quaranta quattro gatti in fila ", "ip": "192.168.1.187" },
  { "name": "AP", "ip": "192.168.10.1" }
];

function update_device_list() {
  $("#dev_list").empty();
  $("#dev_list").append('<thead><tr><th style="width: 40%">Name</th><th style="width: 40%">Ip</th><th style="width: 40%">Actions</th></tr></thead><tbody>');
  for (var ii = 0; ii < data.length; ii++) {
    $("#dev_list").append('<tr><td>' +
      data[ii].name +
      '</td><td>' +
      data[ii].ip +
      '</td><td><button class="btn btn-sm" onclick="dev_go(' +
      ii +
      ')" ' +
      '><i class="fa fa-sign-in"></i></button><button class="btn btn-sm" onclick="dev_modify(' +
      ii +
      ')"><i class="fa fa-pencil-square-o"></i></button><button class="btn btn-sm" onclick="dev_delete(' +
      ii +
      ')"><i class="fa fa-trash-o"></i></button></td></tr>');
  }
  $("#dev_list").append('</tbody>');
  setTimeout(function () {
    $('#awaiting').modal('hide');
  }, 1000);
}

update_device_list();

function update_dev_idx(id) {
  $('#dev_name').val(data[id].name);
  $('#dev_ip').val(data[id].ip);
}

var modal_dev_id;

$('#dev_add').on('click', function () {
  modal_dev_id = -1;
  $('#deviceModalTitle').text("New device");
  $('#dev_name').val("");
  $('#dev_ip').val("");
  $('#deviceModalReset').addClass("d-none");
  $('#deviceModal').modal('show');
});

function dev_modify(id) {
  modal_dev_id = id;
  $('#deviceModalTitle').text(data[id].name);
  update_dev_idx(id);
  $('#deviceModalReset').removeClass("d-none");
  $('#deviceModal').modal('show');
}

function dev_delete(id) {
  if (confirm("Confirm deleting device...")) {
    data.splice(id, 1);
    update_device_list();
  }
}

$('#deviceModalReset').on('click', function () {
  update_dev_idx(modal_dev_id);
});

$('#deviceModalSave').on('click', function () {
  if (modal_dev_id >= 0) {
    data[modal_dev_id].name = $('#dev_name').val();
    data[modal_dev_id].ip = $('#dev_ip').val();
  }
  else {
    var new_obj = {};
    new_obj.name = $('#dev_name').val();
    new_obj.ip = $('#dev_ip').val();
    data.push(new_obj);
  }
  $('#deviceModal').modal('hide');
  update_device_list();
});

