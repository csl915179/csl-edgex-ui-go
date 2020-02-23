$(document).ready(function(){
    getDeviceServiceListModule.getDeviceServiceList();
});

var getDeviceServiceListModule ={
    selectedRow:null,
    deviceServiceDataCache:[],
    getDeviceServiceList:function(){
        $.ajax({
            url: '/api/v1/deviceservice/ls',
            type: 'GET',
            success: function (data) {
                getDeviceServiceListModule.deviceServiceDataCache = data;
                getDeviceServiceListModule.renderDeviceServiceList(data);
                if(data.length != 0){
                    $("#deviceservice_list > table > tfoot").hide();
                }
            }
        })
    },
    renderDeviceServiceList:function(data){
        $("#deviceservice_list > table > tbody").empty();
        $.each(data,function(index,element){
            var rowData = '<tr>';
            rowData += '<td>' + (index + 1) +'</td>';
            rowData += '<td>' + element.id + '</td>';
            rowData += '<td>' + element.name + '</td>';
            rowData += '<td>' + element.description + '</td>';
            rowData += '<td>' + element.version + '</td>';
            rowData += '<td>' + dateToString(element.created) + '</td>';
            rowData += '<td>' + dateToString(element.modified) + '</td>';
            rowData += '<td>' + element.inuse + '</td>';
            rowData += "<td><input type='button' value='详细信息' onclick='manageProfileModule.listServiceDetail(this)' content='"+JSON.stringify(element)+"'></td>";//传入element内容
            rowData += "</tr>";
            $("#deviceservice_list > table > tbody").append(rowData);
        });
    }
};

