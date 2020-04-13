$(document).ready(function(){
    getDeviceServiceListModule.getDeviceServiceList();
});

var getDeviceServiceListModule ={
    selectedRow:null,
    deviceServiceDataCache:[],
    getDeviceServiceList:function(){
        $.ajax({
            url: '/core-metadata/api/v1/deviceservice',
            type: 'GET',
            success: function (data) {
                getDeviceServiceListModule.deviceServiceDataCache = data;
                getDeviceServiceListModule.renderDeviceServiceList(data);
                if(data.length != 0){
                    $("#deviceservice_list> tfoot").hide();
                }
            }
        })
    },
    renderDeviceServiceList:function(data){
        $("#deviceservice_list > tbody").empty();
        $.each(data,function(i,v){
            var rowData = "<tr>";
            rowData += "<td>" + (i + 1) +"</td>";
            rowData += "<td>" +  v.id + "</td>";
            rowData += "<td>" +  v.name + "</td>";
            rowData += "<td>" +  (v.description?v.description:"") + "</td>";
            rowData += '<td class="device-service-addressable-search-icon"><input type="hidden" value=\''+JSON.stringify(v.addressable)+'\'>' + '<i class="fa fa-search-plus fa-lg"></i>' + '</td>';
            rowData += "<td>" +  v.operatingState + "</td>";
            rowData += "<td>" +  v.adminState + "</td>";
            rowData += "<td>" +  dateToString(v.created) + "</td>";
            rowData += "<td>" +  dateToString(v.modified) + "</td>";
            rowData += "<td><input type='button' value='详细信息' onclick='manageProfileModule.listServiceDetail(this)' content='"+JSON.stringify(v.labels)+"'></td>";
            rowData += "</tr>";
            $("#deviceservice_list > tbody").append(rowData);
        });
    }
};

var manageProfileModule ={
    CurrentdeviceResourceList:null,
    listServiceDetail:function(button){
        var deviceResourceList = JSON.parse(JSON.parse($(button).attr("content"))[0]).deviceResources;
        CurrentdeviceResourceList = deviceResourceList;
        manageProfileModule.getDeviceResourceList(deviceResourceList)
    },
    getDeviceResourceList:function(data){
        $("#profile_pannel_body").show("fast");
        $("#deviceRes_list > table > tbody").empty();
        $.each(data,function(index,element) {
            var rowData = '<tr>';
            rowData += '<td>' + (index + 1) +'</td>';
            rowData += '<td>' + element.name + '</td>';
            rowData += '<td>' + element.value.type + '</td>';
            rowData += '<td>' + element.value.readWrite + '</td>';
            rowData += '<td>' + element.units.type + '</td>';
            rowData += '<td>' + element.units.readWrite + '</td>';
            rowData += "</tr>";
            $("#deviceRes_list > table > tbody").append(rowData);
        });
        if(data.length != 0){
            $("#deviceRes_list > table > tfoot").hide();
        }
        manageProfileModule.getMatchedDeviceResourceList();
    },
    getMatchedDeviceResourceList:function(){//找出可以匹配的配置文件列表
        var profilelist;
        var matchedProfileList = [];
        $.ajax({
            url: '/core-metadata/api/v1/deviceprofile',
            type: 'GET',
            cache : false,
            async : false,
            success: function (data) {
                profilelist = data;
            }
        });
        $.each(profilelist,function (index,profile) {//遍历每一个edgex中的配置文件进行比对
            var flag = false;
            $.each(profile.deviceResources,function (index,deviceResource) {//遍历这个配置文件中的devicResource进行比对
                flag = false;
                $.each(CurrentdeviceResourceList, function (index,CurrentdeviceResource) {//和服务可以提供的每一个devicResource比对
                    if(manageProfileModule.matchDeviceResource(deviceResource, CurrentdeviceResource)){
                        flag = true;
                        return false;
                    }
                });
                if(flag == false){
                    return false;
                };
            });
            if(flag == false){
                return true;
            };
            matchedProfileList.push(profile);
        });
        manageProfileModule.showMatchedDeviceResourceList(matchedProfileList);
    },
    matchDeviceResource:function(profile,service){//判断DeviceResource是否匹配
        if(profile.name != service.name) return false;//名称

        else if(profile.properties.value.type != service.value.type) return false;//值类型

        else if(profile.properties.units.type != service.units.type) return false;//单位类型

        else if((profile.properties.value.readWrite == "R" && service.value.readWrite.indexOf("W") != -1) ||//值读写
            (profile.properties.value.readWrite == "W" && service.value.readWrite.indexOf("R") != -1) ) return false;

        else if((profile.properties.units.readWrite == "R" && service.units.readWrite.indexOf("W") != -1) ||//单位读写
            (profile.properties.units.readWrite == "W" && service.units.readWrite.indexOf("R") != -1) ) return false;
        return true;
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
            rowData += "<td><input type='button' value='修改' onclick='manageProfileModule.editProfile(this)' content='"+JSON.stringify(element)+"'></td>";
            rowData += "<td><input type='button' value='删除' onclick='manageProfileModule.deleteProfile(this)' content='"+JSON.stringify(element)+"'></td>";
            rowData += "</tr>";
            $("#profile_list > table > tbody").append(rowData);
        });
        if(data.length != 0){
            $("#profile_list > table > tfoot").hide();
        };
        $("#creatProfile").off('click').on('click',function(){
            var profile = {};
            editProfileModel.setCurrentService(CurrentdeviceResourceList,profile);
        });
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
            message: "是否要删除配置文件: " + "<font color='red'>" + profile.name + "</font>" + "?<br/><font color = 'red'>删除后不可恢复，确定删除?</font>",
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
    //修改配置文件
    editProfile(button){
        var profile = JSON.parse($(button).attr("content"));
        editProfileModel.ProfileToEdit = profile;
        editProfileModel.setCurrentService(CurrentdeviceResourceList,profile)
    },

    getBack:function(){
        $("#profile_pannel_body").hide();
        $("#profile-list-pannel").show("fast");
    },
    backToDetail:function(){
        $("#profile-preview-pannel").hide();
        $("#profile_pannel_body").show("fast");
    },
};

