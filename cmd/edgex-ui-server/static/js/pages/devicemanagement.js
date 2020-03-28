$(document).ready(function(){
    getDeviceListModule.getDeviceList()
});

var getDeviceListModule = {
    selectedRow:null,
    deviceDataCache:[],
    getDeviceList:function() {
        $.ajax({
            url:'/api/v1/deviceservice/ls',
            type:'GET',
            success:function(data){
                getDeviceListModule.deviceDataCache = data;
                $("#device_list > table > tbody").empty();
                getDeviceListModule.renderDeviceList(data);

                if(window.sessionStorage.getItem('selectedDevice') != null ){
                    var selectedDevice = JSON.parse(window.sessionStorage.getItem('selectedDevice'));
                    getDeviceListModule.selectedRow = selectedDevice;
                    var inputs = $("#device_list > table > tbody").find("input:radio");
                    $.each(inputs,function(index,ele){
                        if($(ele).prop('value') == selectedDevice.name ){
                            $(ele).prop('checked',true);
                        }
                    });
                }

                if(data.length != 0){
                    $("#device_list > table > tfoot").hide();
                }

            },

            error: function () {
            }
        });
    },

    renderDeviceList:function(data){
        $.each(data,function(index,element){
            var rowData = '<tr>';
            rowData += '<td>' + (index + 1) +'</td>';//编号
            rowData += '<td>' + element.id + '</td>';//id
            rowData += '<td>' + element.name + '</td>';
            rowData += '<td>' + element.description + '</td>';
            rowData += '<td>' + element.version + '</td>';
            rowData += '<td>' + dateToString(element.created) + '</td>';
            rowData += '<td>' + dateToString(element.modified) + '</td>';
            rowData += '<td>' + element.inuse + '</td>';
            rowData += "<td><input type='button' value='启动' onclick='getDeviceListModule.startDeviceService(this)' content='"+JSON.stringify(element)+"'></td>";
            rowData += "<td><input type='button' value='停止' onclick='getDeviceListModule.stopDeviceService(this)' content='"+JSON.stringify(element)+"'></td>";
            rowData += "<td><input type='button' value='详细信息' content='"+JSON.stringify(element)+"'></td>";
            rowData += "</tr>";
            $("#device_list > table > tbody").append(rowData);
        });
    },

    startDeviceService:function(button){
        var element = JSON.parse($(button).attr("content"));
        var currentRowName = element.name;
        var param = {"Name":currentRowName};
        $.ajax({
            url: '/api/v1/deviceservice/start',
            type: 'POST',
            contentType:'application/json',
            data:JSON.stringify(param),
            success:function(data){
                alert("启动设备服务 " + getDeviceListModule.selectedRow.name);
            }
        });
    },
    stopDeviceService:function(button){
        var element = JSON.parse($(button).attr("content"));
        var currentRowName = element.name;
        var param = {"Name":currentRowName};
        $.ajax({
            url: '/api/v1/deviceservice/stop',
            type: 'POST',
            contentType:'application/json',
            data:JSON.stringify(param),
            success:function(data){
                alert("关闭设备服务 " + getDeviceListModule.selectedRow.name);
            }
        });
    },
}

var devicecontrolModle = {
    startSimpledevice:function() {
        $.ajax({
            url:'/api/v1/deviceservice/start',
            type:'GET',
            async: false,
            dataType: "text",
            success:function(data){
                $("#device-in-use").text("已启动")
            }
        });
    },

    stopSimpledevice:function() {
        $.ajax({
            url:'/api/v1/deviceservice/stop',
            type:'GET',
            async: false,
            dataType: "text",
            success:function(data){
                $("#device-in-use").text("已关闭")
            }
        });
    }
}
