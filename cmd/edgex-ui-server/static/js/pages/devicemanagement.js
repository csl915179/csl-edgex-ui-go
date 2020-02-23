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
            rowData += '<td><input type="radio" name="deviceRadio" value="'+element.name+'"></td>';
            rowData += '<td>' + (index + 1) +'</td>';//编号
            rowData += '<td>' + element.id + '</td>';//id
            rowData += '<td>' + element.name + '</td>';
            rowData += '<td>' + element.description + '</td>';
            rowData += '<td>' + element.version + '</td>';
            rowData += '<td>' + element.localprofile + '</td>';
            rowData += '<td>' + element.configdir + '</td>';
            rowData += '<td>' + dateToString(element.created) + '</td>';
            rowData += '<td>' + dateToString(element.modified) + '</td>';
            rowData += '<td>' + element.inuse + '</td>';
            rowData += "</tr>";
            $("#device_list > table > tbody").append(rowData);
        });
        $("#device_list > table input:radio").on('click',function(){
            var currentRowName =  $(this).val();
            $.each(getDeviceListModule.deviceDataCache,function(index,ele){
                if(ele.name == currentRowName){
                    getDeviceListModule.selectedRow = Object.assign({},ele);
                    window.sessionStorage.setItem('selectedDevice',JSON.stringify(Object.assign({},getDeviceListModule.selectedRow)));
                }
            });
            var param = {"Name":getDeviceListModule.selectedRow.name};
            $.ajax({
                url: '/api/v1/deviceservice/start',
                type: 'POST',
                contentType:'application/json',
                data:JSON.stringify(param),
                success:function(data){
                    alert("启动设备服务 " + getDeviceListModule.selectedRow.name);
                }
            });
        });

    }
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
