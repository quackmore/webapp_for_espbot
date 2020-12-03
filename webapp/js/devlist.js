// devlist.js

update_device_list();

function update_device_list() {
  $("#device_list").empty();
  $("#device_list").append('<thead><tr><th style="width: 40%">Name</th><th style="width: 40%">Ip</th><th style="width: 40%">Actions</th></tr></thead><tbody>');
  for (var ii = 0; ii < esp_devices.length; ii++) {
    $("#device_list").append('<tr><td>' +
      esp_devices[ii].name +
      '</td><td>' +
      esp_devices[ii].ip +
      '</td><td><button class="btn btn-sm" onclick="dev_go(' +
      ii +
      ')" ' +
      '><i class="fa fa-sign-in"></i></button><button class="btn btn-sm" onclick="dev_modify(' +
      ii +
      ')"><i class="fa fa-pencil-square-o"></i></button><button class="btn btn-sm" onclick="dev_delete(' +
      ii +
      ')"><i class="fa fa-trash-o"></i></button></td></tr>');
  }
  $("#device_list").append('</tbody>');
  setTimeout(function () {
    $('#awaiting').modal('hide');
  }, 500);
}

function update_dev_idx(id) {
  $('#dev_name').val(esp_devices[id].name);
  $('#dev_ip').val(esp_devices[id].ip);
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

function dev_go(id) {
  $('#awaiting').modal('show');
  esp8266.ip = esp_devices[id].ip;
  esp8266.url = "http://" + esp_devices[id].ip;
  dev_verify();
}

function dev_modify(id) {
  modal_dev_id = id;
  $('#deviceModalTitle').text(esp_devices[id].name);
  update_dev_idx(id);
  $('#deviceModalReset').removeClass("d-none");
  $('#deviceModal').modal('show');
}

function dev_delete(id) {
  if (confirm("Confirm deleting device...")) {
    esp_devices.splice(id, 1);
    update_device_list();
    localStorage.setItem("esp_devices", JSON.stringify(esp_devices));
  }
}

$('#deviceModalReset').on('click', function () {
  update_dev_idx(modal_dev_id);
});

$('#deviceModalSave').on('click', function () {
  if (modal_dev_id >= 0) {
    esp_devices[modal_dev_id].name = $('#dev_name').val();
    esp_devices[modal_dev_id].ip = $('#dev_ip').val();
  }
  else {
    var new_obj = {};
    new_obj.name = $('#dev_name').val();
    new_obj.ip = $('#dev_ip').val();
    esp_devices.push(new_obj);
  }
  $('#deviceModal').modal('hide');
  update_device_list();
  localStorage.setItem("esp_devices", JSON.stringify(esp_devices));
});