var editProfileModel ={
    OriginalProfile: {},//原来的profile
    ProfileToEdit : {},//原来的profile的副本，修改时对其进行修改
    CurrentService : {},//首先要定义当前服务可以提供的DeviceResources以进行使用
    BasicInfo: null,//记录用户指定好的基本信息
    DeviceResourceDetailList: {},//记录用户指定好的DeviceResources
    DeviceCommandDetailList : {},//记录用户指定好的DeviceCommands
    CoreCommandDetailList : {},//记录用户指定好的CoreCommands

    setCurrentService:function(Servicedata,OriginalProfile){//新建的时候传入{}，编辑的时候传入profile的json
        editProfileModel.OriginalProfile = JSON.parse(JSON.stringify(OriginalProfile));
        editProfileModel.ProfileToEdit = JSON.parse(JSON.stringify(OriginalProfile));//注意取一份副本，因为Json对象传值引用
        delete editProfileModel.ProfileToEdit.created;
        delete editProfileModel.ProfileToEdit.modified;
        delete editProfileModel.ProfileToEdit.id;
        editProfileModel.CurrentService = Servicedata;
        editProfileModel.BasicInfo = null;
        editProfileModel.DeviceResourceDetailList = {};
        editProfileModel.DeviceCommandDetailList = {};
        editProfileModel.CoreCommandDetailList = {};
        editProfileModel.InitDeviceResourceList();
        editProfileModel.InitDeviceCommandList();
        editProfileModel.InitCoreCommandList();
        editProfileModel.DefineBasicInfo();
    },
    InitDeviceResourceList:function(){
        $.each(editProfileModel.CurrentService,function(index,element){//初始化DeviceResourceDetailList，以记录当前各个可以提供的DevicResource的状态
            var resourceDetail = {
                info : element,
                createdResource : null,
            };
            editProfileModel.DeviceResourceDetailList[element.name] = resourceDetail;
        });
    },
    InitDeviceCommandList:function(){
        if (JSON.stringify(editProfileModel.OriginalProfile) == "{}"){
            editProfileModel.DeviceCommandDetailList = {};
            return true;
        }
        if (editProfileModel.OriginalProfile.deviceCommands == null){
            editProfileModel.DeviceCommandDetailList = {};
            return true;
        }
        $.each(editProfileModel.OriginalProfile.deviceCommands,function (index,element) {
            editProfileModel.DeviceCommandDetailList[element.name] = {"name":element.name, "get":{}, "set":{}};
            $.each(element.get,function(index,getCommand){
                resource = getCommand.deviceResource;
                parameter = getCommand.parameter;
                editProfileModel.DeviceCommandDetailList[element.name].get[resource] = {"name":resource, "parameter":parameter};
            });
            $.each(element.set,function(index,setCommand){
                resource = setCommand.deviceResource;
                parameter = setCommand.parameter;
                editProfileModel.DeviceCommandDetailList[element.name].set[resource] = {"name":resource, "parameter":parameter};
            });
        })
    },
    InitCoreCommandList:function(){
        if (JSON.stringify(editProfileModel.OriginalProfile) == "{}"){
            editProfileModel.CoreCommandDetailList = {};
            return true;
        }
        if (editProfileModel.OriginalProfile.deviceCommands == null){
            editProfileModel.CoreCommandDetailList = {};
            return true;
        }
        $.each(editProfileModel.OriginalProfile.coreCommands,function (index,element) {
            editProfileModel.CoreCommandDetailList[element.name] = {"name":element.name ,"get":{"responses":{}}, "put":{"responses":{}}, "check":"PASS"};
            if (element.get.hasOwnProperty("path")){
                editProfileModel.CoreCommandDetailList[element.name]['get']["path"] = element.get.path;
                $.each(element.get.responses,function (index,response) {
                    code = response.code;
                    editProfileModel.CoreCommandDetailList[element.name]["get"]["responses"][code] = response;
                });
                var get_resource_list = {};
                $.each(editProfileModel.CoreCommandDetailList[element.name]["get"]["responses"]["200"].expectedValues,function (index,resource) {
                    get_resource_list[resource] = {"name":resource, "check":"PASS"};
                });
                editProfileModel.CoreCommandDetailList[element.name]["get"]["responses"]["200"].expectedValues = get_resource_list;
            }
            if (element.put.hasOwnProperty("path")){
                editProfileModel.CoreCommandDetailList[element.name]["put"]["path"] = element.put.path;
                editProfileModel.CoreCommandDetailList[element.name]["put"]["parameterNames"] = element.put.parameterNames;
                $.each(element.put.responses,function (index,response) {
                    code = response.code;
                    editProfileModel.CoreCommandDetailList[element.name]["put"]["responses"][code] = response;
                });
                var put_resource_list = {};
                $.each(element.put.parameterNames,function (index,parameter) {
                    put_resource_list[parameter] = {"name":parameter, "check":"PASS"};
                });
                editProfileModel.CoreCommandDetailList[element.name]["put"].parameterNames = put_resource_list;
            }
        })
    },

    DefineBasicInfo:function(){//定义基本信息部分
        $("#basic-profile-info").show("fast");
        $("#edit-profile-profilename").val(editProfileModel.ProfileToEdit.name);
        $("#edit-profile-profilemanufacturer").val(editProfileModel.ProfileToEdit.manufacturer);
        $("#edit-profile-profilemodel").val(editProfileModel.ProfileToEdit.model);
        $("#edit-profile-profilelabels").val(editProfileModel.ProfileToEdit.labels);
        $("#submit-basic-profile-info").off('click').on('click',function(){
            editProfileModel.ProfileToEdit.name = $("#edit-profile-profilename").val().trim();
            editProfileModel.ProfileToEdit.manufacturer = $("#edit-profile-profilemanufacturer").val().trim();
            editProfileModel.ProfileToEdit.model = $("#edit-profile-profilemodel").val().trim();
            editProfileModel.ProfileToEdit.labels = $("#edit-profile-profilelabels").val().split(',');
            editProfileModel.DefineDeviceResources();
        });
        $("#cancel-basic-profile-info").off('click').on('click',function() {
            $("#edit-profile-profilename input").val("");
            $("#basic-profile-info").hide();
        });
    },

    //DeviceResource部分
    //新建DeviceResource主界面
    DefineDeviceResources:function(){
        $("#basic-profile-info").hide();
        $("#deviceResource-info").show("fast");
        $.each(editProfileModel.ProfileToEdit.deviceResources,function(index,element){//如果是编辑已有的配置文件，则需要把其中已经定义的DeviceResource加载进去
            editProfileModel.DeviceResourceDetailList[element.name].createdResource = element;
        });
        editProfileModel.getDefinedDeviceResourceList();
        $("#show_deviceResource_list").off('click').on('click',function(){
            editProfileModel.getDefinedDeviceResourceList();
        });
        $("#add_deviceResource").off('click').on('click',function(){
            var list = {};
            $.each(editProfileModel.DeviceResourceDetailList,function(name,value){//初始化DeviceResource下拉框,这个下拉框只显示还没有定义的DeviceResource
                if (value.createdResource == null){
                    list[name] = value;
                };
            });
            editProfileModel.AddDeviceResource(list);
        });
        $("#back-deviceResource-info").off('click').on('click',function () {
            $("#deviceResource-info").hide();
            $("#basic-profile-info").show('fast');
        });
        $("#submit-deviceResource-info").off('click').on('click',function () {
            var ResourceDefined = false;
            $.each(editProfileModel.DeviceResourceDetailList,function(name,value){//初始化DeviceResource下拉框
                if (value.createdResource != null){
                    ResourceDefined = true;
                    return false;
                };
            });
            if(ResourceDefined == false){
                alert("还没有定义任何DeviceResource，不能进行接下来定义DeviceCommand的操作，请先定义一些DeviceResource!");
                return false;
            }
            var DeviceResourceArray = [];
            $.each(editProfileModel.DeviceResourceDetailList,function(name,value){
                if (value.createdResource != null) DeviceResourceArray.push(value.createdResource);
            });
            editProfileModel.ProfileToEdit.deviceResources = DeviceResourceArray;
            $("#basic-profile-info").hide();
            $("#deviceCommand-info").show('fast');
            editProfileModel.DefineDeviceCommands();
        });
    },
    //刷新定义好的DeviceResource列表
    getDefinedDeviceResourceList:function(){
        $("#deviceResource-info").show("fast");
        var index = 0;
        $("#deviceResource-list > table > tbody").empty();
        $.each(editProfileModel.DeviceResourceDetailList,function(name,element){
            if (element.createdResource != null){
                index++;
                var rowData = '<tr>';
                rowData += '<td>' + index +'</td>';
                rowData += '<td>' + element.createdResource.name +'</td>';
                rowData += '<td>' + element.createdResource.description +'</td>';
                rowData += '<td>' + element.createdResource.tag +'</td>';
                rowData += "<td><input type='button' value='详细信息' onclick='editProfileModel.showDeviceResourceDetail(this)' content='"+JSON.stringify(element)+"'></td>";
                rowData += "</tr>";
                $("#deviceResource-list > table > tbody").append(rowData);
            };
        });
        if(index != 0){
            $("#deviceResource-list > table > tfoot").hide();
        };
    },
    //初始化新建DeviceResource项目编写页面
    AddDeviceResource:function(List){
        if (JSON.stringify(List) == "{}"){
            alert("没有可以定义的DeviceResource了，请考虑修改已有的DeviceResource。");
            return false;
        }
        $("#define-deviceResource").show("fast");
        var obj = document.getElementById("define-deviceResource-deviceResourcename");
        obj.options.length=0;
        $.each(List,function(name,value){//初始化DeviceResource下拉框
            obj.options.add(new Option(name,name))
        });
        editProfileModel.setReadWriteSelections(List,obj.value);//先初始化一下ReadWrite下拉框
        obj.onchange = function () {
            editProfileModel.setReadWriteSelections(List,obj.value);
        };
        if (List[obj.value].createdResource != null){
            var info = List[obj.value].createdResource;
            $("#define-deviceResource-deviceResourcedescription").val(info.description);
            $("#define-deviceResource-deviceResourcetag").val(info.tag);
            $("#define-deviceResource-deviceResourceValueReadWrite").val(info.properties.value.readWrite);
            $("#define-deviceResource-deviceResourceValueDefaultValue").val(info.properties.value.defaultValue);
            $("#define-deviceResource-deviceResourceValueMinium").val(info.properties.value.minium);
            $("#define-deviceResource-deviceResourceValueMaxium").val(info.properties.value.maxium);
            $("#define-deviceResource-deviceResourceUnitsDefaultValue").val(info.properties.units.defaultValue);
        };
        $("#define-deviceResource-Submit").off('click').on('click',function(){
            var ResourceName = $("#define-deviceResource-deviceResourcename").val();
            var Resource = {
                description : $("#define-deviceResource-deviceResourcedescription").val(),
                name : ResourceName,
                tag : $("#define-deviceResource-deviceResourcetag").val().split(','),
                properties : {
                    value : {
                        type : List[ResourceName].info.value.type,
                        readWrite : $("#define-deviceResource-deviceResourceValueReadWrite").val(),
                        defaultValue : $("#define-deviceResource-deviceResourceValueDefaultValue").val(),
                        minium : $("#define-deviceResource-deviceResourceValueMinium").val(),
                        maxium : $("#define-deviceResource-deviceResourceValueMaxium").val()
                    },
                    units : {
                        type : List[ResourceName].info.units.type,
                        readWrite : $("#define-deviceResource-deviceResourceUnitsReadWrite").val(),
                        defaultValue : $("#define-deviceResource-deviceResourceUnitsDefaultValue").val()
                    }
                }
            };
            editProfileModel.DeviceResourceDetailList[ResourceName].createdResource = Resource;
            editProfileModel.getDefinedDeviceResourceList();
            $("#define-deviceResource").hide();
            $("#define-deviceResource input").val("");
        });
        $("#define-deviceResource-Cancel").off('click').on('click',function(){
            $("#define-deviceResource").hide();
            $("#define-deviceResource input").val("");
        });
    },
    //联动初始化RW下拉框
    setReadWriteSelections:function(List,name){
        var OriginValueRW = "", OrigionUnitRW = "";
        if (List[name].createdResource != null){
            OriginValueRW = List[name].createdResource.properties.value.readWrite;
            OrigionUnitRW = List[name].createdResource.properties.units.readWrite;
        };
        var valueRW = new Array()
        valueRW[0] = List[name].info.value.readWrite;
        if (List[name].info.value.readWrite == "RW"){
            valueRW[1] = "R";
            valueRW[2] = "W";
        }
        var unitRW = new Array();
        unitRW[0] = List[name].info.units.readWrite;
        if (List[name].info.units.readWrite == "RW"){
            unitRW[1] = "R";
            unitRW[2] = "W";
        }
        var valueobj = document.getElementById("define-deviceResource-deviceResourceValueReadWrite");
        valueobj.options.length=0;
        $.each(valueRW,function(index,readWrite){//初始化Value的RW框
            valueobj.options.add(new Option(readWrite, readWrite, false, readWrite==OriginValueRW));
        });
        var unitobj = document.getElementById("define-deviceResource-deviceResourceUnitsReadWrite");
        unitobj.options.length=0;
        $.each(unitRW,function(index,readWrite){//初始化Value的RW框
            unitobj.options.add(new Option(readWrite, readWrite, false, readWrite==OrigionUnitRW));
        });
    },
    //删除某条定义好的DeviceResource
    DeleteDeviceResource:function(name){
        bootbox.confirm({
            title: "提示",
            message: "是否要删除DeviceResource: " + "<font color = 'red'>" + name+ "</font>" + "?<br/><font color = 'red'>删除后不可恢复，确定删除?</font>",
            className: 'green-red-buttons',
            callback: function (result) {
                if (result) {
                    editProfileModel.DeviceResourceDetailList[name].createdResource = null;
                    $("#deviceResource-detail").hide();
                    editProfileModel.getDefinedDeviceResourceList();
                }
            }
        });
    },
    //显示某条deviceResource细节界面
    showDeviceResourceDetail:function(button){
        $("#deviceResource-detail").show("fast");
        data = JSON.parse($(button).attr("content"));
        CreatedResource = data.createdResource;
        document.getElementById("deviceResource-detail-deviceResourcename").innerHTML = CreatedResource.name;
        document.getElementById("deviceResource-detail-deviceResourcedescription").innerHTML = CreatedResource.description;
        document.getElementById("deviceResource-detail-deviceResourcetag").innerHTML = CreatedResource.tag;
        document.getElementById("deviceResource-detail-deviceResourceValueReadWrite").innerHTML = CreatedResource.properties.value.readWrite;
        document.getElementById("deviceResource-detail-deviceResourceValueDefaultValue").innerHTML = CreatedResource.properties.value.defaultValue;
        document.getElementById("deviceResource-detail-deviceResourceValueMinium").innerHTML = CreatedResource.properties.value.minium;
        document.getElementById("deviceResource-detail-deviceResourceValueMaxium").innerHTML = CreatedResource.properties.value.maxium;
        document.getElementById("deviceResource-detail-deviceResourceUnitsReadWrite").innerHTML = CreatedResource.properties.units.readWrite;
        document.getElementById("deviceResource-detail-deviceResourceUnitsDefaultValue").innerHTML = CreatedResource.properties.units.defaultValue;
        $("#close-deviceResource-detail").off('click').on('click',function(){
            $("#deviceResource-detail").hide();
            $("#deviceResource-detail span").val("");
        });
        $("#deviceResource-detail-delete").off('click').on('click',function(){
            var name = CreatedResource.name;
            editProfileModel.DeleteDeviceResource(name);
        });
        $("#deviceResource-detail-edit").off('click').on('click',function(){
            var detaildata = {};
            detaildata[CreatedResource.name] = data;
            $("#deviceResource-detail").hide();
            $("#deviceResource-detail span").val("");
            editProfileModel.AddDeviceResource(detaildata);
        });
    },


    //deviceCommand部分
    DefineDeviceCommands:function(){
        $("#deviceCommand-info").show('fast');
        $("#deviceResource-info").hide();
        if(JSON.stringify(editProfileModel.ProfileToEdit.deviceCommands) == "{}"){
            editProfileModel.ProfileToEdit.deviceCommands = {};
        }
        if (editProfileModel.ProfileToEdit.deviceResources == null){
            editProfileModel.ProfileToEdit.deviceResources = {};
        }
        editProfileModel.CheckDeviceCommands();
        editProfileModel.getDefinedDeviceCommandList();
        $("#add_deviceCommand").off('click').on('click',function(){
            var DeviceCommandDetail = {};
            editProfileModel.AddDeviceCommand(DeviceCommandDetail);
        });
        $("#show_deviceCommand_list").off('click').on('click',function(){
            editProfileModel.getDefinedDeviceCommandList();
        });
        $("#back-deviceCommand-info").off('click').on('click',function(){
            editProfileModel.DefineDeviceResources();
            $("#deviceCommand-info").hide();
        });
        $("#submit-deviceCommand-info").off('click').on('click',function(){
            if (editProfileModel.CheckDeviceCommands() == false) return false;
            var DeviceCommandArray = [];
            $.each(editProfileModel.DeviceCommandDetailList,function(name,value){
                var getArray = [];
                var getCommand = {};
                $.each(value.get,function (name,get) {
                    getCommand["operation"] = "get";
                    getCommand["deviceResource"] = get.name;
                    getCommand["parameter"] = get.parameter;
                    getArray.push(JSON.parse(JSON.stringify(getCommand)));
                });
                var setArray = [];
                var setCommand = {};
                $.each(value.set,function (name,set) {
                    setCommand["operation"] = "set";
                    setCommand["deviceResource"] = set.name;
                    setCommand["parameter"] = set.parameter;
                    setArray.push(setCommand);
                });
                var command = {
                    "name" : value.name,
                    "get" : getArray,
                    "set" : setArray,
                };
                DeviceCommandArray.push(JSON.parse(JSON.stringify(command)));
            });
            editProfileModel.ProfileToEdit.deviceCommands = DeviceCommandArray;
            $("#deviceCommand-info").hide();
            editProfileModel.DefineCoreCommands();
        });
    },
    //验证当前已有的DeviceCommand是否有效，返回是否有效并对其标定
    CheckDeviceCommands:function(){
        var res = true;
        $.each(editProfileModel.DeviceCommandDetailList,function (name,element) {
            var deviceCommandName = name;
            $.each(element.get,function(index,getCommand){
                getCommand["check"] = "PASS";
                resource = getCommand.name;
                parameter = getCommand.parameter;
                if(editProfileModel.DeviceResourceDetailList[resource].createdResource == null){
                    alert("检测到" +"deviceCommand: " + deviceCommandName + " 中的deviceResource: " + resource + " 不存在，可能在上一步定义deviceResource时已经被删除，请注意检查！");
                    getCommand["check"] = "EXISTENCE ERROR";
                    res = false;
                }
                else if(editProfileModel.DeviceResourceDetailList[resource].createdResource.properties.value.readWrite == "W"){
                    alert("检测到" +"deviceCommand: " + deviceCommandName + " 中的deviceResource: " + resource + " 不允许进行get操作，可能在上一步定义deviceResource时已经被修改，请注意检查！");
                    getCommand["check"] = "RW ERROR";
                    res = false;
                }
                else{
                    getCommand["check"] = "PASS";
                }
            });
            $.each(element.set,function(index,setCommand){
                setCommand["check"] = "PASS";
                resource = setCommand.name;
                parameter = setCommand.parameter;
                if(editProfileModel.DeviceResourceDetailList[resource].createdResource == null){
                    alert("检测到" +"deviceCommand: " + deviceCommandName + " 中的deviceResource: " + resource + " 不存在，可能在上一步定义deviceResource时已经被删除，请注意检查！");
                    setCommand["check"] = "EXISTENCE ERROR";
                    res = false;
                }
                else if(editProfileModel.DeviceResourceDetailList[resource].createdResource.properties.value.readWrite == "R"){
                    alert("检测到" +"deviceCommand: " + deviceCommandName + " 中的deviceResource: " + resource + " 不允许进行set操作，可能在上一步定义deviceResource时已经被修改，请注意检查！");
                    setCommand["check"] = "RW ERROR";
                    res = false;
                }
                else{
                    setCommand["check"] = "PASS";
                }
            });
        })
        return res;
    },
    //刷新定义好的DeviceCommand列表
    getDefinedDeviceCommandList:function(){
        var index = 0;
        $("#deviceCommand-list > table > tbody").empty();
        $("#deviceCommand-list > table > tfoot").show('fast');
        $.each(editProfileModel.DeviceCommandDetailList,function(name,element){
            index++;
            var rowData = '<tr>';
            rowData += '<td>' + index +'</td>';
            var ErrorCount = 0, GetInfo = [], SetInfo = [];
            $.each(element.get,function (name,get) {
                GetInfo.push(get.name);
                if(get.check != "PASS") ErrorCount++;
            });
            $.each(element.set,function (name,set) {
                SetInfo.push(set.name);
                if(set.check != "PASS") ErrorCount++;
            });
            if (ErrorCount == 0){
                rowData += '<td>' + "NO ERROR" +'</td>';
            }
            else{
                rowData += '<td>' + '<font color="red">' + ErrorCount + " ERRORS" + '</font>' +'</td>';
            }
            rowData += '<td>' + element.name +'</td>';
            rowData += '<td>' + GetInfo +'</td>';
            rowData += '<td>' + SetInfo +'</td>';
            var detail=element;
            rowData += "<td><input type='button' value='详细信息' class='deviceCommand-list-showdetail' content='"+JSON.stringify(detail)+"'></td>";
            rowData += "<td><input type='button' value= '删除' class='deviceCommand-list-delCommand' content='"+JSON.stringify(detail)+"'></td>";
            rowData += "</tr>";
            $("#deviceCommand-list > table > tbody").append(rowData);
        });
        if(index != 0){
            $("#deviceCommand-list > table > tfoot").hide();
        };
        $(".deviceCommand-list-showdetail").off('click').on('click',function(){
            DeviceCommandDetail = JSON.parse($(this).attr("content"));
            editProfileModel.showDeviceCommandDetail(DeviceCommandDetail);
        });
        $(".deviceCommand-list-delCommand").off('click').on('click',function(){
            DeviceCommandDetail = JSON.parse($(this).attr("content"));
            var name = DeviceCommandDetail.name;
            bootbox.confirm({
                title: "提示",
                message: "是否要删除DeviceCommand: " + "<font color='red'>" + name + "</font>" + "?<br/><font color = 'red'>删除后不可恢复，确定删除?</font>",
                className: 'green-red-buttons',
                callback: function (result) {
                    if (result) {
                        delete editProfileModel.DeviceCommandDetailList[name];
                        editProfileModel.getDefinedDeviceCommandList();
                    }
                }
            });
        });
    },
    //展示某个DeviceCommand详情页面
    showDeviceCommandDetail:function(DeviceCommandDetail){
        $("#deviceCommand-detail").show("fast");
        document.getElementById("deviceCommand-detail-name").innerHTML = DeviceCommandDetail.name;
        index = 0;
        $("#deviceCommand-detail-get > tbody").empty();
        $("#deviceCommand-detail-get > tfoot").show('fast');
        $.each(DeviceCommandDetail.get,function (name,get) {
            index ++;
            var rowData = '<tr>';
            rowData += '<td>' + index +'</td>';
            rowData += '<td>' + get.name +'</td>';
            rowData += '<td>' + get.parameter +'</td>';
            if (get.check == "PASS"){
                rowData += '<td>' + get.check +'</td>';
            }
            else{
                rowData += '<td>' + '<font color="red">' + get.check + '</font>' +'</td>';
            }
            rowData += "</tr>";
            $("#deviceCommand-detail-get > tbody").append(rowData);
        });
        if(index != 0){
            $("#deviceCommand-detail-get > tfoot").hide();
        };
        index = 0;
        $("#deviceCommand-detail-set > tbody").empty();
        $("#deviceCommand-detail-set > tfoot").show('fast');
        $.each(DeviceCommandDetail.set,function (name,set) {
            index ++;
            var rowData = '<tr>';
            rowData += '<td>' + index +'</td>';
            rowData += '<td>' + set.name +'</td>';
            rowData += '<td>' + set.parameter +'</td>';
            if (set.check == "PASS"){
                rowData += '<td>' + set.check +'</td>';
            }
            else{
                rowData += '<td>' + '<font color="red">' + set.check +'</font>' +'</td>';
            }
            rowData += "</tr>";
            $("#deviceCommand-detail-set > tbody").append(rowData);
        });
        if(index != 0){
            $("#deviceCommand-detail-set > tfoot").hide();
        };
        $("#close-deviceCommand-detail").off('click').on('click',function(){
            $("#deviceCommand-detail").hide();
        });
        $("#edit-deviceCommand-detail").off('click').on('click',function(){
            $("#deviceCommand-detail").hide();
            editProfileModel.AddDeviceCommand(DeviceCommandDetail);
        });
    },
    //新建或编辑某条deviceCommand，DeviceCommandDetail是传入的预定义好的准备编辑的某条command,无中生有新建时传入的是{}
    //DeviceCommandDetail = {"Image":{"get":{"Image":{"name":"Image","check":"PASS"}},"set":{}}},只有一条
    AddDeviceCommand:function(DeviceCommandDetail){
        if (JSON.stringify(DeviceCommandDetail) == "{}"){//需要新建DeviceCommand时，先指定一个名称，然后按编辑处理
            $("#edit-deviceCommand-DefineNewCommandName").show('fast');
            $("#edit-deviceCommand-DefineNewCommandName-Submit").off('click').on('click',function(){
                var name = $("#edit-deviceCommand-DefineNewCommandName-name").val();
                if(name == ""){
                    alert("名称不能为空");
                    return false;
                }
                DeviceCommandDetail = {
                        "name" : name,
                        "set" : {},
                        "get" : {}
                };
                $("edit-deviceCommand-DefineNewCommandName-name").val();
                $("#edit-deviceCommand-DefineNewCommandName").hide();
                editProfileModel.showDeviceCommandResources(DeviceCommandDetail);
            });
            $("#edit-deviceCommand-DefineNewCommandName-Cancel").off('click').on('click',function(){
                $("edit-deviceCommand-DefineNewCommandName-name").val();
                $("#edit-deviceCommand-DefineNewCommandName").hide();
                return false;
            });
        }
        else editProfileModel.showDeviceCommandResources(DeviceCommandDetail);
    },
    //查看和修改DeviceCommand里面的Resource,编辑主界面，带列表
    showDeviceCommandResources:function(DeviceCommandDetail){
        $("#edit-deviceCommand").show('fast');
        var CommandName = DeviceCommandDetail.name;
        document.getElementById("edit-deviceCommand-name").innerHTML = CommandName;
        //填充两个列表
        if(DeviceCommandDetail == null){
            $("#edit-deviceCommand-get > tbody").empty();
            $("#edit-deviceCommand-get > tfoot").show('fast');
            $("#edit-deviceCommand-set > tbody").empty();
            $("#edit-deviceCommand-set > tfoot").show('fast');
        }
        else{
            editProfileModel.showDeviceCommandResourceList(DeviceCommandDetail);
        }
        var DeviceCommandDetailToEdit = JSON.parse(JSON.stringify(DeviceCommandDetail));//创建一个DeviceCommandDetail的副本用于编辑
        editProfileModel.showDeviceCommandResourceList(DeviceCommandDetailToEdit);
        $("#submit-edit-deviceCommand").off('click').on('click',function(){//确认按键功能
            editProfileModel.DeviceCommandDetailList[CommandName] = DeviceCommandDetailToEdit;
            editProfileModel.getDefinedDeviceCommandList();
            $("#edit-deviceCommand").hide();
        });
        $("#cancel-edit-deviceCommand").off('click').on('click',function(){//取消按键功能
            $("#edit-deviceCommand").hide();
        });
    },
    //刷新编辑界面的Resource列表
    showDeviceCommandResourceList:function(DeviceCommandDetail){
        var CommandName = DeviceCommandDetail.name;
        var detail = DeviceCommandDetail;
        var index = 0;
        $("#edit-deviceCommand-get > tbody").empty();
        $("#edit-deviceCommand-get > tfoot").show('fast');
        $.each(DeviceCommandDetail.get,function (name,get) {
            index ++;
            var rowData = '<tr>';
            rowData += '<td>' + index +'</td>';
            rowData += '<td>' + get.name +'</td>';
            rowData += '<td>' + get.parameter +'</td>';
            if (get.check == "PASS"){
                rowData += '<td>' + get.check +'</td>';
            }
            else{
                rowData += '<td>' + '<font color="red">' + get.check + '</font>' +'</td>';
            }
            var editinfo = {"type":"get", "info":get};
            rowData += "<td><input type='button' class='edit-deviceCommand-delDeviceResource' value='删除' content='"+JSON.stringify(editinfo)+"'></td>";
            rowData += "</tr>";
            $("#edit-deviceCommand-get > tbody").append(rowData);
        });
        if(index != 0){
            $("#edit-deviceCommand-get > tfoot").hide();
        };
        var index = 0;
        $("#edit-deviceCommand-set > tbody").empty();
        $("#edit-deviceCommand-set > tfoot").show('fast');
        $.each(DeviceCommandDetail.set,function (name,set) {
            index ++;
            var rowData = '<tr>';
            rowData += '<td>' + index +'</td>';
            rowData += '<td>' + set.name +'</td>';
            rowData += '<td>' + set.parameter +'</td>';
            if (set.check == "PASS"){
                rowData += '<td>' + set.check +'</td>';
            }
            else{
                rowData += '<td>' + '<font color="red">' + set.check +'</font>' +'</td>';
            }
            var editinfo = {"type":"set", "info":set};
            rowData += "<td><input type='button' class='edit-deviceCommand-delDeviceResource' value='删除' content='"+JSON.stringify(editinfo)+"'></td>";
            rowData += "</tr>";
            $("#edit-deviceCommand-set > tbody").append(rowData);
        });
        if(index != 0){
            $("#edit-deviceCommand-set > tfoot").hide();
        };
        $(".edit-deviceCommand-delDeviceResource").off('click').on('click',function(){//删除这个DeviceResource功能
            data = JSON.parse($(this).attr("content"));
            var Type = data.type, ResourceName = data.info.name;//获取到底是get还是set以及被删掉的资源的名字，info记录了具体的资源的信息
            var NewCommandName = DeviceCommandDetail.name;
            bootbox.confirm({
                title: "提示",
                message: "是否要删除DeviceCommand " + "<font color = 'red'>" + NewCommandName+ "</font>" + "中 " + Type + " 项目的DeviceResource: " + "<font color = 'red'>"+ ResourceName + "</font>"  + "?<br/><font color = 'red'>删除后不可恢复，确定删除?</font>",
                className: 'green-red-buttons',
                callback: function (result) {
                    if (result) {
                        delete DeviceCommandDetail[Type][ResourceName];
                        editProfileModel.showDeviceCommandResourceList(DeviceCommandDetail);//用重新生成的DeviceCommandDetail刷新列表
                    }
                }
            });
        });
        $(".edit-deviceCommand-new").off('click').on('click',function(){//新建get/set项目功能
            var type = $(this).attr("content");
            editProfileModel.EditDeviceCommand(type,DeviceCommandDetail);
        });
    },
    //新建界面初始化和相关按键
    EditDeviceCommand:function(type,DeviceCommandDetail){
        $("#edit-deviceCommand-defineDeviceResource").show('fast');
        var DeviceResource = {};//维护1个dict，用以记录当前DeviceCommand还没有使用的DeviceResource
        var CommandName = DeviceCommandDetail.name;//当前DeviceCommand名字
        if (type == "get"){
            $.each(editProfileModel.ProfileToEdit.deviceResources,function (index,value) {
                var ResourceName = value.name;
                var RW = value.properties.value.readWrite;
                var Command = DeviceCommandDetail;
                if((RW == "R" || RW == "RW") && (Command.get[ResourceName] == null)) DeviceResource[ResourceName] = value;
            });
        }
        else if (type == "set"){
            $.each(editProfileModel.ProfileToEdit.deviceResources,function (index,value) {
                var ResourceName = value.name;
                var RW = value.properties.value.readWrite;
                var Command = DeviceCommandDetail;
                if((RW == "W" || RW == "RW") && (Command.set[ResourceName] == null)) DeviceResource[ResourceName] = value;
            });
        }
        //填充页面内容
        document.getElementById("edit-deviceCommand-defineDeviceResource-type").innerHTML = type;
        var obj = document.getElementById("edit-deviceCommand-defineDeviceResource-deviceResourcename");
        obj.options.length=0;
        $.each(DeviceResource,function(name,value){//初始化DeviceResource下拉框
            obj.options.add(new Option(name,name))
        });
        $("#edit-deviceCommand-defineDeviceResource-Submit").off('click').on('click',function(){//确定按键功能
            var newResource = {
                "name" : obj.value,
                "parameter" : $("#edit-deviceCommand-defineDeviceResource-deviceResourceparameter").val(),
                "check" : "PASS"
            };
            DeviceCommandDetail[type][newResource.name] = newResource;
            obj.options.length=0;
            $("#edit-deviceCommand-defineDeviceResource-deviceResourceparameter").val("");
            $("#edit-deviceCommand-defineDeviceResource").hide();
            editProfileModel.showDeviceCommandResourceList(DeviceCommandDetail);
        });
        $("#edit-deviceCommand-defineDeviceResource-Cancel").off('click').on('click',function(){//取消按键功能
            obj.options.length=0;
            $("#edit-deviceCommand-defineDeviceResource-deviceResourceparameter").val("");
            $("#edit-deviceCommand-defineDeviceResource").hide();
            editProfileModel.showDeviceCommandResourcesList(DeviceCommandDetail);
        });
    },

    //CoreCommand部分
    DefineCoreCommands:function(){
        $("#coreCommand-info").show('fast');
        editProfileModel.CheckCoreCommands();
        editProfileModel.GetCoreCommandList();
        $("#show_coreCommand_list").off('click').on('click',function () {
            editProfileModel.GetCoreCommandList();
        });
        $("#back-CoreCommand-info").off('click').on('click',function () {
            $("#coreCommand-info").hide();
            editProfileModel.DefineDeviceCommands();
        });
        $("#submit-CoreCommand-info").off('click').on('click',function () {
            if (editProfileModel.CheckCoreCommands() == true){
                alert("尚有存在错误的CoreCommand,请注意检查!")
            }else {
                editProfileModel.SubmitCoreCommand();
                $("#coreCommand-info").hide();
                editProfileModel.CreatProfile();
            }
        });
    },
    //对现有的CoreCommand进行校验，有错误时返回true
    CheckCoreCommands:function(){
        var ErrorCountList = {};
        var ErrorExist = false;
        $.each(editProfileModel.CoreCommandDetailList,function (name,command) {
            var DeviceResourceName = name;
            command.check = 0;
            if(editProfileModel.DeviceCommandDetailList[DeviceResourceName] == null){//校验是否没有对应DeviceCommand，如果CoreCommand没有对应DeviceCommand会404
                alert("CoreCommand: " + DeviceResourceName + " 所指向的DeviceCommand: " + DeviceResourceName + " 不存在，请注意检查!");
                command.check = "DeviceCommand ERROR";
                ErrorCountList[DeviceResourceName] = "DeviceCommand ERROR";
                ErrorExist = true;
                return true;
            }
            ErrorCountList[DeviceResourceName] = 0;
            //检查get和put中请求的resource是否在对应DeviceCommand中定义
            if (command.get.hasOwnProperty("path")){
                $.each(command.get["responses"]["200"].expectedValues,function (index,resource){
                if (resource.check == "NON-EXISTENCE ERROR"){
                    delete command.get["responses"]["200"].expectedValues[resource.name];
                    return true;
                }
                resource.check = "PASS";
                if(editProfileModel.DeviceCommandDetailList[DeviceResourceName].get[resource.name] == null){
                    resource.check = "EXISTENCE ERROR";
                    ErrorCountList[DeviceResourceName] ++;
                    alert("CoreCommand: " + DeviceResourceName + " 中 GET 的DeviceResource: " + resource.name
                        +" 在CoreCommand所指向的DeviceCommand: " + DeviceResourceName + " 中不存在，请注意检查!");
                    ErrorExist = true;
                }
                });
            }
            if (JSON.stringify(editProfileModel.DeviceCommandDetailList[DeviceResourceName].get) != "{}" && command.get.hasOwnProperty("path") == false){
                command.get.path = "NOT DEFINED";
                command.get.responses = {"200":{"expectedValues":{}}};
            }
            $.each(editProfileModel.DeviceCommandDetailList[DeviceResourceName].get,function (name,resource) {
                if (command.get["responses"]["200"].expectedValues[resource.name] == null){
                    ErrorCountList[DeviceResourceName] ++;
                    command.get["responses"]["200"].expectedValues[resource.name] = {
                        "name" : resource.name,
                        "check" : "NON-EXISTENCE ERROR"
                    };
                    alert("CoreCommand: " + DeviceResourceName + " 所指向的DeviceCommand: " + DeviceResourceName + " 中的DeviceResource: "
                        + resource.name +" 在CoreComman的SET中不存在，请注意检查!");
                    ErrorExist = true;
                }
            });
            if (command.put.hasOwnProperty("path")){
                $.each(command.put.parameterNames,function (index,resource) {
                    if (resource.check == "NON-EXISTENCE ERROR"){
                        delete command.put.parameterNames[resource.name];
                        return true;
                    }
                    if(editProfileModel.DeviceCommandDetailList[DeviceResourceName].set[resource.name] == null){
                        resource.check = "EXISTENCE ERROR";
                        ErrorCountList[DeviceResourceName] ++;
                        alert("CoreCommand: " + DeviceResourceName + " 中 PUT 的DeviceResource: " + resource.name
                            +" 在CoreCommand所指向的DeviceCommand: " + DeviceResourceName + " 中不存在，请注意检查!");
                        ErrorExist = true;
                    }
                });
            }
            if (JSON.stringify(editProfileModel.DeviceCommandDetailList[DeviceResourceName].set) != "{}" && command.put.hasOwnProperty("path") == false){
                command.put.path = "NOT DEFINED";
                command.put.parameterNames = {};
            }
            $.each(editProfileModel.DeviceCommandDetailList[DeviceResourceName].set,function (name,resource) {
                if (command.put.parameterNames[resource.name] == null){
                    ErrorCountList[DeviceResourceName] ++;
                    command.put.parameterNames[resource.name] = {
                        "name" : resource.name,
                        "check" : "NON-EXISTENCE ERROR"
                    };
                    alert("CoreCommand: " + DeviceResourceName + " 所指向的DeviceCommand: " + DeviceResourceName + " 中 SET 的DeviceResource: "
                        + resource.name +" 在CoreCommand的PUT中不存在，请注意检查!");
                    ErrorExist = true;
                }
            });
            command.check = ErrorCountList[DeviceResourceName];
        });
        return ErrorExist;
    },
    //刷新CoreCommand列表
    GetCoreCommandList:function(){
        $("#Defined-coreCommand-list > tbody").empty();
        $("#Defined-coreCommand-list > tfoot").show();
        editProfileModel.GetCoreCommandList_FillCoreCommandList();
        editProfileModel.GetCoreCommandList_FillUndefinedCoreCommandList();
    },
    GetCoreCommandList_FillCoreCommandList:function(){
        var index = 0;
        $.each(editProfileModel.CoreCommandDetailList,function(name,element){
            index ++;
            var rowData = '<tr>';
            rowData += '<td>' + index + '</td>';
            var GetInfo = [], PutInfo = [];
            if (element.get.hasOwnProperty("path")){
                $.each(element.get["responses"]["200"].expectedValues,function (name,element) {
                    if (element.check == "NON-EXISTENCE ERROR") return true;
                    GetInfo.push(name);
                });
            }
            if (element.put.hasOwnProperty("path")){
                $.each(element.put.parameterNames,function (name,element) {
                    if (element.check == "NON-EXISTENCE ERROR") return true;
                    PutInfo.push(name);
                });
            }
            if (element.check == "DeviceCommand ERROR"){
                rowData += '<td>' + '<font color="red">' + element.check + '</font>' + '</td>';
                rowData += '<td>' + '<del>' + element.name + '</del>' + '</td>';
                rowData += '<td>' + '<del>' + GetInfo + '</del>' + '</td>';
                rowData += '<td>' + '<del>' + PutInfo + '</del>' + '</td>';
                rowData += "<td/>";
                rowData += "<td><input type='button' value='修复' class='Defined-coreCommand-list-Fix' content='" + JSON.stringify(element) + "'></td>";
                rowData += "<td><input type='button' value= '移除' class='Defined-coreCommand-list-remove' content='" + JSON.stringify(element) + "'></td>";
                $("#Defined-coreCommand-list > tbody").append(rowData);
                return true;
            }
            else if(element.check == 0){
                rowData += '<td>' + element.check + " ERRORS" + '</td>';
            }
            else {
                rowData += '<td>' + '<font color="red">' + element.check + " ERRORS"  + '</font>' + '</td>';
            }
            rowData += '<td>' + element.name + '</td>';
            rowData += '<td>' + GetInfo + '</td>';
            rowData += '<td>' + PutInfo + '</td>';
            rowData += "<td><input type='button' value='详细信息' onclick='editProfileModel.ShowCoreCommandDetail(this)' content='" + JSON.stringify(element) + "'></td>";
            if (element.check != 0){
                rowData += "<td><input type='button' value='修复' class='Defined-coreCommand-list-Fix' content='" + JSON.stringify(element) + "'></td>";
            }
            else rowData += "<td/>";
            rowData += "<td><input type='button' value= '移除' class='Defined-coreCommand-list-remove' content='" + JSON.stringify(element) + "'></td>";
            rowData += "</tr>";
            $("#Defined-coreCommand-list > tbody").append(rowData);
        });
        if(index != 0){
            $("#Defined-coreCommand-list > tfoot").hide();
        }
        $(".Defined-coreCommand-list-Fix").off('click').on('click',function () {
            var data = JSON.parse($(this).attr("content"));
            editProfileModel.FixCoreCommmand(editProfileModel.CoreCommandDetailList[data.name]);
        });
        $(".Defined-coreCommand-list-remove").off('click').on('click',function () {
            var data = JSON.parse($(this).attr("content"));
            delete editProfileModel.CoreCommandDetailList[data.name];
            editProfileModel.GetCoreCommandList();
        });
    },
    GetCoreCommandList_FillUndefinedCoreCommandList:function(){
        var index = 0;
        $("#Undefined-coreCommand-list > tbody").empty();
        $("#Undefined-coreCommand-list > tfoot").show();
        $.each(editProfileModel.DeviceCommandDetailList,function(name,element) {
            if(editProfileModel.CoreCommandDetailList[name] != null) return true;
            index++;
            var rowData = '<tr>';
            rowData += '<td>' + index + '</td>';
            var ErrorCount = 0, GetInfo = [], SetInfo = [];
            $.each(element.get, function (name, get) {
                GetInfo.push(get.name);
                if (get.check != "PASS") ErrorCount++;
            });
            $.each(element.set, function (name, set) {
                SetInfo.push(set.name);
                if (set.check != "PASS") ErrorCount++;
            });
            if (ErrorCount == 0) {
                rowData += '<td>' + "NO ERROR" + '</td>';
            } else {
                rowData += '<td>' + '<font color="red">' + ErrorCount + " ERRORS" + '</font>' + '</td>';
            }
            rowData += '<td>' + name + '</td>';
            rowData += '<td>' + GetInfo + '</td>';
            rowData += '<td>' + SetInfo + '</td>';
            var detail = {};
            detail[name] = element;
            rowData += "<td><input type='button' value='详细信息' onclick='editProfileModel.ShowUndefinedCoreCommandDetail(this)' content='" + JSON.stringify(element) + "'></td>";
            rowData += "<td><input type='button' value= '使用' class='Undefined-coreCommand-list-utilize' content='" + JSON.stringify(element) + "'></td>";
            rowData += "</tr>";
            $("#Undefined-coreCommand-list > tbody").append(rowData);
        });
        if(index != 0){
            $("#Undefined-coreCommand-list > tfoot").hide();
        }
        $(".Undefined-coreCommand-list-utilize").off('click').on('click',function () {
            var name = JSON.parse($(this).attr("content")).name;
            editProfileModel.CreatNewCoreCommand(name);
        });
    },
    //列出某个CoreCommand详细信息
    ShowCoreCommandDetail:function(button){
        $("#coreCommand-Detail").show('fast');
        data = JSON.parse($(button).attr("content"));
        document.getElementsByClassName("coreCommand-Detail")[0].innerHTML = data.name;
        document.getElementsByClassName("coreCommand-Detail")[1].innerHTML = data.name;
        $("#close-coreCommand-Detail").off('click').on('click',function () {
            $("#coreCommand-Detail").hide();
            editProfileModel.GetCoreCommandList();
        });
        $("#coreCommand-Detail-edit").off('click').on('click',function () {
            $("#coreCommand-Detail").hide();
            editProfileModel.CreatNewCoreCommand(data.name);
        });
        editProfileModel.ShowCoreCommandDetail_FillGetList(data);
        editProfileModel.ShowCoreCommandDetail_FillPutList(data);
    },
    ShowCoreCommandDetail_FillGetList:function(data){
        if (data.get.hasOwnProperty("path") == false){
            $("#coreCommand-Detail-get-path").html();
            $("#coreCommand-Detail-get-code > tbody").empty();
            $("#coreCommand-Detail-get-code > tfoot").show();
            $("#coreCommand-Detail-get-expectedValues > tbody").empty();
            $("#coreCommand-Detail-get-expectedValues > tfoot").show();
            return false;
        }
        document.getElementById("coreCommand-Detail-get-path").innerHTML = data.get.path;
        var index = 0;
        $("#coreCommand-Detail-get-code > tbody").empty();
        $("#coreCommand-Detail-get-code > tfoot").show();
        $.each(data.get.responses,function (code,get) {
            index ++;
            var rowData = '<tr>';
            rowData += '<td>' + index +'</td>';
            rowData += '<td>' + get.code +'</td>';
            rowData += '<td>' + get.description +'</td>';
            rowData += "</tr>";
            $("#coreCommand-Detail-get-code > tbody").append(rowData);
        });
        if(index != 0){
            $("#coreCommand-Detail-get-code > tfoot").hide();
        }else{
            $("#coreCommand-Detail-get-expectedValues > tfoot").show();
            return true;
        }
        index = 0;
        $("#coreCommand-Detail-get-expectedValues > tbody").empty();
        $("#coreCommand-Detail-get-expectedValues > tfoot").show();
        $.each(data.get.responses["200"].expectedValues,function (name,get) {
            index ++;
            var rowData = '<tr>';
            rowData += '<td>' + index +'</td>';
            rowData += '<td>' + get.name +'</td>';
            if (get.check == "PASS")    rowData += '<td>' + get.check +'</td>';
            else rowData += '<td>' + '<font color="red">' + get.check +  '<font color="red">' + '</td>';
            rowData += "</tr>";
            $("#coreCommand-Detail-get-expectedValues > tbody").append(rowData);
        });
        if(index != 0){
            $("#coreCommand-Detail-get-expectedValues > tfoot").hide();
        }
    },
    ShowCoreCommandDetail_FillPutList:function(data){
        if (data.put.hasOwnProperty("path") == false){
            $("#coreCommand-Detail-put-path").html();
            $("#coreCommand-Detail-put-code > tbody").empty();
            $("#coreCommand-Detail-put-code > tfoot").show();
            $("#coreCommand-Detail-put-parameterNames > tbody").empty();
            $("#coreCommand-Detail-put-parameterNames > tfoot").show();
            return false;
        }
        document.getElementById("coreCommand-Detail-put-path").innerHTML = data.put.path;
        var index = 0;
        $("#coreCommand-Detail-put-code > tbody").empty();
        $("#coreCommand-Detail-put-code > tfoot").show();
        $.each(data.put.responses,function (code,put) {
            index ++;
            var rowData = '<tr>';
            rowData += '<td>' + index +'</td>';
            rowData += '<td>' + put.code +'</td>';
            rowData += '<td>' + put.description +'</td>';
            rowData += "</tr>";
            $("#coreCommand-Detail-put-code > tbody").append(rowData);
        });
        if(index != 0){
            $("#coreCommand-Detail-put-code > tfoot").hide();
        }
        index = 0;
        $("#coreCommand-Detail-put-parameterNames > tbody").empty();
        $("#coreCommand-Detail-put-parameterNames > tfoot").show();
        $.each(data.put.parameterNames,function (name,put) {
            index ++;
            var rowData = '<tr>';
            rowData += '<td>' + index +'</td>';
            rowData += '<td>' + put.name +'</td>';
            if (put.check == "PASS")    rowData += '<td>' + put.check +'</td>';
            else rowData += '<td>' + '<font color="red">' + put.check +  '<font color="red">' + '</td>';
            rowData += "</tr>";
            $("#coreCommand-Detail-put-parameterNames > tbody").append(rowData);
        });
        if(index != 0){
            $("#coreCommand-Detail-put-parameterNames > tfoot").hide();
        }
    },
    //修复某条DeviceCommand中的内容
    FixCoreCommmand:function(command){
        if (command.check == 0) return true;
        else if (command.check == "DeviceCommand ERROR"){
            bootbox.confirm({
                title: "提示",
                message: "CoreCommand: " + "<font color = 'red'>" + command.name+ "</font>" + "指向不存在的DeviceCommand: " + "<font color = 'red'>" + command.name+ "</font>" +
                    " 是否将其删除?(选择否可以返回上一步重新定义相应DeviceCommand即可修复)",
                className: 'green-red-buttons',
                callback: function (result) {
                    if (result) {
                        delete editProfileModel.CoreCommandDetailList[command.name];
                        editProfileModel.GetCoreCommandList();
                    }
                }
            });
        }
        else {
            var GetError = false, PutError = false, WrongGetList = [], WrongPutList = [], CorrectGetList = [], CorrectPutList = [];
            var MESSAGE = "CoreCommand: " + "<font color = 'red'>" + command.name+ "</font>", WrongGetMsg = "", WrongPutMsg = "";
            $.each(command.get.responses["200"].expectedValues,function (name,value) {
                if (value.check != "PASS") GetError = true;
                if (value.check != "NON-EXISTENCE ERROR") WrongGetList.push(name);
                if (value.check != "EXISTENCE ERROR") CorrectGetList.push(name);
            });
            if (GetError){
                WrongGetMsg = "<br/>" + "get指令请求的DeviceResource列表为: " + "<font color = 'red'>" + WrongGetList + "</font>" +
                    " 而对应DeviceCommand在get指令中请求的DeviceResource列表为: " + "<font color = 'red'>" + CorrectGetList +
                    "</font> ,是否将CoreCommand get 指令请求的DeviceResource列表改为与对应DeviceCommand一致?(选择否可以返回上一步重新定义相应DeviceCommand)"
            }
            $.each(command.put.parameterNames,function (name,value) {
                if (value.check != "PASS") PutError = true;
                if (value.check != "NON-EXISTENCE ERROR") WrongPutList.push(name);
                if (value.check != "EXISTENCE ERROR") CorrectPutList.push(name);
            });
            if (PutError){
                WrongGetMsg = "<br/>" + "put指令请求的DeviceResource列表为: " + "<font color = 'red'>" + WrongPutList + "</font>" +
                    " 而对应DeviceCommand在set指令中请求的DeviceResource列表为: " + "<font color = 'red'>" + CorrectPutList +
                    "</font> ,是否将CoreCommand get 指令请求的DeviceResource列表改为与对应DeviceCommand一致?(选择否可以返回上一步重新定义相应DeviceCommand)"
            }
            bootbox.confirm({
                title: "提示",
                message: MESSAGE + WrongGetMsg + WrongPutMsg,
                className: 'green-red-buttons',
                callback: function (result) {
                    if (result) {
                        var CorrectedGetList = {};
                        $.each(CorrectGetList,function (index,name) {
                            CorrectedGetList[name] = {"name":name, "check":"PASS"};
                        });
                        var CorrectedPutList = {};
                        $.each(CorrectPutList,function (index,name) {
                            CorrectedPutList[name] = {"name":name, "check":"PASS"};
                        });
                        if (JSON.stringify(CorrectedGetList) != "{}"){
                            command.get.responses["200"].expectedValues = CorrectedGetList;
                            if(command.get.path = "NOT DEFINED") command.get.path = "/api/v1/device/{deviceId}/" + command.name;
                        }else{
                            command.get = {"responses":{}};
                        }
                        if (JSON.stringify(CorrectedPutList) != "{}"){
                            command.put.parameterNames = CorrectedPutList;
                            if(command.put.path = "NOT DEFINED") command.put.path = "/api/v1/device/{deviceId}/" + command.name;
                        }else{
                            command.put = {"responses":{}};
                        }
                        command.check = 0;
                        editProfileModel.GetCoreCommandList();
                    }
                }
            });
        }
    },
    //列出某条没有用来定义CoreCommand的DeviceCommand的信息
    ShowUndefinedCoreCommandDetail:function(button){
        $("#Undefined-coreCommand-detail").show('fast');
        var data = JSON.parse($(button).attr("content"));
        var CommandNameElementList = document.getElementsByClassName("Undefined-coreCommand-detail-name");
        CommandNameElementList[0].innerHTML = CommandNameElementList[1].innerHTML = data.name;
        $("#Undefined-coreCommand-detail-get > tbody").empty();
        $("#Undefined-coreCommand-detail-get > tfoot").show();
        var index = 0;
        $.each(data.get,function (name,get) {
            index ++;
            var rowData = '<tr>';
            rowData += '<td>' + index +'</td>';
            rowData += '<td>' + get.name +'</td>';
            rowData += '<td>' + get.parameter +'</td>';
            rowData += "</tr>";
            $("#Undefined-coreCommand-detail-get > tbody").append(rowData);
        });
        if (index != 0) $("#Undefined-coreCommand-detail-get > tfoot").hide();
        $("#Undefined-coreCommand-detail-set > tbody").empty();
        $("#Undefined-coreCommand-detail-set > tfoot").show();
        var index = 0;
        $.each(data.set,function (name,set) {
            index ++;
            var rowData = '<tr>';
            rowData += '<td>' + index +'</td>';
            rowData += '<td>' + set.name +'</td>';
            rowData += '<td>' + set.parameter +'</td>';
            rowData += "</tr>";
            $("#Undefined-coreCommand-detail-set > tbody").append(rowData);
        })
        if (index != 0) $("#Undefined-coreCommand-detail-set > tfoot").hide();
        $("#Undefined-coreCommand-detail-close").off('click').on('click',function () {
            $("#Undefined-coreCommand-detail").hide();
            editProfileModel.GetCoreCommandList();
        });
        $("#Undefined-coreCommand-detail-utilize").off('click').on('click',function () {
            $("#Undefined-coreCommand-detail").hide();
            editProfileModel.CreatNewCoreCommand(data.name);
        });
    },
    //创建新的CoreCommand
    CreatNewCoreCommand:function(name){
        $("#Edit-coreCommand-get-code").find("input").val("");
        $("#Edit-coreCommand-get-code").find("input").attr("disabled",false);
        $("#Edit-coreCommand-get-code").find("input").css("background", "white");
        $("#Edit-coreCommand-put-code").find("input").val("");
        $("#Edit-coreCommand-put-code").find("input").attr("disabled",false);
        $("#Edit-coreCommand-put-code").find("input").css("background", "white");
        $("#Edit-coreCommand-get-path").html("");
        $("#Edit-coreCommand-put-path").html("");
        $("#Edit-coreCommand-get-expectedValues").html("");
        $("#Edit-coreCommand-put-parameterNames").html("");
        $("#Edit-coreCommand").show('fast');
        document.getElementById("Edit-coreCommand-name").innerHTML = name;
        if (editProfileModel.CoreCommandDetailList[name] != null) editProfileModel.FillCreatNewCoreCommandList(editProfileModel.CoreCommandDetailList[name]);
        else {
            if (JSON.stringify(editProfileModel.DeviceCommandDetailList[name].get) != "{}"){
                GetPath = "/api/v1/device/{deviceId}/" + name;
                document.getElementById("Edit-coreCommand-get-path").innerHTML = GetPath;
                $.each(editProfileModel.DeviceCommandDetailList[name].get,function (name,resource) {
                    $("#Edit-coreCommand-get-expectedValues").append(resource.name);
                    $("#Edit-coreCommand-get-expectedValues").append(" ");
                });
            }else{
                $("#Edit-coreCommand-get-code > tbody").find("input").val("CoreCommand: " + name + "不支持定义get资源");
                $("#Edit-coreCommand-get-code > tbody").find("input").attr("disabled", "disabled");
                $("#Edit-coreCommand-get-code > tbody").find("input").css("background", "#CCCCCC");
            }
            if (JSON.stringify(editProfileModel.DeviceCommandDetailList[name].set) != "{}"){
                PutPath = "/api/v1/device/{deviceId}/" + name;
                document.getElementById("Edit-coreCommand-put-path").innerHTML = PutPath;
                $.each(editProfileModel.DeviceCommandDetailList[name].set,function (name,resource) {
                    $("#Edit-coreCommand-put-parameterNames").append(resource.name);
                    $("#Edit-coreCommand-put-parameterNames").append(" ");
                });
            }else{
                $("#Edit-coreCommand-put-code > tbody").find("input").val("CoreCommand: " + name + "不支持定义get资源");
                $("#Edit-coreCommand-put-code > tbody").find("input").attr("disabled", "disabled");
                $("#Edit-coreCommand-put-code > tbody").find("input").css("background", "#CCCCCC");
            }
        }
        $("#close-Edit-coreCommand").off('click').on('click',function () {
            $("#Edit-coreCommand").hide();
        });
        $("#submit-Edit-coreCommand").off('click').on('click',function () {
            $("#Edit-coreCommand").hide();
            var NewCoreCommand = {"name":name, "get":{"responses":{}}, "put":{"responses":{}}};
            var CodeList = ["200", "500", "503"];
            if ($("#Edit-coreCommand-get-path").html() != ""){
                NewCoreCommand.get = {"path":$("#Edit-coreCommand-get-path").html(), "responses":{"200":{"code":"200","expectedValues":{}}}};
                $.each(CodeList,function (index,code) {
                    var ID = "#Edit-coreCommand-get-" + code;
                    if ($(ID).val() != ""){
                        NewCoreCommand["get"]["responses"][code] = {
                            "code" : code,
                            "description" : $(ID).val()
                        }
                    }
                });
                var GetResourceList = $("#Edit-coreCommand-get-expectedValues").html().split(" ").slice(0,-1);
                var ResourceList = {};
                $.each(GetResourceList,function (index,resource) {
                    ResourceList[resource] = {"name":resource,"check":"PASS"};
                });
                NewCoreCommand["get"]["responses"]["200"]["expectedValues"] = ResourceList;
            }
            if ($("#Edit-coreCommand-put-path").html() != "") {
                NewCoreCommand.put = {"path":$("#Edit-coreCommand-put-path").html(), "responses":{"200":{"code":"200"}}, "parameterNames":{}};
                $.each(CodeList,function (index,code) {
                    var ID = "#Edit-coreCommand-put-" + code;
                    if ($(ID).val() != ""){
                        NewCoreCommand["put"]["responses"][code] = {
                            "code" : code,
                            "description" : $(ID).val()
                        }
                    }
                });
                var PutResourceList = $("#Edit-coreCommand-put-parameterNames").html().split(" ").slice(0,-1);
                var ResourceList = {};
                $.each(PutResourceList,function (index,resource) {
                    ResourceList[resource] = {"name":resource,"check":"PASS"};
                });
                NewCoreCommand["put"]["parameterNames"] = ResourceList;
            }
            NewCoreCommand["check"] = 0;
            editProfileModel.CoreCommandDetailList[name] = NewCoreCommand;
            editProfileModel.GetCoreCommandList();
        });
    },
    FillCreatNewCoreCommandList:function(data){
        if(data.get.path != undefined){
            document.getElementById("Edit-coreCommand-get-path").innerHTML = data.get.path;
            var GetIdToFill = "#Edit-coreCommand-get-";
            $.each(data.get.responses, function (code,response) {
                var ID = GetIdToFill + code;
                $(ID).val(response.description);
            });
            $.each(data.get.responses["200"].expectedValues,function (name,resource) {
                $("#Edit-coreCommand-get-expectedValues").append(resource.name);
                $("#Edit-coreCommand-get-expectedValues").append(" ");
            });
        }else{
            document.getElementById("Edit-coreCommand-get-path").innerHTML = "";
            $("#Edit-coreCommand-get-code > tbody").find("input").val("CoreCommand: " + data.name + "不支持定义get资源");
            $("#Edit-coreCommand-get-code > tbody").find("input").attr("disabled", "disabled");
            $("#Edit-coreCommand-get-code > tbody").find("input").css("background", "#CCCCCC");
        }
        if (data.put.path != undefined){
            document.getElementById("Edit-coreCommand-put-path").innerHTML = data.put.path;
            var PutIdToFill = "#Edit-coreCommand-put-";
            $.each(data.put.responses, function (code,response) {
                var ID = PutIdToFill + code;
                $(ID).val(response.description);
            });
            $.each(data.put.parameterNames,function (name,resource) {
                $("#Edit-coreCommand-put-parameterNames").append(resource.name);
                $("#Edit-coreCommand-put-parameterNames").append(" ");
            });
        }else {
            document.getElementById("Edit-coreCommand-put-path").innerHTML = "";
            $("#Edit-coreCommand-put-code > tbody").find("input").val("CoreCommand: " + data.name + "不支持定义get资源");
            $("#Edit-coreCommand-put-code > tbody").find("input").attr("disabled", "disabled");
            $("#Edit-coreCommand-put-code > tbody").find("input").css("background", "#CCCCCC");
        }
    },
    //创建新的CoreCommand字段
    SubmitCoreCommand:function(){
        var CommandList = [];
        $.each(editProfileModel.CoreCommandDetailList,function (name,command) {
            var get = {}, put = {}, cmd = {"name":name};
            if (command.get.hasOwnProperty("path")){
                get = {"path" : command.get.path, "responses": []};
                $.each(command.get.responses,function (name,getresponse) {
                    var response = {"code" : getresponse.code};
                    if (getresponse.hasOwnProperty("description")) response.description = getresponse.description;
                    if (getresponse.code == "200"){
                        response.expectedValues = [];
                        $.each(getresponse.expectedValues,function (name) {
                            response.expectedValues.push(name);
                        })
                    }
                    get.responses.push(response);
                })
                cmd.get = get;
            }
            if (command.put.hasOwnProperty("path")){
                put = {"path" : command.put.path, "responses":[], "parameterNames":[]};
                $.each(command.put.responses, function (name, putresponse) {
                    var response = {"code" : putresponse.code};
                    if (putresponse.hasOwnProperty("description")) response.description = putresponse.description;
                    put.responses.push(response);
                });
                $.each(command.put.parameterNames,function (name) {
                    put.parameterNames.push(name);
                })
                cmd.put = put;
            }
            CommandList.push(cmd);
        });
        editProfileModel.ProfileToEdit.coreCommands = CommandList;
    },

    CreatProfile:function(){
        $("#Submit-Profile").show('fast');
        deleteEmptyProperty(editProfileModel.ProfileToEdit)
        $("#Submit-Profile-viewJson").off('click').on('click',function () {
            editProfileModel.CreatProfile_ViewJson();
        });
        $("#Submit-Profile-viewYaml").off('click').on('click',function () {
            editProfileModel.CreatProfile_ViewYaml();
        });
        $("#Submit-Profile-Submit").off('click').on('click',function () {
            editProfileModel.UpLoadProfile();
        });
        $("#back-Submit-Profile").off('click').on('click',function () {
            $("#Submit-Profile").hide();
            editProfileModel.DefineCoreCommands();
        });
        $("#finish-Submit-Profile").off('click').on('click',function () {
            manageProfileModule.getMatchedDeviceResourceList();
            $("#Submit-Profile").hide();
        });
    },
    CreatProfile_ViewJson:function () {
        $("#Submit-Profile-ViewDetail").show('fast');
        $("#Submit-Profile-detail").html("");
        $("#Submit-Profile-detail").html(JSON.stringify(editProfileModel.ProfileToEdit,null,2));
        $("#Submit-Profile-detail-download").off('click').on('click',function() {
            var blob = new Blob([$("#Submit-Profile-detail").html()],{type:'application/json,charset=utf-8;'});
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = JSON.stringify(editProfileModel.ProfileToEdit.name) + ".json";
            link.click();
            URL.revokeObjectURL(link.href);
        });
        $("#Submit-Profile-detail-back").off('click').on('click',function() {
            $("#Submit-Profile-ViewDetail").hide();
            $("#Submit-Profile-detail").html("");
        });
    },
    CreatProfile_ViewYaml:function () {
        $("#Submit-Profile-ViewDetail").show('fast');
        $("#Submit-Profile-detail").html("");
        $("#Submit-Profile-detail").html(jsyaml.dump(editProfileModel.ProfileToEdit));
        $("#Submit-Profile-detail-download").off('click').on('click',function() {
            var blob = new Blob([$("#Submit-Profile-detail").html()],{type:'yaml,charset=utf-8;'});
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = JSON.stringify(editProfileModel.ProfileToEdit.name) + ".yaml";
            link.click();
            URL.revokeObjectURL(link.href);
        });
        $("#Submit-Profile-detail-back").off('click').on('click',function() {
            $("#Submit-Profile-ViewDetail").hide();
            $("#Submit-Profile-detail").html("");
        });
    },
    UpLoadProfile:function () {
        $.ajax({
            url: '/core-metadata/api/v1/deviceprofile',
            type: "POST",
            data:JSON.stringify(editProfileModel.ProfileToEdit),
            success: function(){
                manageProfileModule.getMatchedDeviceResourceList();
                bootbox.alert({
                    message: "commit success!",
                    className: 'red-green-buttons'
                });
            },
            statusCode: {
                400: function(){
                    bootbox.alert({
                        title: "Error",
                        message: "400错误!",
                        className: 'red-green-buttons'
                    });
                },
                409: function(){
                    bootbox.alert({
                        title: "Error",
                        message: "409错误! 仔细检查，是否重复定义了一个已经存在的配置文件?",
                        className: 'red-green-buttons'
                    });
                },
                500: function(){
                    bootbox.alert({
                        title: "Error",
                        message: "500错误!",
                        className: 'red-green-buttons'
                    });
                }
            }
        });
    }
};


function deleteEmptyProperty(object){
    for (var i in object) {
        var value = object[i];
        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                if (value.length == 0) {
                    delete object[i];
                    continue;
                }
            }
            this.deleteEmptyProperty(value);
            if (this.isEmpty(value)) {
                delete object[i];
            }
        } else {
            if (value === '' || value === null || value === undefined) {
                delete object[i];
            } else {
                var reg=/^[0-9]+.?[0-9]*$/;
                if(reg.test(value)) value = '"' + value + '"';
            }
        }
    }
}
function isEmpty(object) {
    for (var name in object) {
        return false;
    }
    return true;
}