var manageProfileModule ={
    CurrentService:null,
    listServiceDetail:function(button){
        $("#profile-list-pannel").hide();
        $("#profile-preview-pannel").hide();
        $("#profile_pannel_body").show("fast");
        var element = JSON.parse($(button).attr("content"));
        CurrentService = element;
        document.getElementById("pannel-title").innerHTML = "服务"+element.name+"对应的配置文件管理";
        document.getElementById("service-in-use").innerHTML = "当前服务启动状态:"+element.inuse;
        var deviceRe = element.deviceRes;//获取服务支持的资源信息
        manageProfileModule.getDeviceResourceList(deviceRe);
        manageProfileModule.getMatchedDeviceResourceList()

        
    },
    getDeviceResourceList:function(data){
        $("#deviceRes_list > table > tbody").empty();
        $.each(data,function(index,element) {
            var rowData = '<tr>';
            rowData += '<td>' + (index + 1) +'</td>';
            rowData += '<td>' + element.name + '</td>';
            rowData += '<td>' + element.valuetype + '</td>';
            rowData += '<td>' + element.function + '</td>';
            rowData += "</tr>";
            $("#deviceRes_list > table > tbody").append(rowData);
        });
        if(data.length != 0){
            $("#deviceRes_list > table > tfoot").hide();
        }
    },
    getMatchedDeviceResourceList:function(){
        var name = CurrentService.name;
        var param=[];
        $.each(CurrentService.deviceRes,function(index,element){
            var DevRes = {"name":element.name,"valuetype":element.valuetype,"unittype":element.unittype};
            param.splice(0,0,DevRes);
        });
        $.ajax({
            url: '/api/v1/profile/match',
            type: 'POST',
            contentType:'application/json',
            data:JSON.stringify(param),
            success: function (data){
                manageProfileModule.showMatchedDeviceResourceList(data)
            }
        });
    },
    showMatchedDeviceResourceList:function(data){
        $("#profile_list > table > tbody").empty();
        $.each(data,function(index,element) {
            var rowData = '<tr>';
            rowData += '<td>' + (index + 1) +'</td>';
            rowData += '<td>' + element.id + '</td>';
            rowData += '<td>' + element.name + '</td>';
            rowData += '<td>' + element.description + '</td>';
            rowData += '<td>' + element.version + '</td>';
            rowData += '<td>' + element.created + '</td>';
            rowData += '<td>' + element.modified + '</td>';
            rowData += "<td><input type='button' value='查看json' onclick='manageProfileModule.viewJson(this)' content='"+JSON.stringify(element)+"'></td>";
            rowData += "<td><input type='button' value='查看yaml' onclick='manageProfileModule.viewYaml(this)' content='"+JSON.stringify(element)+"'></td>";
            rowData += "<td><input type='button' value='修改' content='"+JSON.stringify(element)+"'></td>";
            rowData += "<td><input type='button' value='删除' onclick='manageProfileModule.deleteProfile(this)' content='"+JSON.stringify(element)+"'></td>";
            rowData += "</tr>";
            $("#profile_list > table > tbody").append(rowData);
        });
        if(data.length != 0){
            $("#profile_list > table > tfoot").hide();
        }
    },

    //查看和下载json
    viewJson:function(button){//查看json
        $("#profile_pannel_body").hide();
        $("#profile-preview-pannel").show("fast");
        document.getElementById("dowonloadbutton").addEventListener("click",manageProfileModule.downloadJson);
        var jsonPretty = JSON.stringify(JSON.parse($(button).attr("content")),null,2);
        document.getElementById("profile_detail").innerHTML = jsonPretty;
    },
    downloadJson:function(){//下载json
        var jsonData = JSON.parse(document.getElementById("profile_detail").innerHTML);
        delete jsonData.created;
        delete jsonData.modified;
        delete jsonData.id;
        $.each(jsonData.coreCommands,function(index,element){
            delete element.created;
            delete element.modified;
            delete element.id;
        });
        var jsonPretty = JSON.stringify(jsonData,null,2);
        //下载
        var blob = new Blob([jsonPretty],{type:'application/json,charset=utf-8;'});
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = JSON.stringify(jsonData.name) + ".json";
        link.click();
        URL.revokeObjectURL(link.href);
    },

    //查看和下载yaml
    viewYaml:function(button){//查看yaml
        $("#profile_pannel_body").hide();
        $("#profile-preview-pannel").show("fast");
        document.getElementById("dowonloadbutton").addEventListener("click",manageProfileModule.downloadYaml);
        var jsonData = JSON.parse($(button).attr("content"));
        var yamlData = jsyaml.dump(jsonData);
        document.getElementById("profile_detail").innerHTML = yamlData;
    },
    downloadYaml:function(){//下载yaml,读和修改都是通过转成json进行的
        var jsonData = jsyaml.load(document.getElementById("profile_detail").innerHTML);
        delete jsonData.created;
        delete jsonData.modified;
        delete jsonData.id;
        $.each(jsonData.coreCommands,function(index,element){
            delete element.created;
            delete element.modified;
            delete element.id;
        });
        var jsonPretty = JSON.stringify(jsonData,null,2);
        var yamlData = jsyaml.dump(jsonData);
        //document.getElementById("profile_detail").innerHTML = yamlData;
        //下载
        var blob = new Blob([yamlData],{type:'yaml,charset=utf-8;'});
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = JSON.stringify(jsonData.name) + ".yaml";
        link.click();
        URL.revokeObjectURL(link.href);
    },

    //删除配置文件
    deleteProfile(button){
        var profile = JSON.parse($(button).attr("content"));
        bootbox.confirm({
            title: "confirm",
            message: "是否要删除配置文件 ? " + profile.name,
            className: 'green-red-buttons',
            callback: function (result) {
                if (result) {
                    $.ajax({
                        url: '/core-metadata/api/v1/deviceprofile/id/' + profile.id,
                        method: 'DELETE',
                        success: function(){
                            bootbox.alert({
                                message: "Remove Success !",
                                className: 'red-green-buttons'
                            });
                            deviceService.loadDeviceProfile();
                        },
                        statusCode: {
                            404: function(){
                                bootbox.alert({
                                    title: "Error",
                                    message: "device profile cannot be found with the identifier provided !",
                                    className: 'red-green-buttons'
                                });
                            },
                            409: function(){
                                bootbox.alert({
                                    title: "Error",
                                    message: "Can't delete device profile, the profile is still in use by a device !",
                                    className: 'red-green-buttons'
                                });
                            },
                            500: function(){
                                bootbox.alert({
                                    title: "Error",
                                    message: "unknown or unanticipated issues !",
                                    className: 'red-green-buttons'
                                });
                            }
                        }
                    });
                }
            }
        });
        manageProfileModule.getMatchedDeviceResourceList()

    },

    getBack:function(){
        $("#profile_pannel_body").hide();
        $("#profile-list-pannel").show("fast");
    },
    backToDetail:function(){
        $("#profile-preview-pannel").hide();
        $("#profile_pannel_body").show("fast");
    },
}