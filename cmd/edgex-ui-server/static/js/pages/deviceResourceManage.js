$(document).ready(function(){
    orgEdgexFoundry.supportDeviceResource.renderDeviceList();
});
//init application object

orgEdgexFoundry.supportDeviceResource = (function(){
    "use strict";
    function supportDeviceResource() {
    }
    supportDeviceResource.prototype = {
        constructor: supportDeviceResource,

        getAttributeVars: null,

        loadDeviceList:null,
        renderDeviceList:null,
        showDeviceDetail:null,
        showDeviceInExportReceiver:null,
        FillDeviceDetailPage:null,
        FillCommandDetailPage:null,
        deleteDevice:null,
        editDeviceBtn: null,
        addDeviceBtn: null,
        FillEditDevicePage: null,
        registDevice:null,
        editDevice: null,
        showCommandDetailBtn:null,
        RenderCommandList: null,
        editCommandBtn: null,
        readEditCommandPage: null,

    }
    var deviceresource = new supportDeviceResource();

    //=====================Public Functions=====================================
    //按规定数目渲染表格
    supportDeviceResource.prototype.makeAttributeTable = function(TableName, ElementList, ColumnNumber){
        var table = $(TableName);
        table.empty();
        var element_num = 0;
        $.each(ElementList,function(index,Element) {
            if(element_num%ColumnNumber == 0) {
                table.append('<tr>')
            }
            $.each(Element,function (index,element) {
                element = '<td>' + element + '</td>';
                table.append(element);
                element_num ++;
            });
            if(element_num%ColumnNumber == ColumnNumber-1) {
                table.append('</tr>')
            }
        })
        table.append('</tr>')
    }
    //读取动态生成的Attribute类型的表
    supportDeviceResource.prototype.getAttributeVars = function(table){
        var list = []
        $(table).each(function (tindex,titem){
            var attribute = {};
            $(titem).find("input").each(function(newattributeindex,newattribute){
                if (newattribute.getAttribute("detail") == "key"){
                    attribute.key = newattribute.value
                }else if (newattribute.getAttribute("detail") == "value"){
                    attribute.value= newattribute.value;
                    list.push(JSON.parse(JSON.stringify(attribute)))
                }
            });
        });
        return list
    }
    //在详情页面布置属性表
    supportDeviceResource.prototype.showAttributeDetailList = function(table, AttributeList){
        AttributeList = JSON.parse(AttributeList)
        var attributeelement = new Array();
        $.each(AttributeList, function (index,attribute) {
            var AttributeInputElementList = new Array();
            var attr = 'key: ' + attribute.key + ' value: ' + attribute.value;
            var AttributeInputElement = '<input type="text" class="form-control" disabled style="width: 80%" value="'+attr+'"/>';
            AttributeInputElementList.push(AttributeInputElement)
            attributeelement.push(AttributeInputElementList)
        });
        deviceresource.makeAttributeTable(table,attributeelement,8);
    }


    //===================Device Section Begin================================
    //通过ajax获取Edgex里面的设备列表以及Edgex-Export-Receiver里的设备列表
    supportDeviceResource.prototype.loadDeviceList = function() {
        var devicelist = [], Exporterdevicelist = [];
        //获取Edgex里面的设备信息
        $.ajax({
            url: '/core-metadata/api/v1/device',
            type:'GET',
            contentType:'application/json',
            async : false,
            success:function(data){
                devicelist = data
            },
            error:function(){
                alert("ERROR! 获取Edgex设备信息失败")
            }
        });
        $.ajax({
            url: '/export-receiver/api/v1/device/check',
            type:'POST',
            data:JSON.stringify(devicelist),
            contentType:'application/json',
            async : false,
            success:function(data){
                Exporterdevicelist = data
            },
            error:function(){
                alert("ERROR! 获取Export-Receiver设备信息失败")
            }
        });
        var devices = [devicelist, Exporterdevicelist];
        return devices
    }
    //刷新前端显示的列表
    supportDeviceResource.prototype.renderDeviceList = function() {
        $("#edgex-support-device-devicelist").show('fast');
        var devicelist = deviceresource.loadDeviceList()[0], Exporterdevicelist = deviceresource.loadDeviceList()[1];
        var deviceExistInExporter = {};
        $.each(Exporterdevicelist, function (index, element) {
            deviceExistInExporter[element.edgexid] = true
        })
        $("#edgex-support-device-devicelist tbody").empty();
        var registedcount=0, not_registedcount=0;
        $.each(devicelist,function(i,v){
            var exist = deviceExistInExporter[v.id] != null;
            var rowData = "<tr>";
            if (exist==true) {
                registedcount+=1;
                rowData += "<td>" + (registedcount) +"</td>";
                rowData += "<td>" +  v.id + "</td>";
                rowData += "<td>" +  v.name + "</td>";
                rowData += "<td>" +  "<font color = 'green'>已注册</font>" + "</td>";
                var table = $("#edgex-support-device-devicelist table[name='registed'] tbody");
            } else {
                not_registedcount+=1;
                rowData += "<td>" + (not_registedcount) +"</td>";
                rowData += "<td>" +  v.id + "</td>";
                rowData += "<td>" +  v.name + "</td>";
                rowData += "<td>" +  "<font color = 'red'>未注册</font>" + "</td>";
                var table = $("#edgex-support-device-devicelist table[name='not_registed'] tbody");
            }
            rowData += '<td class="scheduler-detail-icon edgex-support-device-devicelist-detail"><input type="hidden" value=\''+JSON.stringify(v)+'\' exist=\''+exist+'\'><div class="edgexIconBtn"><i class="fa fa-eye fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += '<td class="scheduler-edit-icon edgex-support-device-devicelist-edit"><input type="hidden" value=\''+JSON.stringify(v)+'\' exist=\''+exist+'\'><div class="edgexIconBtn"><i class="fa fa-edit fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += '<td class="scheduler-edit-icon edgex-support-device-devicelist-delete"><input type="hidden" value=\''+JSON.stringify(v)+'\' exist=\''+exist+'\'><div class="edgexIconBtn"><i class="fa fa-trash-o fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += "</tr>";
            table.append(rowData);
        });
        if (devicelist.length == 0){
            $("#edgex-support-device-devicelist tfoot").show('fast');
        }else {
            $("#edgex-support-device-devicelist tfoot").hide()
        }
        $(".edgex-support-device-devicelist-detail").off('click').on('click',function(){
            deviceresource.showDeviceDetail($(this).children("input[type='hidden']").val(), $(this.children).attr("exist"));
        });
        $(".edgex-support-device-devicelist-edit").off('click').on('click',function(){
            if ($(this.children).attr("exist") == "false"){
                deviceresource.addDeviceBtn($(this).children("input[type='hidden']").val())
            }else {
                deviceresource.editDeviceBtn($(this).children("input[type='hidden']").val())
            }
        });
        $(".edgex-support-device-devicelist-delete").off('click').on('click',function(){
            var deviceInfo = $(this).children("input[type='hidden']").val();
            if ($(this.children).attr("exist") == "true") {
                bootbox.confirm({
                    title: "提示",
                    message: "是否要删除设备: " + "<font color = 'red'>" + JSON.parse(deviceInfo).name+ "</font>" + "的注册信息?<br/><font color = 'red'>删除后不可恢复，确定删除?</>",
                    className: 'green-red-buttons',
                    callback: function (result) {
                        if (result) {
                            deviceresource.deleteDevice(deviceInfo)
                        }
                    }
                });
            }
        });
    }
    //显示设备详细信息
    supportDeviceResource.prototype.showDeviceDetail = function (deviceInfo, exist){
        var device = JSON.parse(deviceInfo);
        $("#edgex-support-device-detail").show('fast');
        $("#edgex-support-device-detail-name").html(device.name);
        if (exist == "true"){
            $("#edgex-support-device-detail-not_registed").hide();
            $("#edgex-support-device-detail-registed").show('fast');
            deviceresource.FillDeviceDetailPage(deviceInfo)
        }else {
            $("#edgex-support-device-devicelist").hide();
            $("#edgex-support-device-detail-registed").hide();
            $("#edgex-support-device-detail-not_registed").show('fast');
            $("#edgex-support-device-detail-not_registed-regist").off('click').on('click',function(){
                deviceresource.addDeviceBtn(deviceInfo);
            });
            $("#edgex-support-device-detail-not_registed-exit").off('click').on('click', function () {
                $("#edgex-support-device-detail input").val("");
                $("#edgex-support-device-detail-command table").empty();
                $("#edgex-support-device-detail").hide();
                $("#edgex-support-device-devicelist").show('fast');
                deviceresource.renderDeviceList();
            })
        }
        $("#edgex-support-device-detail-registed-page_control i[name='close']").off('click').on('click', function () {
            $("#edgex-support-device-detail input").val("");
            $("#edgex-support-device-detail-command table").empty();
            $("#edgex-support-device-detail").hide();
            deviceresource.renderDeviceList();
        })
        $("#edgex-support-device-detail-registed-page_control i[name='refresh']").off('click').on('click', function () {
            deviceresource.FillDeviceDetailPage(deviceInfo)
        })
    }
    //获取Export-Receiver内的设备信息
    supportDeviceResource.prototype.showDeviceInExportReceiver = function(id){
        var device = null
        $.ajax({
            url: '/export-receiver/api/v1/device/edgexid/' + id,
            type:'GET',
            contentType:'application/json',
            async : false,
            success:function(data){
                device = data
            },
            error:function(){
                alert("ERROR! 获取Export-Receiver设备信息失败")
            }
        });
        return device
    }
    //填充设备详情页面
    supportDeviceResource.prototype.FillDeviceDetailPage = function (deviceInfo) {
        $("#edgex-support-device-devicelist").hide();
        $("#edgex-support-device-detail-command table").empty();
        var deviceID = JSON.parse(deviceInfo).id;
        var device = deviceresource.showDeviceInExportReceiver(deviceID);
        $("#edgex-support-device-detail-basicInfo-edgexid").val(device.edgexid);
        $("#edgex-support-device-detail-basicInfo-name").val(device.name);
        $("#edgex-support-device-detail-resourceInfo-cpu").val(device.cpu);
        $("#edgex-support-device-detail-resourceInfo-memory").val(device.memory);
        $("#edgex-support-device-detail-resourceInfo-disk").val(device.disk);
        $("#edgex-support-device-detail-resourceInfo-net_rate").val(device.net_rate);
        $("#edgex-support-device-detail-resourceInfo-availablecpu").val(device.cpu-device.cpu_used);
        $("#edgex-support-device-detail-resourceInfo-availablememory").val(device.memory-device.memory_used);
        $("#edgex-support-device-detail-resourceInfo-availabledisk").val(device.disk-device.disk_used);
        $("#edgex-support-device-detail-resourceInfo-availablenet_rate").val(device.net_rate-device.net_rate_used);
        $.each(device.getcommands, function (index, command) {
            var rowData = "<tr>";
            rowData += '<td style="width: 16%; text-align: right">' + '<b>' + '名称:' + '</b>' + '</td>';
            rowData += '<td style="width: 16%; text-align: left">' + '<input type="text" class="form-control" disabled value=' + command.name + ' >' + '</td>';
            rowData += '<td style="width: 16%; text-align: right">' + '<b>' + 'get/set:' + '</b>' + '</td>';
            rowData += '<td style="width: 16%; text-align: left">' + '<input type="text" class="form-control" disabled value=' + command.type + ' >' + '</td>';
            rowData += '<td style="width: 16%; text-align: right" class="scheduler-detail-icon edgex-support-device-detail-command_detailbtn"><input type="hidden" value=\'' + JSON.stringify(command) + '\'><div class="edgexIconBtn"><i class="fa fa-eye fa-lg" aria-hidden="true"></i> </div></td>';
            $("#edgex-support-device-detail-command table").append(rowData);
        })
        $.each(device.putcommands, function (index, command) {
            var rowData = "<tr>";
            rowData += '<td style="width: 16%; text-align: right">' + '<b>' + '名称:' + '</b>' + '</td>';
            rowData += '<td style="width: 16%; text-align: left">' + '<input type="text" class="form-control" disabled value=' + command.name + ' >' + '</td>';
            rowData += '<td style="width: 16%; text-align: right">' + '<b>' + 'get/set:' + '</b>' + '</td>';
            rowData += '<td style="width: 16%; text-align: left">' + '<input type="text" class="form-control" disabled value=' + command.type + ' >' + '</td>';
            rowData += '<td style="width: 16%; text-align: right" class="scheduler-detail-icon edgex-support-device-detail-command_detailbtn"><input type="hidden" value=\'' + JSON.stringify(command) + '\'><div class="edgexIconBtn"><i class="fa fa-eye fa-lg" aria-hidden="true"></i> </div></td>';
            $("#edgex-support-device-detail-command table").append(rowData);
        })
        $(".edgex-support-device-detail-command_detailbtn").off('click').on('click', function () {
            $("#edgex-support-device-detail-command_detail").show('fast');
            var commandInfo = $(this).children("input[type='hidden']").val();
            deviceresource.FillCommandDetailPage(commandInfo);
        })
    }
    //填充设备详情的命令详情页面
    supportDeviceResource.prototype.FillCommandDetailPage = function (commandInfo) {
        var command = JSON.parse(commandInfo);
        $("#edgex-support-device-detail-registed").hide();
        $("#edgex-support-device-detail-command_detail input").val("");
        $("#edgex-support-device-detail-command_detail").show('fast');
        $("#edgex-support-device-detail-command_detail-name").html(command.name);
        $("#edgex-support-device-detail-command_detail-basicinfo-name").val(command.name);
        $("#edgex-support-device-detail-command_detail-basicinfo-deviceid").val(command.deviceid);
        $("#edgex-support-device-detail-command_detail-basicinfo-type").val(command.type);
        $("#edgex-support-device-detail-command_detail-basicinfo-url").val(command.url);
        $("#edgex-support-device-detail-command_detail-basicinfo-desc").val(command.desc);
        $("#edgex-support-device-detail-command_detail-basicinfo-time_limit").val(command.time_limit);
        $("#edgex-support-device-detail-command_detail-basicinfo-size").val(command.size);
        $("#edgex-support-device-detail-command_detail-basicinfo-energy_limit").val(command.energy_limit);
        $("#edgex-support-device-detail-command_detail-basicinfo-cpu").val(command.cpu);
        $("#edgex-support-device-detail-command_detail-basicinfo-memory").val(command.memory);
        $("#edgex-support-device-detail-command_detail-basicinfo-disk").val(command.disk);
        $("#edgex-support-device-detail-command_detail-basicinfo-kind").val(command.kind);
        $("#edgex-support-device-detail-command_detail-basicinfo-exec_limit").val(command.exec_limit);
        $("#edgex-support-device-detail-command_detail-basicinfo-host_name").val(command.host_name);
        $("#edgex-support-device-detail-command_detail-basicinfo-host_port").val(command.host_port);
        $("#edgex-support-device-detail-command_detail-task_labels table").empty();
        $("#edgex-support-device-detail-command_detail-tolerations table").empty();
        $("#edgex-support-device-detail-command_detail-image_need table").empty();
        deviceresource.showAttributeDetailList("#edgex-support-device-detail-command_detail-task_labels table", JSON.stringify(command.task_labels));
        deviceresource.showAttributeDetailList("#edgex-support-device-detail-command_detail-tolerations table", JSON.stringify(command.tolerations));
        var image_need_element = new Array();
        $.each(command.image_need, function (index,image_need) {
            var Image_need_InputElementList = new Array();
            var Image_need_InputElement = '<input type="text" class="form-control" disabled style="width: 80%" value="'+image_need+'"/>';
            Image_need_InputElementList.push(Image_need_InputElement)
            image_need_element.push(Image_need_InputElementList)
        });
        deviceresource.makeAttributeTable("#edgex-support-device-detail-command_detail-image_need table", image_need_element,8);
        $("#edgex-support-device-detail-command_detail-exit").off('click').on('click', function () {
            $("#edgex-support-device-detail-registed").show('fast');
            $("#edgex-support-device-detail-command_detail").hide();
        })
    }
    //删除设备，同时删除到Edgex-Export和Edgex-Export-Receiver
    supportDeviceResource.prototype.deleteDevice = function(deviceInfo){
        var device = JSON.parse(deviceInfo);
        $.ajax({
            url: '/export-receiver/api/v1/device/edgexid/' + device.id,
            type:'Delete',
            contentType:'application/json',
            async : false,
            dataType : 'text',
            error:function(){
                alert("ERROR! 删除设备到Export-Receiver失败")
                return false
            }
        });
    }
    //点击编辑设备按键的功能
    supportDeviceResource.prototype.editDeviceBtn = function(deviceInfo){
        var device = JSON.parse(deviceInfo);
        $("#edgex-support-device-devicelist").hide();
        $("#edgex-support-device-edit-deviceList-submitDevice").attr("newdevice", "false");
        deviceresource.FillEditDevicePage(JSON.stringify(deviceresource.showDeviceInExportReceiver(device.id)));
    }
    //点击新建设备按键的功能
    supportDeviceResource.prototype.addDeviceBtn = function(deviceInfo) {
        $("#edgex-support-device-detail").hide();
        $("#edgex-support-device-edit-deviceList-submitDevice").attr("newdevice", "true");
        var commandInfo = showDeviceCommandInEdgex(JSON.parse(deviceInfo).id);
        var device = {
            "edgexid" : JSON.parse(deviceInfo).id,
            "name" : JSON.parse(deviceInfo).name,
            "getcommands" : {},
            "putcommands" : {}
        };
        $.each(commandInfo.commands, function (index, command) {
            if (command.get != null){
                device.getcommands[command.name] = {
                    "deviceid" : JSON.parse(deviceInfo).id,
                    "url" : command.get.url,
                    "name" : command.name,
                    "type" : "get",
                    "task_labels": [],
                    "tolerations": [],
                    "image_need": []
                }
            }
            if (command.put != null){
                device.putcommands[command.name] = {
                    "deviceid" : JSON.parse(deviceInfo).id,
                    "url" : command.put.url,
                    "name" : command.name,
                    "type" : "put",
                    "task_labels": [],
                    "tolerations": [],
                    "image_need": []
                }
            }
        });
        deviceresource.FillEditDevicePage(JSON.stringify(device))
    }
    function showDeviceCommandInEdgex(id){
        var device = null
        $.ajax({
            url: '/core-command/api/v1/device/' + id,
            type:'GET',
            contentType:'application/json',
            async : false,
            success:function(data){
                device = data
            },
            error:function(){
                alert("ERROR! 获取Edgex 中注册的设备命令列表失败")
            }
        });
        return device
    }
    //填充编辑设备定义信息页面
    supportDeviceResource.prototype.FillEditDevicePage = function(deviceInfo) {
        $("#edgex-support-device-edit").show('fast');
        $("#edgex-support-device-edit input").val("");
        $("#edgex-support-device-edit-deviceList-command table").empty();
        var device = JSON.parse(deviceInfo);
        $("#edgex-support-device-edit").show('fast');
        $("#edgex-support-device-edit-deviceList").show('fast');
        $("#edgex-support-device-edit-name").html(device.name);
        $("#edgex-support-device-edit-deviceList-basicInfo input[name= 'name']").val(device.name);
        $("#edgex-support-device-edit-deviceList-basicInfo input[name= 'cpu']").val(device.cpu);
        $("#edgex-support-device-edit-deviceList-basicInfo input[name= 'memory']").val(device.memory);
        $("#edgex-support-device-edit-deviceList-basicInfo input[name= 'disk']").val(device.disk);
        $("#edgex-support-device-edit-deviceList-basicInfo input[name= 'net_rate']").val(device.net_rate);
        $("#edgex-support-device-edit-deviceList-command table").empty();
        $.each(device.getcommands, function (index, command) {
            var rowData = "<tr>";
            rowData += '<td style="width: 16%; text-align: right">' + '<b>' + '名称:' + '</b>' + '</td>';
            rowData += '<td style="width: 16%; text-align: left">' + '<input type="text" class="form-control" disabled value=' + command.name + ' >' + '</td>';
            rowData += '<td style="width: 16%; text-align: right">' + '<b>' + 'get/set:' + '</b>' + '</td>';
            rowData += '<td style="width: 16%; text-align: left">' + '<input type="text" class="form-control" disabled value=' + command.type + ' >' + '</td>';
            rowData += '<td style="width: 16%; text-align: right" class="scheduler-detail-icon edgex-support-device-edit-deviceList-command_detail"><input type="hidden" value=\'' + JSON.stringify(command) + '\'><div class="edgexIconBtn"><i class="fa fa-eye fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += '<td style="width: 16%; text-align: right" class="scheduler-detail-icon edgex-support-device-edit-deviceList-command-edit"><input type="hidden" value=\'' + JSON.stringify(command) + '\'><div class="edgexIconBtn"><i class="fa fa-edit fa-lg" aria-hidden="true"></i> </div></td>';
            $("#edgex-support-device-edit-deviceList-command table").append(rowData);
        });
        $.each(device.putcommands, function (index, command) {
            var rowData = "<tr>";
            rowData += '<td style="width: 16%; text-align: right">' + '<b>' + '名称:' + '</b>' + '</td>';
            rowData += '<td style="width: 16%; text-align: left">' + '<input type="text" class="form-control" disabled value=' + command.name + ' >' + '</td>';
            rowData += '<td style="width: 16%; text-align: right">' + '<b>' + 'get/set:' + '</b>' + '</td>';
            rowData += '<td style="width: 16%; text-align: left">' + '<input type="text" class="form-control" disabled value=' + command.type + ' >' + '</td>';
            rowData += '<td style="width: 16%; text-align: right" class="scheduler-detail-icon edgex-support-device-edit-deviceList-command_detail"><input type="hidden" value=\'' + JSON.stringify(command) + '\'><div class="edgexIconBtn"><i class="fa fa-eye fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += '<td style="width: 16%; text-align: right" class="scheduler-detail-icon edgex-support-device-edit-deviceList-command-edit"><input type="hidden" value=\'' + JSON.stringify(command) + '\'><div class="edgexIconBtn"><i class="fa fa-edit fa-lg" aria-hidden="true"></i> </div></td>';
            $("#edgex-support-device-edit-deviceList-command table").append(rowData);
        });
        $("#edgex-support-device-edit-deviceList-submitDevice").off('click').on('click', function () {
            var newDevice = $("#edgex-support-device-edit-deviceList-submitDevice").attr("newdevice");
            device.cpu = Number($("#edgex-support-device-edit-deviceList-basicInfo input[name= 'cpu']").val());
            device.memory = Number($("#edgex-support-device-edit-deviceList-basicInfo input[name= 'memory']").val());
            device.disk = Number($("#edgex-support-device-edit-deviceList-basicInfo input[name= 'disk']").val());
            device.net_rate = Number($("#edgex-support-device-edit-deviceList-basicInfo input[name= 'net_rate']").val());
            if (newDevice == "true") {
                deviceresource.registDevice(JSON.stringify(device));
            } else {
                deviceresource.editDevice(JSON.stringify(device));
            }
            $("#edgex-support-device-edit").hide();
            deviceresource.renderDeviceList();
        });
        $("#edgex-support-device-edit-deviceList-cancelSubmitDevice").off('click').on('click', function () {
            $("#edgex-support-device-edit").hide();
            deviceresource.renderDeviceList();
        });
        $(".edgex-support-device-edit-deviceList-command_detail").off('click').on('click', function () {
            var commandInfo = $(this).children("input[type='hidden']").val();
            deviceresource.showCommandDetailBtn(commandInfo)
        });
        $(".edgex-support-device-edit-deviceList-command-edit").off('click').on('click', function () {
            device.cpu = Number($("#edgex-support-device-edit-deviceList-basicInfo input[name= 'cpu']").val());
            device.memory = Number($("#edgex-support-device-edit-deviceList-basicInfo input[name= 'memory']").val());
            device.disk = Number($("#edgex-support-device-edit-deviceList-basicInfo input[name= 'disk']").val());
            device.net_rate = Number($("#edgex-support-device-edit-deviceList-basicInfo input[name= 'net_rate']").val());
            var commandInfo = $(this).children("input[type='hidden']").val();
            deviceresource.editCommandBtn(commandInfo, device)
        });
    }
    //注册设备，同时注册到Edgex-Export和Edgex-Export-Receiver
    supportDeviceResource.prototype.registDevice = function(deviceInfo){
        var device = JSON.parse(deviceInfo);
        $.ajax({
            url: '/export-receiver/api/v1/device',
            type:'POST',
            contentType:'application/json',
            data : deviceInfo,
            async : false,
            dataType : 'text',
            error:function(){
                alert("ERROR! 注册设备到Export-Receiver失败")
                return false
            }
        });
    }
    //修改在ExportReceiver里的设备
    supportDeviceResource.prototype.editDevice = function(deviceInfo){
        $.ajax({
            url: '/export-receiver/api/v1/device',
            type:'PUT',
            contentType:'application/json',
            data : deviceInfo,
            async : false,
            dataType : 'text',
            error:function(){
                alert("ERROR! 修改设备到Export-Receiver失败")
                return false
            }
        });
    }
    //查看某条Command的详细信息
    supportDeviceResource.prototype.showCommandDetailBtn = function(commandInfo){
        var command = JSON.parse(commandInfo);
        $("#edgex-support-device-edit-deviceList").hide();
        $("#edgex-support-device-edit-command_detail input").val("");
        $("#edgex-support-device-edit-command_detail").show('fast');
        $("#edgex-support-device-edit-command_detail-name").html(command.name);
        $("#edgex-support-device-edit-command_detail-basicinfo-name").val(command.name);
        $("#edgex-support-device-edit-command_detail-basicinfo-type").val(command.type);
        $("#edgex-support-device-edit-command_detail-basicinfo-url").val(command.url);
        $("#edgex-support-device-edit-command_detail-basicinfo-desc").val(command.desc);
        $("#edgex-support-device-edit-command_detail-basicinfo-time_limit").val(command.time_limit);
        $("#edgex-support-device-edit-command_detail-basicinfo-size").val(command.size);
        $("#edgex-support-device-edit-command_detail-basicinfo-energy_limit").val(command.energy_limit);
        $("#edgex-support-device-edit-command_detail-basicinfo-cpu").val(command.cpu);
        $("#edgex-support-device-edit-command_detail-basicinfo-memory").val(command.memory);
        $("#edgex-support-device-edit-command_detail-basicinfo-disk").val(command.disk);
        $("#edgex-support-device-edit-command_detail-basicinfo-kind").val(command.kind);
        $("#edgex-support-device-edit-command_detail-basicinfo-exec_limit").val(command.exec_limit);
        $("#edgex-support-device-edit-command_detail-basicinfo-host_name").val(command.host_name);
        $("#edgex-support-device-edit-command_detail-basicinfo-host_port").val(command.host_port);
        $("#edgex-support-device-edit-command_detail-task_labels table").empty();
        $("#edgex-support-device-edit-command_detail-tolerations table").empty();
        $("#edgex-support-device-edit-command_detail-image_need table").empty();
        deviceresource.showAttributeDetailList("#edgex-support-device-edit-command_detail-task_labels table", JSON.stringify(command.task_labels));
        deviceresource.showAttributeDetailList("#edgex-support-device-edit-command_detail-tolerations table", JSON.stringify(command.tolerations));
        var image_need_element = new Array();
        $.each(command.image_need, function (index,image_need) {
            var Image_need_InputElementList = new Array();
            var Image_need_InputElement = '<input type="text" class="form-control" disabled style="width: 80%" value="'+image_need+'"/>';
            Image_need_InputElementList.push(Image_need_InputElement)
            image_need_element.push(Image_need_InputElementList)
        });
        deviceresource.makeAttributeTable("#edgex-support-device-edit-command_detail-image_need table", image_need_element,8);
        $("#edgex-support-device-edit-command_detail-exit").off('click').on('click', function () {
            $("#edgex-support-device-edit-deviceList").show('fast');
            $("#edgex-support-device-edit-command_detail").hide();
        })
    }
    //编辑Command按钮的功能
    supportDeviceResource.prototype.editCommandBtn = function(commandInfo, device){
        var command = JSON.parse(commandInfo);
        $("#edgex-support-device-edit-deviceList").hide();
        $("#edgex-support-device-edit-command_edit").show('fast');
        var task_label_list = {}, toleration_list = {}, image_need_list = {};
        fillEditCommandPage(commandInfo, task_label_list, toleration_list, image_need_list);
        Init_Task_Label_Add_Btn(task_label_list);
        Init_Task_Tolerations_Add_Btn(toleration_list);
        Init_Task_ImageNeed_Add_Btn(image_need_list);
        $("#edgex-support-device-edit-command_edit-confirm").off('click').on('click', function () {
            if (command.type == "get"){
                device.getcommands[command.name] = JSON.parse(deviceresource.readEditCommandPage())
            }else if (command.type == "put"){
                device.putcommands[command.name] = JSON.parse(deviceresource.readEditCommandPage())
            }
            deviceresource.FillEditDevicePage(JSON.stringify(device));
            $("#edgex-support-device-edit-command_edit input").val("");
            $("#edgex-support-device-edit-command_edit select").val("");
            $("#edgex-support-device-edit-command_edit").hide();
        })
        $("#edgex-support-device-edit-command_edit-cancel").off('click').on('click', function () {
            $("#edgex-support-device-edit-command_edit input").val("");
            $("#edgex-support-device-edit-command_edit select").val("");
            $("#edgex-support-device-edit-command_edit").hide();
            deviceresource.FillEditDevicePage(JSON.stringify(device));
        })
    }
    function fillEditCommandPage(commandInfo, task_label_list, toleration_list, image_need_list) {
        var command = JSON.parse(commandInfo);
        $("#edgex-support-device-edit-command_edit input").val("");
        $("#edgex-support-device-edit-command_edit select").val("");
        $("#edgex-support-device-edit-command_edit-basicinfo-name").val(command.name);
        $("#edgex-support-device-edit-command_edit-basicinfo-type").val(command.type);
        $("#edgex-support-device-edit-command_edit-basicinfo-url").val(command.url);
        $("#edgex-support-device-edit-command_edit-basicinfo-desc").val(command.desc);
        $("#edgex-support-device-edit-command_edit-basicinfo-time_limit").val(command.time_limit);
        $("#edgex-support-device-edit-command_edit-basicinfo-size").val(command.size);
        $("#edgex-support-device-edit-command_edit-basicinfo-energy_limit").val(command.energy_limit);
        $("#edgex-support-device-edit-command_edit-basicinfo-cpu").val(command.cpu);
        $("#edgex-support-device-edit-command_edit-basicinfo-memory").val(command.memory);
        $("#edgex-support-device-edit-command_edit-basicinfo-disk").val(command.disk);
        $("#edgex-support-device-edit-command_edit-basicinfo-kind").val(command.kind);
        $("#edgex-support-device-edit-command_edit-basicinfo-exec_limit").val(command.exec_limit);
        $("#edgex-support-device-edit-command_edit-basicinfo-host_name").val(command.host_name);
        $("#edgex-support-device-edit-command_edit-basicinfo-host_port").val(command.host_port);
        $.each(command.task_labels, function (index,TaskLabel) {
            var random = Math.random();
            var TaskLabel_key = '<input type="text" class="form-control" detail="key" disabled value='+TaskLabel.key+' >';
            var TaskLabel_value = '<input type="text" class="form-control" detail="value" disabled value='+TaskLabel.value+' >';
            var TaskLabel_del_bth = '<div class="edgexIconBtn delTaskLabel" random='+random+'>' + '<i class="fa fa-minus-circle fa-lg" aria-hidden="true"/>' + '</div>';
            var TaskLabel_form_element = new Array()
            TaskLabel_form_element.push(TaskLabel_key);
            TaskLabel_form_element.push(TaskLabel_value);
            TaskLabel_form_element.push(TaskLabel_del_bth);
            task_label_list[random] = TaskLabel_form_element;
        });
        var TableName = "#edgex-support-device-edit-command_edit-task_labels table[name= Task_Labels_List]";
        deviceresource.makeAttributeTable(TableName, task_label_list, 12);
        $.each(command.tolerations, function (index,Toleration) {
            var random = Math.random();
            var Toleration_key = '<input type="text" class="form-control" detail="key" disabled value='+Toleration.key+' >';
            var Toleration_value = '<input type="text" class="form-control" detail="value" disabled value='+Toleration.value+' >';
            var Toleration_del_bth = '<div class="edgexIconBtn delToleration" random='+random+'>' + '<i class="fa fa-minus-circle fa-lg" aria-hidden="true"/>' + '</div>';
            var Toleration_form_element = new Array()
            Toleration_form_element.push(Toleration_key);
            Toleration_form_element.push(Toleration_value);
            Toleration_form_element.push(Toleration_del_bth);
            toleration_list[random] = Toleration_form_element;
        });
        var TableName = "#edgex-support-device-edit-command_edit-tolerations table[name= Toleration_List]";
        deviceresource.makeAttributeTable(TableName, toleration_list, 12);
        $.each(command.image_need, function (index,Image) {
            var random = Math.random();
            var Image = '<input type="text" class="form-control" disabled value='+Image+' >';
            var Image_del_bth = '<div class="edgexIconBtn delImage" random='+random+'>' + '<i class="fa fa-minus-circle fa-lg" aria-hidden="true"/>' + '</div>';
            var Image_need_form_element = new Array()
            Image_need_form_element.push(Image);
            Image_need_form_element.push(Image_del_bth);
            image_need_list[random] = Image_need_form_element;
        });
        var TableName = "#edgex-support-device-edit-command_edit-image_need table[name= Image_Need_List]";
        deviceresource.makeAttributeTable(TableName, image_need_list, 12);
    }
    function Init_Task_Label_Add_Btn(task_label_list){
        $("#edgex-support-device-edit-command_edit-task_labels table[name= New_Task_Labels] i[name= Add_Task_Label]").off('click').on('click',function () {
            var label = {};
            label.key = $("#edgex-support-device-edit-command_edit-task_labels table[name= New_Task_Labels] input[name= New_Task_Label_key]").val();
            label.value = $("#edgex-support-device-edit-command_edit-task_labels table[name= New_Task_Labels] input[name= New_Task_Label_value]").val();
            if (label.key != "" && label.value != ""){
                $("#edgex-support-device-edit-command_edit-task_labels table[name= New_Task_Labels] input").val("");
                $("#edgex-support-device-edit-command_edit-task_labels table[name= New_Task_Labels] input[name= New_Task_Label_key]").focus();
                var random = Math.random();
                var label_key = '<input type="text" class="form-control" disabled detail="key" value='+label.key+' >';
                var label_value = '<input type="text" class="form-control" disabled detail="value" value='+label.value+' >';
                var label_del_bth = '<div class="edgexIconBtn delTaskLabel" random='+random+'>' + '<i class="fa fa-minus-circle fa-lg" aria-hidden="true" />' + '</div>';
                var label_form_element = new Array()
                label_form_element.push(label_key);
                label_form_element.push(label_value);
                label_form_element.push(label_del_bth);
                task_label_list[random] = label_form_element;
                var TableName = "#edgex-support-device-edit-command_edit-task_labels table[name= Task_Labels_List]";
                deviceresource.makeAttributeTable(TableName, task_label_list, 12);
            }
        });
        $("#edgex-support-device-edit-command_edit-task_labels table[name= Task_Labels_List]").off('click').on('click', ".delTaskLabel", function () {
            var random = $(this).attr("random");
            delete task_label_list[random];
            var TableName = "#edgex-support-device-edit-command_edit-task_labels table[name= Task_Labels_List]";
            deviceresource.makeAttributeTable(TableName, task_label_list, 12);
            $("#edgex-support-device-edit-command_edit-task_labels table[name= New_Task_Labels] input[name= New_Task_Label_key]").focus();
        });
    }
    function Init_Task_Tolerations_Add_Btn(toleration_list){
        $("#edgex-support-device-edit-command_edit-tolerations table[name= New_Tolerations] i[name= Add_Toleration]").off('click').on('click',function () {
            var toleration = {};
            toleration.key = $("#edgex-support-device-edit-command_edit-tolerations table[name= New_Tolerations] input[name= New_Toleration_key]").val();
            toleration.value = $("#edgex-support-device-edit-command_edit-tolerations table[name= New_Tolerations] input[name= New_Toleration_value]").val();
            if (toleration.key != "" && toleration.value != ""){
                $("#edgex-support-device-edit-command_edit-tolerations table[name= New_Tolerations] input").val("");
                $("#edgex-support-device-edit-command_edit-tolerations table[name= New_Tolerations] input[name= New_Toleration_key]").focus();
                var random = Math.random();
                var toleration_key = '<input type="text" class="form-control" disabled detail="key" value='+toleration.key+' >';
                var toleration_value = '<input type="text" class="form-control" disabled detail="value" value='+toleration.value+' >';
                var toleration_del_bth = '<div class="edgexIconBtn delToleration" random='+random+'>' + '<i class="fa fa-minus-circle fa-lg" aria-hidden="true" />' + '</div>';
                var toleration_form_element = new Array()
                toleration_form_element.push(toleration_key);
                toleration_form_element.push(toleration_value);
                toleration_form_element.push(toleration_del_bth);
                toleration_list[random] = toleration_form_element;
                var TableName = "#edgex-support-device-edit-command_edit-tolerations table[name= Toleration_List]";
                deviceresource.makeAttributeTable(TableName, toleration_list, 12);
            }
        });
        $("#edgex-support-device-edit-command_edit-tolerations table[name= Toleration_List]").off('click').on('click', ".delToleration", function () {
            var random = $(this).attr("random");
            delete toleration_list[random];
            var TableName = "#edgex-support-device-edit-command_edit-tolerations table[name= Toleration_List]";
            deviceresource.makeAttributeTable(TableName, toleration_list, 12);
            $("#edgex-support-device-edit-command_edit-tolerations table[name= New_Tolerations] input[name= New_Toleration_key]").focus();
        });
    }
    function Init_Task_ImageNeed_Add_Btn(image_need_list){
        $("#edgex-support-device-edit-command_edit-image_need table[name= New_Image_Need] i[name= Add_Image_Need]").off('click').on('click',function () {
            var image_need = $("#edgex-support-device-edit-command_edit-image_need table[name= New_Image_Need] input[name= New_Image_Need]").val();
            if (image_need != ""){
                $("#edgex-support-device-edit-command_edit-image_need table[name= New_Image_Need] input").val("");
                $("#edgex-support-device-edit-command_edit-image_need table[name= New_Image_Need] input[name= New_Image_Need]").focus();
                var random = Math.random();
                var image_need_element = '<input type="text" class="form-control" disabled value='+image_need+' >';
                var image_need_del_bth = '<div class="edgexIconBtn delImage" random='+random+'>' + '<i class="fa fa-minus-circle fa-lg" aria-hidden="true" />' + '</div>';
                var image_need_form_element = new Array()
                image_need_form_element.push(image_need_element);
                image_need_form_element.push(image_need_del_bth);
                image_need_list[random] = image_need_form_element;
                var TableName = "#edgex-support-device-edit-command_edit-image_need table[name= Image_Need_List]";
                deviceresource.makeAttributeTable(TableName, image_need_list, 12);
            }
        });
        $("#edgex-support-device-edit-command_edit-image_need table[name= Image_Need_List]").off('click').on('click', ".delImage", function () {
            var random = $(this).attr("random");
            delete image_need_list[random];
            var TableName = "#edgex-support-device-edit-command_edit-image_need table[name= Image_Need_List]";
            deviceresource.makeAttributeTable(TableName, image_need_list, 12);
            $("#edgex-support-device-edit-command_edit-image_need table[name= New_Image_Need] input[name= New_Image_Need]").focus();
        });
    }
    //读取编辑Command页面
    supportDeviceResource.prototype.readEditCommandPage = function(){
        var command = {};
        command.name = $("#edgex-support-device-edit-command_edit-basicinfo-name").val();
        command.type = $("#edgex-support-device-edit-command_edit-basicinfo-type").val();
        command.url = $("#edgex-support-device-edit-command_edit-basicinfo-url").val();
        command.desc = $("#edgex-support-device-edit-command_edit-basicinfo-desc").val();
        command.time_limit = Number($("#edgex-support-device-edit-command_edit-basicinfo-time_limit").val());
        command.size = Number($("#edgex-support-device-edit-command_edit-basicinfo-size").val());
        command.energy_limit = Number($("#edgex-support-device-edit-command_edit-basicinfo-energy_limit").val());
        command.cpu = Number($("#edgex-support-device-edit-command_edit-basicinfo-cpu").val());
        command.memory = Number($("#edgex-support-device-edit-command_edit-basicinfo-memory").val());
        command.disk = Number($("#edgex-support-device-edit-command_edit-basicinfo-disk").val());
        command.kind = $("#edgex-support-device-edit-command_edit-basicinfo-kind").val();
        command.exec_limit = $("#edgex-support-device-edit-command_edit-basicinfo-exec_limit").val();
        command.host_name = $("#edgex-support-device-edit-command_edit-basicinfo-host_name").val();
        command.host_port = $("#edgex-support-device-edit-command_edit-basicinfo-host_port").val();
        command.task_labels = deviceresource.getAttributeVars("#edgex-support-device-edit-command_edit-task_labels table[name= Task_Labels_List]");
        command.tolerations = deviceresource.getAttributeVars("#edgex-support-device-edit-command_edit-tolerations table[name= Toleration_List]");
        command.image_need = [];
        $("#edgex-support-device-edit-command_edit-image_need table[name= Image_Need_List]").each(function (tindex,titem){
            $(titem).find("input").each(function(newimageindex,newimage){
                command.image_need.push(newimage.value);
            });
        });
        return JSON.stringify(command)
    }


    //===================Device Section End==================================


    return deviceresource;
})();