$(document).ready(function(){
    getDeviceListModule.getDeviceList()
});

var getDeviceListModule = {
    selectedRow:null,
    deviceDataCache:[],
    getDeviceList:function() {
        var name;
        $.ajax({
            url:'/api/v1/cldevices/ls',
            type:'GET',
            async: false,
            dataType: "text",
            success:function(data){
                name = data
            }
        });
        return name;
    },
}

var devicecontrolModle = {
    startSimpledevice:function() {
        $.ajax({
            url:'/api/v1/cldevices/startsimpledevice',
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
            url:'/api/v1/cldevices/stopsimpledevice',
            type:'GET',
            async: false,
            dataType: "text",
            success:function(data){
                $("#device-in-use").text("已关闭")
            }
        });
    }
}
