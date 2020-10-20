$(document).ready(function(){
    orgEdgexFoundry.supportApplication.loadNode();
    orgEdgexFoundry.supportApplication.renderDeviceList();
});
//init application object

orgEdgexFoundry.supportApplication = (function(){
    "use strict";
    function SupportApplication() {
        this.applicationListCache = [];
        this.selectedApplicationRow = null;
        this.taskListCache = [];
        this.selectedTaskRow = null;
        this.nodeCache = [];
    }
    SupportApplication.prototype = {
        constructor: SupportApplication,

        getAttributeVars: null,

        deleteNodeBtn: null,
        showDetailNodeBtn: null,
        addNodeBtn: null,
        refreshNodeListBtn: null,
        commitNodeBtn: null,
        makeAttributeTable: null,
        cancelAddNodeBtn: null,
        editNodeBtn: null,
        loadNode: null,
        rendernode: null,
        showAPPList:null,

        loadDeviceList:null,
        renderDeviceList:null,
        showDeviceDetail:null,
        registDevice:null,
        deleteDevice:null,
        showCommand:null,
        RenderCommandList: null,
        MergeCommmandList: null,
        addCommandBtn: null,
        editCommandBtn: null,
        cancelAddCommandBtn: null,

        loadApplicationList: null,
        renderApplicationList: null,
        hideTaskList: null,
        loadTaskList: null,
        renderTaskList: null,
        deleteApplicationBtn: null,
        addApplicationBtn: null,
        detailTaskBtn: null,
        cancelTaskDetailBtn: null,
        cancelAddApplicationBtn: null,
        commitApplicationBtn: null,
        editApplicationBtn: null,
        refreshApplicationListBtn: null,
        execApp:null,

        deleteTaskBtn: null,
        addTaskBtn: null,
        commitTaskBtn: null,
        editTaskBtn: null,
        refreshTaskListBtn: null,
        scheduleBtn: null,
        sendCommand: null,
        confirmSend: null,

    }
    var application = new SupportApplication();

    //=====================Public Functions=====================================
    //按规定数目渲染表格
    SupportApplication.prototype.makeAttributeTable = function(TableName, ElementList, ColumnNumber){
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
    SupportApplication.prototype.getAttributeVars = function(table){
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
    SupportApplication.prototype.showAttributeDetailList = function(table, AttributeList){
        AttributeList = JSON.parse(AttributeList)
        var attributeelement = new Array();
        $.each(AttributeList, function (index,attribute) {
            var AttributeInputElementList = new Array();
            var attr = 'key: ' + attribute.key + ' value: ' + attribute.value;
            var AttributeInputElement = '<input type="text" class="form-control" disabled style="width: 80%" value="'+attr+'"/>';
            AttributeInputElementList.push(AttributeInputElement)
            attributeelement.push(AttributeInputElementList)
        });
        application.makeAttributeTable(table,attributeelement,8);
    }

    //===================Node section begin===================================
    //加载Node列表和查询Node信息
    SupportApplication.prototype.loadNode = function () {
        $.ajax({
            url:'/api/v1/node',
            type:'GET',
            success:function (data) {
                if(!data || data.length == 0){
                    $("#edgex-support-node-list table tbody").empty();
                    $("#edgex-support-node-list table tfoot").show();

                    return
                }else{
                    $("#edgex-support-node-list table tfoot").hide();
                }
                application.nodeCache = data;
                application.rendernode(data);
                application.cancelAddNodeBtn();
            },
            error:function(){

            }
        });
    }
    //列出Node列表
    SupportApplication.prototype.rendernode = function (data) {
        console.log(data)
        $("#edgex-support-node-list table tbody").empty();
        $.each(data,function(i,v){
            var rowData = "<tr>";
            rowData += "<td>" +  (i+1) + "</td>";
            rowData += "<td>" +  v.id + "</td>";
            rowData += "<td>" +  v.name + "</td>";
            rowData += "<td>" +  v.cpu + "</td>";
            rowData += "<td>" +  v.memory + "</td>";
            rowData += "<td>" +  v.disk + "</td>";
            rowData += '<td class="scheduler-del-icon del_node"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-trash-o fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += '<td class="scheduler-edit-icon edit_node"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-edit fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += '<td class="scheduler-detail-icon node_detail"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-eye fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += '<td class="scheduler-apps-icon show_node_app"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-search-plus fa-lg"/></div></td>';
            rowData += "</tr>";
            $("#edgex-support-node-list table tbody").append(rowData);
        });

        $(".del_node").on('click',function(){
            application.deleteNodeBtn($(this).children("input[type='hidden']").val());
        });
        $(".edit_node").on('click',function(){
            application.editNodeBtn($(this).children("input[type='hidden']").val());
        });
        $(".node_detail").on('click',function(){
            application.showDetailNodeBtn($(this).children("input[type='hidden']").val());
        });
        $(".show_node_app").off('click').on('click',function(){
            application.showAPPList($(this).children("input[type='hidden']").val());
        });
    }
    //刷新Node列表按钮的功能
    SupportApplication.prototype.refreshNodeListBtn = function () {
        application.loadNode();
    }
    //删除Node按钮的作用
    SupportApplication.prototype.deleteNodeBtn = function(Node){
        bootbox.confirm({
            title: "confirm",
            message: "Are you sure to delete ? ",
            className: 'green-red-buttons',
            callback: function (result) {
                if(result){
                    $.ajax({
                        url: '/api/v1/node/' + JSON.parse(Node).id,
                        type: 'DELETE',
                        success: function(){
                            application.loadNode();
                            bootbox.alert({
                                message: "delete success.",
                                className: 'red-green-buttons'
                            });
                        },
                        statusCode: {
                            409: function(){
                                bootbox.alert({
                                    title:'Error',
                                    message: "attempt to delete a task still being referenced by device reports",
                                    className: 'red-green-buttons'
                                });
                            }
                        }
                    });
                }
            }
        });
    }
    //查看Node详细信息按钮的作用
    SupportApplication.prototype.showDetailNodeBtn = function(Node){
        InitDetailPage()
        Node = JSON.parse(Node);
        $(".edgex-support-node-detail-name").html(Node.name);
        $(".edgex-support-node-detail-ID").html(Node.id);
        $("#edgex-support-node-detail-hardware-resource span[name= CPU]").html(Node.cpu);
        $("#edgex-support-node-detail-hardware-resource span[name= memory]").html(Node.memory);
        $("#edgex-support-node-detail-hardware-resource span[name= disk]").html(Node.disk);

        application.showAttributeDetailList("#edgex-support-node-detail-taint-list table[name=Taint_List]", JSON.stringify(Node.taint));
        application.showAttributeDetailList("#edgex-support-node-detail-label-node table[name=Node_Label_List]", JSON.stringify(Node.node_labels));
        application.showAttributeDetailList("#edgex-support-node-detail-label-task table[name=Task_Label_List]", JSON.stringify(Node.task_labels));
    }
    function InitDetailPage(){
        $("#edgex-support-node-list").hide();
        $("#edgex-support-Node-detail").show('fast');
        $(".panel-title button").on('click',function(){
            $("#edgex-support-node-list").show('fast');
            $("#edgex-support-Node-detail").hide();
            $(".edgex-support-node-detail-name").html("");
            $(".edgex-support-node-detail-ID").html("");
            $("#edgex-support-node-detail-hardware-resource span").html("");
            $("#edgex-support-node-detail-hardware-occupy span").html("");
            $("#edgex-support-node-detail-hardware-pressure span").html("");
        });
    }
    //新建Node页面渲染
    SupportApplication.prototype.addNodeBtn = function () {
        $("#edgex-support-node-list").hide();
        $("#edgex-support-node-add").show();
        $("#edgex-support-node-add div.update-node").hide();
        $("#edgex-support-node-add div.add-node").show();
        var taint_list = {};
        var label_list = {};
        InitTaintAndLabelBtn(taint_list, label_list);
    };
    function InitTaintAndLabelBtn(taint_list, label_list){
        $("#edgex-support-node-add-taint table[name= AddNewTaint] i[name= AddNewTaint]").off('click').on('click',function(){
            var taint = {};
            taint.key = $("#edgex-support-node-add-taint table[name= AddNewTaint] input[name= NewTaint_Key]").val();
            taint.value = $("#edgex-support-node-add-taint table[name= AddNewTaint] input[name= NewTaint_Value]").val();
            if (taint != ""){
                $("#edgex-support-node-add-taint table[name= AddNewTaint] input").val("");
                $("#edgex-support-node-add-taint table[name= AddNewTaint] input[name= NewTaint_Key]").focus();
                var random = Math.random();
                var taint_key = '<input type="text" class="form-control" name="NewTaint" disabled detail="key" value='+taint.key+' >';
                var taint_value = '<input type="text" class="form-control" name="NewTaint" disabled detail="value" value='+taint.value+' >';
                var taint_del_bth = '<div class="edgexIconBtn delTaint" random='+random+'>' + '<i name="delTaint" class="fa fa-minus-circle fa-lg" aria-hidden="true" />' + '</div>';
                var taint_form_element = new Array()
                taint_form_element.push(taint_key,taint_value);
                taint_form_element.push(taint_del_bth);
                taint_list[random] = taint_form_element;
                var TableName = "#edgex-support-node-add-taint table[name=TaintList]";
                application.makeAttributeTable(TableName, taint_list, 12);
            }
        });
        $("#edgex-support-node-add-taint table[name=TaintList]").off('click').on('click', ".delTaint", function () {
            var random = $(this).attr("random");
            delete taint_list[random];
            var TableName = "#edgex-support-node-add-taint table[name=TaintList]";
            application.makeAttributeTable(TableName, taint_list, 12);
            $("#edgex-support-node-add-taint table[name= AddNewTaint] input").focus();
        });
        $("#edgex-support-node-add-node_label table[name= AddNewNodeLabel] i[name= AddNewNodeLabel]").off('click').on('click',function(){
            var label = {};
            label.key = $("#edgex-support-node-add-node_label table[name= AddNewNodeLabel] input[name= NewNodeLabel_Key]").val();
            label.value = $("#edgex-support-node-add-node_label table[name= AddNewNodeLabel] input[name= NewNodeLabel_Value]").val();
            if (label.key != "" && label.value != ""){
                $("#edgex-support-node-add-node_label table[name= AddNewNodeLabel] input").val("");
                $("#edgex-support-node-add-node_label table[name= AddNewNodeLabel] input[name= NewNodeLabel_Key]").focus();
                var random = Math.random()
                var label_key = '<input type="text" class="form-control" disabled detail="key" value='+label.key+' >';
                var label_value = '<input type="text" class="form-control" disabled detail="value" value='+label.value+' >';
                var label_del_bth = '<div class="edgexIconBtn delNodeLabel" random='+random+'>' + '<i class="fa fa-minus-circle fa-lg" aria-hidden="true" />' + '</div>';
                var label_form_element = new Array()
                label_form_element.push(label_key);
                label_form_element.push(label_value);
                label_form_element.push(label_del_bth);
                label_list[random] = label_form_element;
                var TableName = "#edgex-support-node-add-node_label table[name=NodeLabelList]";
                application.makeAttributeTable(TableName, label_list, 12);
            }
        });
        $("#edgex-support-node-add-node_label table[name=NodeLabelList]").off('click').on('click', ".delNodeLabel", function () {
            var random = $(this).attr("random");
            delete label_list[random];
            var TableName = "#edgex-support-node-add-node_label table[name=NodeLabelList]";
            application.makeAttributeTable(TableName, label_list, 12);
            $("#edgex-support-node-add-node_label table[name= AddNewNodeLabel] input[name= NewNodeLabel_Key]").focus();
        });
    };
    //新建Node页面提交按钮的功能
    SupportApplication.prototype.commitNodeBtn = function (type) {
        var nodeData = {
            id: $("#edgex-support-node-add-nodeID").val(),
            name: $("#edgex-support-node-add-nodename").val(),
            cpu: Number($("#edgex-support-node-add-hardware table input[name= 'CpuResource']").val()),
            memory: Number($("#edgex-support-node-add-hardware table input[name= 'Memory']").val()),
            disk: Number($("#edgex-support-node-add-hardware table input[name= 'Disk']").val()),
            taint: [],
            node_labels: []
        };
        nodeData.taint = application.getAttributeVars("#edgex-support-node-add-taint table[name=TaintList]");
        nodeData.node_labels = application.getAttributeVars("#edgex-support-node-add-node_label table[name=NodeLabelList]");
        //debugger
        if(type=="new"){
            commitNode(nodeData);
        }else{
            updateNode(nodeData);
        }
    }
    //新建或修改Node的ajax
    function commitNode(nodeData) {
        console.log(JSON.stringify(nodeData))
        $.ajax({
            url: '/api/v1/node',
            type: 'POST',
            data: JSON.stringify(nodeData),
            success: function(){
                application.loadNode();
                bootbox.alert({
                    message: "Add Node Success!",
                    className: 'red-green-buttons'
                });
            },
            statusCode: {
                400: function(err){
                    bootbox.alert({
                        title:'Error',
                        message: "malformed or unparsable requests ! " + err.responseText,
                        className: 'red-green-buttons'
                    });
                },
                409: function(){
                    bootbox.alert({
                        title:'Error',
                        message: "the start, end, or frequency strings are not properly formatted !",
                        className: 'red-green-buttons'
                    });
                },
                500: function(){
                    bootbox.alert({
                        message: "unknown or unanticipated issues !",
                        className: 'red-green-buttons'
                    });
                }
            }
        });
    }
    function updateNode(nodeData) {
        $.ajax({
            url: '/api/v1/node',
            type: 'PUT',
            data: JSON.stringify(nodeData),
            success: function(){
                application.loadNode();
                bootbox.alert({
                    message: "Update Node Success!",
                    className: 'red-green-buttons'
                });
            },
            statusCode: {
                400: function(){
                    bootbox.alert({
                        title:'Error',
                        message: "malformed or unparsable requests !",
                        className: 'red-green-buttons'
                    });
                },
                404: function(){
                    bootbox.alert({
                        title:'Error',
                        message: "no application is found for the id !",
                        className: 'red-green-buttons'
                    });
                },
                409: function(){
                    bootbox.alert({
                        title:'Error',
                        message: "the start, end, or frequency strings are not properly formatted !",
                        className: 'red-green-buttons'
                    });
                },
                500: function(){
                    bootbox.alert({
                        message: "unknown or unanticipated issues !",
                        className: 'red-green-buttons'
                    });
                }
            }
        });
    }
    //新建Node页面关闭的动作
    SupportApplication.prototype.cancelAddNodeBtn = function () {
        $("#edgex-support-node-list").show();
        $("#edgex-support-node-add").hide();
        $("#edgex-support-node-add form input").val("");
        $("#edgex-support-node-add-taint table[name=TaintList] tbody").empty();
        $("#edgex-support-node-add-node_label table[name=NodeLabelList] tbody").empty();
    }
    //修改Node按钮的功能
    SupportApplication.prototype.editNodeBtn = function (node) {
        var NodeItem = JSON.parse(node);
        //debugger
        $("#edgex-support-node-add-nodeID").val(NodeItem.id);
        $("#edgex-support-node-add-nodename").val(NodeItem.name);
        $("#edgex-support-node-add-hardware table input[name= 'CpuResource']").val(NodeItem.cpu);
        $("#edgex-support-node-add-hardware table input[name= 'Memory']").val(NodeItem.memory);
        $("#edgex-support-node-add-hardware table input[name= 'Disk']").val(NodeItem.disk);

        var taint_list = {}, label_list = {};
        $.each(NodeItem.taint, function (index,taint) {
            var random = Math.random();
            var taint_key = '<input type="text" class="form-control" detail="key" disabled value='+taint.key+' >';
            var taint_value = '<input type="text" class="form-control" detail="value" disabled value='+taint.value+' >';
            var taint_del_bth = '<div class="edgexIconBtn delTaint" random='+random+'>' + '<i name="delTaint" class="fa fa-minus-circle fa-lg" aria-hidden="true" />' + '</div>';
            var taint_form_element = new Array()
            taint_form_element.push(taint_key);
            taint_form_element.push(taint_value);
            taint_form_element.push(taint_del_bth);
            taint_list[random] = taint_form_element;
        });
        console.log(taint_list)
        var TableName = "#edgex-support-node-add-taint table[name=TaintList]";
        application.makeAttributeTable(TableName, taint_list, 12);

        $.each(NodeItem.node_labels, function (index,label) {
            var random = Math.random()
            var label_key = '<input type="text" class="form-control" disabled detail="key" value='+label.key+' >';
            var label_value = '<input type="text" class="form-control" disabled detail="value" value='+label.value+' >';
            var label_del_bth = '<div class="edgexIconBtn delNodeLabel" random='+random+'>' + '<i class="fa fa-minus-circle fa-lg" aria-hidden="true" />' + '</div>';
            var label_form_element = new Array()
            label_form_element.push(label_key);
            label_form_element.push(label_value);
            label_form_element.push(label_del_bth);
            label_list[random] = label_form_element;
        });
        var TableName = "#edgex-support-node-add-node_label table[name=NodeLabelList]";
        application.makeAttributeTable(TableName, label_list, 12);
        InitTaintAndLabelBtn(taint_list, label_list);


        $("#edgex-support-node-list").hide();
        $("#edgex-support-node-add").show();
        $("#edgex-support-node-add div.update-node").show();
        $("#edgex-support-node-add div.add-node").hide();

    }
    //根据NodeID查看上面的APP功能
    SupportApplication.prototype.showAPPList = function (node){
        var NodeData = JSON.parse(node);
        application.loadApplicationList(NodeData.id);
        $("#edgex-support-application").show('fast');
        $("#edgex-support-application-Node_Name").html(NodeData.name);
        $("#edgex-support-application-exit").off('click').on('click',function(){
            $("#edgex-support-application").hide();
        });
    };
    //===================Node section end===================================

    //===================Device Section Begin================================
    //获取Edgex里面的设备列表以及Edgex-Export-Receiver里的设备列表
    SupportApplication.prototype.loadDeviceList = function() {
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
    SupportApplication.prototype.renderDeviceList = function() {
        var devicelist = application.loadDeviceList()[0], Exporterdevicelist = application.loadDeviceList()[1];
        var deviceExistInExporter = {};
        $.each(Exporterdevicelist, function (index, element) {
            deviceExistInExporter[element.edgexid] = true
        })
        $("#edgex-support-device-devicelist tbody").empty();
        $.each(devicelist,function(i,v){
            var exist = deviceExistInExporter[v.id] != null;
            var rowData = "<tr>";
            rowData += "<td>" + (i + 1) +"</td>";
            rowData += "<td>" +  v.id + "</td>";
            rowData += "<td>" +  v.name + "</td>";
            rowData += '<td class="scheduler-detail-icon device_exporter_detail"><input type="hidden" value=\''+JSON.stringify(v)+'\' exist=\''+exist+'\'><div class="edgexIconBtn"><i class="fa fa-eye fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += '<td class="scheduler-edit-icon edit_device"><input type="hidden" value=\''+v.id+'\'><div class="edgexIconBtn"><i class="fa fa-edit fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += "</tr>";
            $("#edgex-support-device-devicelist tbody").append(rowData);
        });
        if (devicelist.length == 0){
            $("#edgex-support-device-devicelist tfoot").show('fast');
        }else {
            $("#edgex-support-device-devicelist tfoot").hide()
        }
        $(".device_exporter_detail").off('click').on('click',function(){
            application.showDeviceDetail($(this).children("input[type='hidden']").val(), $(this.children).attr("exist"));
        });
    }
    //显示设备详细信息
    SupportApplication.prototype.showDeviceDetail = function (device, exist){
        var deviceInfo = JSON.parse(device);
        $("#edgex-support-device-command-detail").show('fast');
        $("#edgex-support-device-command-name").html(deviceInfo.name)
        if (exist == "true"){
            application.showCommand(device)
        }else {
            $("#edgex-support-device-command-registed").hide();
            $("#edgex-support-device-command-not_registed").show('fast');
            $("#edgex-support-device-command-regist").off('click').on('click',function(){
                application.registDevice(device);
                application.renderDeviceList();
                application.showCommand(device)
            });
        }
        $("#edgex-support-device-command-close").off('click').on('click', function () {
            $("#edgex-support-device-command-detail").hide();
            application.renderDeviceList();
        })
    }
    //注册设备，同时注册到Edgex-Export和Edgex-Export-Receiver
    SupportApplication.prototype.registDevice = function(deviceInfo){
        var device = JSON.parse(deviceInfo);
        var edgex_export_receiverInfo = {
            "edgexid" : device.id,
            "name" : device.name
        };
        $.ajax({
            url: '/export-receiver/api/v1/device',
            type:'POST',
            contentType:'application/json',
            data : JSON.stringify(edgex_export_receiverInfo),
            async : false,
            dataType : 'text',
            error:function(){
                alert("ERROR! 注册设备到Export-Receiver失败")
                return false
            }
        });

        var core_export_registInfo = {};
        $.ajax({
            url: '/core-export/api/v1/registration/name/Edgex-Exporter-Receiver',
            type:'GET',
            contentType:'application/json',
            async : false,
            success:function(data){
                core_export_registInfo = data
            },
            error:function(){
                alert("ERROR! 获取Edgex设备导出注册信息失败")
                return false
            }
        });
        if (core_export_registInfo.filter.deviceIdentifiers == null){
            core_export_registInfo.filter.deviceIdentifiers = new Array()
        }
        core_export_registInfo.filter.deviceIdentifiers.push(device.name);
        for (var i=core_export_registInfo.filter.deviceIdentifiers.length-1;i>0;i--){
            if(core_export_registInfo.filter.deviceIdentifiers[i]==core_export_registInfo.filter.deviceIdentifiers[i-1]){
                core_export_registInfo.filter.deviceIdentifiers.splice(i,1);
            }
        }
        $.ajax({
            url: '/core-export/api/v1/registration',
            type:'PUT',
            contentType:'application/json',
            async : false,
            data : JSON.stringify(core_export_registInfo),
            error:function(){
                alert("ERROR! 更新Edgex设备导出注册信息失败")
                return false
            }
        });
    }
    //删除设备，同时删除到Edgex-Export和Edgex-Export-Receiver
    SupportApplication.prototype.deleteDevice = function(deviceInfo){
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
        var core_export_registInfo = {};
        $.ajax({
            url: '/core-export/api/v1/registration/name/Edgex-Exporter-Receiver',
            type:'GET',
            contentType:'application/json',
            async : false,
            success:function(data){
                core_export_registInfo = data
            },
            error:function(){
                alert("ERROR! 获取Edgex设备导出注册信息失败")
                return false
            }
        });
        core_export_registInfo.filter.deviceIdentifiers.splice($.inArray(device.name,core_export_registInfo.filter.deviceIdentifiers),1);
        $.ajax({
            url: '/core-export/api/v1/registration',
            type:'PUT',
            contentType:'application/json',
            async : false,
            data : JSON.stringify(core_export_registInfo),
            error:function(){
                alert("ERROR! 更新Edgex设备导出注册信息失败")
                return false
            }
        });
    }
    //显示设备注册命令信息
    SupportApplication.prototype.showCommand = function(deviceInfo){
        var device = JSON.parse(deviceInfo);
        var edgexExportReceiverDevice = showDeviceInExportReceiver(device.id);
        var edgexDeviceCommand = showDeviceCommandInEdgex(device.id);
        if (edgexExportReceiverDevice == null || edgexDeviceCommand == null){
            return false;
        }
        $("#edgex-support-device-command-registed").show('fast');
        $("#edgex-support-device-command-not_registed").hide();
        application.RenderCommandList(JSON.stringify(edgexExportReceiverDevice), JSON.stringify(edgexDeviceCommand))
        $("#edgex-support-device-command-registed i[name= 'refreshDeviceCommandList']").off('click').on('click', function () {
            application.showCommand(deviceInfo)
        })
        $("#edgex-support-device-command-registed i[name= 'delDevice']").off('click').on('click', function () {
           deleteDeviceBtn(deviceInfo)
        })
    }
    function showDeviceInExportReceiver(id){
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
    function deleteDeviceBtn(deviceInfo){
        var device = JSON.parse(deviceInfo);
        bootbox.confirm({
            title: "提示",
            message: "是否要删除Device: " + "<font color = 'red'>" + device.name+ "</font>" + "?<br/><font color = 'red'>删除后不可恢复，确定删除?</font>",
            className: 'green-red-buttons',
            callback: function (result) {
                if (result) {
                    application.deleteDevice(deviceInfo);
                    $("#edgex-support-device-command-detail").hide();
                    application.renderDeviceList();
                }
            }
        });
    }
    //填充命令列表
    SupportApplication.prototype.RenderCommandList = function(exporterdevice, edgexcommand){
        var edgexExportReceiverDevice = JSON.parse(exporterdevice), edgexDeviceCommand = JSON.parse(edgexcommand);
        var mergedCommandList = application.MergeCommmandList(exporterdevice, edgexcommand);
        $("#edgex-support-device-commandlist tbody").empty();
        $.each(mergedCommandList, function (index,command) {
            var rowData = "<tr>";
            rowData += "<td>" + (index + 1) +"</td>";
            rowData += "<td>" +  command.name + "</td>";
            rowData += "<td>" +  command.method + "</td>";
            var registed = command.exportreceiverdata != null
            if (registed){
                rowData += '<td class="scheduler-detail-icon command_detail"><input type="hidden" value=\''+JSON.stringify(command)+'\'><div class="edgexIconBtn"><i class="fa fa-search-plus fa-lg" aria-hidden="true"></i> </div></td>';
            }else{
                rowData += "<td>" +  '未注册' + "</td>";
            }
            rowData += '<td class="scheduler-detail-icon command_addOrEdit"><input type="hidden" value=\''+JSON.stringify(command)+'\' registed=\''+registed+'\'><div class="edgexIconBtn"><i class="fa fa-edit fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += "</tr>";
            $("#edgex-support-device-commandlist tbody").append(rowData);
        });
        if (mergedCommandList.length == 0){
            $("#edgex-support-device-commandlist tfoot").show('fast');
        }else {
            $("#edgex-support-device-commandlist tfoot").hide()
        }
        $(".command_addOrEdit").off('click').on('click',function(){
            var registed = $(this.children).attr("registed");
            if (registed == "false"){
                application.addCommandBtn()
            }else {
                application.editCommandBtn()
            }
        });
    }
    //将Edgex中的命令和Export-Receiver的命令归并起来
    SupportApplication.prototype.MergeCommmandList = function(exporterdevice, edgexcommand){
        var edgexExportReceiverDevice = JSON.parse(exporterdevice), edgexDeviceCommand = JSON.parse(edgexcommand);
        var mergedCommandList = new Array();
        $.each(edgexDeviceCommand.commands, function (index, command) {
            if (command.get != null){
                var commandelement = {};
                commandelement.name = command.name;
                commandelement.method = "get";
                commandelement.edgexdata = command.get;
                commandelement.exportreceiverdata = edgexExportReceiverDevice.getcommands[command.name];
                mergedCommandList.push(JSON.parse(JSON.stringify(commandelement)));
            }
            if (command.put != null){
                var commandelement = {};
                commandelement.name = command.name;
                commandelement.method = "put";
                commandelement.edgexdata = command.put;
                commandelement.exportreceiverdata = edgexExportReceiverDevice.putcommands[command.name];
                mergedCommandList.push(JSON.parse(JSON.stringify(commandelement)));
            }
        })
        return mergedCommandList
    }
    //添加Command按钮的功能
    SupportApplication.prototype.addCommandBtn = function(){
        $("#edgex-support-device-command-detail").hide();
        $("#edgex-support-device-command-add").show('fast');
        $("#edgex-support-device-command-add div.add-command").show('fast');
        $("#edgex-support-task-add div.update-command").hide();
        var task_label_list = {}, toleration_list = {}, image_need_list = {};
        Init_Task_Label_Add_Btn(task_label_list);
        Init_Task_Tolerations_Add_Btn(toleration_list);
        Init_Task_ImageNeed_Add_Btn(image_need_list)
    }
    function Init_Task_Label_Add_Btn(task_label_list){
        $("#edgex-support-device-command-add-task_labels table[name= New_Task_Labels] i[name= Add_Task_Label]").off('click').on('click',function () {
            var label = {};
            label.key = $("#edgex-support-device-command-add-task_labels table[name= New_Task_Labels] input[name= New_Task_Label_key]").val();
            label.value = $("#edgex-support-device-command-add-task_labels table[name= New_Task_Labels] input[name= New_Task_Label_value]").val();
            if (label.key != "" && label.value != ""){
                $("#edgex-support-device-command-add-task_labels table[name= New_Task_Labels] input").val("");
                $("#edgex-support-device-command-add-task_labels table[name= New_Task_Labels] input[name= New_Task_Label_key]").focus();
                var random = Math.random();
                var label_key = '<input type="text" class="form-control" disabled detail="key" value='+label.key+' >';
                var label_value = '<input type="text" class="form-control" disabled detail="value" value='+label.value+' >';
                var label_del_bth = '<div class="edgexIconBtn delTaskLabel" random='+random+'>' + '<i class="fa fa-minus-circle fa-lg" aria-hidden="true" />' + '</div>';
                var label_form_element = new Array()
                label_form_element.push(label_key);
                label_form_element.push(label_value);
                label_form_element.push(label_del_bth);
                task_label_list[random] = label_form_element;
                var TableName = "#edgex-support-device-command-add-task_labels table[name= Task_Labels_List]";
                application.makeAttributeTable(TableName, task_label_list, 12);
            }
        });
        $("#edgex-support-device-command-add-task_labels table[name= Task_Labels_List]").off('click').on('click', ".delTaskLabel", function () {
            var random = $(this).attr("random");
            delete task_label_list[random];
            var TableName = "#edgex-support-device-command-add-task_labels table[name= Task_Labels_List]";
            application.makeAttributeTable(TableName, task_label_list, 12);
            $("#edgex-support-device-command-add-task_labels table[name= New_Task_Labels] input[name= New_Task_Label_key]").focus();
        });
    }
    function Init_Task_Tolerations_Add_Btn(toleration_list){
        $("#edgex-support-device-command-add-tolerations table[name= New_Tolerations] i[name= Add_Toleration]").off('click').on('click',function () {
            var toleration = {};
            toleration.key = $("#edgex-support-device-command-add-tolerations table[name= New_Tolerations] input[name= New_Toleration_key]").val();
            toleration.value = $("#edgex-support-device-command-add-tolerations table[name= New_Tolerations] input[name= New_Toleration_value]").val();
            if (toleration.key != "" && toleration.value != ""){
                $("#edgex-support-device-command-add-tolerations table[name= New_Tolerations] input").val("");
                $("#edgex-support-device-command-add-tolerations table[name= New_Tolerations] input[name= New_Toleration_key]").focus();
                var random = Math.random();
                var toleration_key = '<input type="text" class="form-control" disabled detail="key" value='+toleration.key+' >';
                var toleration_value = '<input type="text" class="form-control" disabled detail="value" value='+toleration.value+' >';
                var toleration_del_bth = '<div class="edgexIconBtn delToleration" random='+random+'>' + '<i class="fa fa-minus-circle fa-lg" aria-hidden="true" />' + '</div>';
                var toleration_form_element = new Array()
                toleration_form_element.push(toleration_key);
                toleration_form_element.push(toleration_value);
                toleration_form_element.push(toleration_del_bth);
                toleration_list[random] = toleration_form_element;
                var TableName = "#edgex-support-device-command-add-tolerations table[name= Toleration_List]";
                application.makeAttributeTable(TableName, toleration_list, 12);
            }
        });
        $("#edgex-support-device-command-add-tolerations table[name= Toleration_List]").off('click').on('click', ".delToleration", function () {
            var random = $(this).attr("random");
            delete toleration_list[random];
            var TableName = "#edgex-support-device-command-add-tolerations table[name= Toleration_List]";
            application.makeAttributeTable(TableName, toleration_list, 12);
            $("#edgex-support-device-command-add-tolerations table[name= New_Tolerations] input[name= New_Toleration_key]").focus();
        });
    }
    function Init_Task_ImageNeed_Add_Btn(image_need_list){
        $("#edgex-support-device-command-add-image_need table[name= New_Image_Need] i[name= Add_Image_Need]").off('click').on('click',function () {
            var image_need = $("#edgex-support-device-command-add-image_need table[name= New_Image_Need] input[name= New_Image_Need]").val();
            if (image_need != ""){
                $("#edgex-support-device-command-add-image_need table[name= New_Image_Need] input").val("");
                $("#edgex-support-device-command-add-image_need table[name= New_Image_Need] input[name= New_Image_Need]").focus();
                var random = Math.random();
                var image_need_element = '<input type="text" class="form-control" disabled value='+image_need+' >';
                var image_need_del_bth = '<div class="edgexIconBtn delImage" random='+random+'>' + '<i class="fa fa-minus-circle fa-lg" aria-hidden="true" />' + '</div>';
                var image_need_form_element = new Array()
                image_need_form_element.push(image_need_element);
                image_need_form_element.push(image_need_del_bth);
                image_need_list[random] = image_need_form_element;
                var TableName = "#edgex-support-device-command-add-image_need table[name= Image_Need_List]";
                application.makeAttributeTable(TableName, image_need_list, 12);
            }
        });
        $("#edgex-support-device-command-add-image_need table[name= Image_Need_List]").off('click').on('click', ".delImage", function () {
            var random = $(this).attr("random");
            delete image_need_list[random];
            var TableName = "#edgex-support-device-command-add-image_need table[name= Image_Need_List]";
            application.makeAttributeTable(TableName, image_need_list, 12);
            $("#edgex-support-device-command-add-image_need table[name= New_Image_Need] input[name= New_Image_Need]").focus();
        });
    }
    //关闭添加Command页面按钮的功能
    SupportApplication.prototype.cancelAddCommandBtn = function(){
        $("#edgex-support-task-list-main").show();
        $("#edgex-support-device-command-add").hide();
        $("#edgex-support-device-command-add input").val("");
        $("#edgex-support-device-command-add select").val("");
        $("#edgex-support-device-command-add-task_labels table[name= Task_Labels_List]").empty();
        $("#edgex-support-device-command-add-tolerations table[name= Toleration_List]").empty();
        $("#edgex-support-device-command-add-image_need table[name= Image_Need_List]").empty();
    }

    //===================Device Section End==================================


    //===================App section begin===================================
    //初始化应用列表
    SupportApplication.prototype.loadApplicationList = function (nodeID) {
        var addr = "/api/v1/application/findnode/" + nodeID;
            $.ajax({
                url:addr,
                type:'GET',
                success:function(data){
                    if(!data || data.length == 0){
                        $("#edgex-support-application-list table tbody").empty();
                        $("#edgex-support-application-list table tfoot").show();

                        return
                    }else{
                        $("#edgex-support-application-list table tfoot").hide();

                    }
                    application.applicationListCache = data;
                    application.renderApplicationList(data);
                },
                error:function(){
                    alert("ERROR!")
                }
            });
        $("#edgex-support-application div[name= add_application]").off('click').on('click',function () {
            application.addApplicationBtn(nodeID)
        })
        $("#edgex-support-application div[name= refresh_application]").off('click').on('click',function () {
            application.loadApplicationList(nodeID)
        })
    }
    //刷新应用列表
    SupportApplication.prototype.renderApplicationList = function(data){
        console.log(data);
            $("#edgex-support-application-list table tbody").empty();
            $.each(data,function(i,v){
                var rowData = "<tr>";
                rowData += "<td>" + (i + 1) +"</td>";
                rowData += "<td>" +  v.id + "</td>";
                rowData += "<td>" +  v.name + "</td>";
                rowData += "<td>" +  v.desc + "</td>";
                rowData += "<td>" +  v.task_num + "</td>";
                rowData += '<td class="scheduler-edit-icon edit_app"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-edit fa-lg" aria-hidden="true"></i> </div></td>';
                rowData += '<td class="scheduler-delete-icon del_app"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-trash-o fa-lg" aria-hidden="true"></i> </div></td>';
                rowData += '<td class="scheduler-task-icon list_task"><input type="hidden" value="'+v.id+'"><div class="edgexIconBtn"><i class="fa fa-search-plus fa-lg" aria-hidden="true"></i> </div></td>';
                rowData += '<td class="scheduler-task-icon exec_app"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-play-circle-o fa-lg" aria-hidden="true"></i> </div></td>';
                rowData += "</tr>";
                $("#edgex-support-application-list table tbody").append(rowData);
            });
            $(".edit_app").on('click',function(){
                application.editApplicationBtn($(this).children("input[type='hidden']").val());
            });
            $(".del_app").on('click',function(){
                application.deleteApplicationBtn($(this).children("input[type='hidden']").val());
            });
            $(".list_task").on('click',function(){
            application.loadTaskList($(this).children("input[type='hidden']").val());
            });
            $(".exec_app").on('click',function(){
                application.execApp($(this).children("input[type='hidden']").val());
            });

        }
    //新建应用相关页面显示控制
    SupportApplication.prototype.addApplicationBtn =function (nodeid) {
        $("#edgex-support-application-add-or-update .update-application").hide();
        $("#edgex-support-application-add-or-update .add-application").show();
        $("#edgex-support-application-add-or-update").show();
        $("#edgex-support-application-add-or-update form input[name= 'NodeId']").val(nodeid);
        }
    //提交新建功能
    SupportApplication.prototype.commitApplicationBtn = function (type) {
        var applicationData = {
            id: $("#edgex-support-application-add-or-update form input[name='AppId']").val(),
            nodeid: $("#edgex-support-application-add-or-update form input[name= 'NodeId']").val(),
            name: $("#edgex-support-application-add-or-update form input[name= 'AppName']").val(),
            desc: $("#edgex-support-application-add-or-update form input[name= 'AppDesc']").val(),
        };
        //debugger
        commitApplication(applicationData,type);
        application.cancelAddApplicationBtn()
    }
    //上传新建或更新的Application功能
    function commitApplication(applicationData, type) {
        var methond
        if(type=="new"){
            methond = 'POST'
        }else{
            methond = "PUT"
        }
            $.ajax({
                url: '/api/v1/application',
                type: methond,
                data: JSON.stringify(applicationData),
                success: function(){
                    application.loadApplicationList(applicationData.nodeid);
                    bootbox.alert({
                        message: "Add Application Success!",
                        className: 'red-green-buttons'
                    });
                },
                statusCode: {
                    400: function(err){
                        bootbox.alert({
                            title:'Error',
                            message: "malformed or unparsable requests ! " + err.responseText,
                            className: 'red-green-buttons'
                        });
                    },
                    409: function(){
                        bootbox.alert({
                            title:'Error',
                            message: "the start, end, or frequency strings are not properly formatted !",
                            className: 'red-green-buttons'
                        });
                    },
                    500: function(){
                        bootbox.alert({
                            message: "unknown or unanticipated issues !",
                            className: 'red-green-buttons'
                        });
                    }
                }
            });
        }
    //关闭新建Application页面
    SupportApplication.prototype.cancelAddApplicationBtn = function () {
        $("#edgex-support-application-add-or-update").hide();
        var nodeid = $("#edgex-support-application-add-or-update form input[name= 'NodeId']").val();
        $("#edgex-support-application-add-or-update input").val("");
        application.loadApplicationList(nodeid)
    }
    //初始化编辑Application页面
    SupportApplication.prototype.editApplicationBtn = function (application) {
        var applicationItem = JSON.parse(application);
        //debugger
        $("#edgex-support-application-add-or-update form input[name='AppId']").val(applicationItem.id);
        $("#edgex-support-application-add-or-update form input[name='NodeId']").val(applicationItem.nodeid);
        $("#edgex-support-application-add-or-update form input[name='AppName']").val(applicationItem.name);
        $("#edgex-support-application-add-or-update form input[name='AppDesc']").val(applicationItem.desc);

        $("#edgex-support-application-add-or-update .update-application").show();
        $("#edgex-support-application-add-or-update .add-application").hide();
        $("#edgex-support-application-add-or-update").show();
        }
    //删除application
    SupportApplication.prototype.deleteApplicationBtn = function (application) {
        var app = JSON.parse(application)
        bootbox.confirm({
            title: "confirm",
            message: "Are you sure to delete ? ",
            className: 'green-red-buttons',
            callback: function (result) {
                if (result){
                    $.ajax({
                        url: '/api/v1/application/' + app.id,
                        type: 'DELETE',
                        success: function(){
                            refresh(app.nodeid);
                            bootbox.alert({
                                message: "delete success.",
                                className: 'red-green-buttons'
                            });
                         },
                        statusCode: {
                            503: function(){
                                bootbox.alert({
                                    title:'Error',
                                    message: "unknown or unanticipated issues",
                                    className: 'red-green-buttons'
                                });
                            }
                        }
                    });
                }
            }
        });
    }
    function refresh(nodeid){
        application.loadApplicationList(nodeid)
    }
    //执行APP
    SupportApplication.prototype.execApp = function(AppInfo){
        var app = JSON.parse(AppInfo);
        $.ajax({
            url: '/api/v1/application/exec/' + app.id,
            type: 'GET',
            success: function () {
                application.loadApplicationList(app.nodeid);
            },
        });
    }
    //===================App section end===================================

    //===================Task section begin============================
    //隐藏Task列表
    SupportApplication.prototype.hideTaskList = function(){
        $("#edgex-support-task-list-main").hide();
    }
    //初始化Task列表
    SupportApplication.prototype.loadTaskList = function (appid) {
        $("#edgex-support-appid").html(appid);
        $("#edgex-support-task-list-main").show('fast');
        $.ajax({
            url:'/api/v1/task/'+appid,
            type:'GET',
            success:function(data){
                if(!data || data.length == 0){
                    $("#edgex-support-task-list table tbody").empty();
                    $("#edgex-support-task-list table tfoot").show();
                    return
                }else{
                    $("#edgex-support-task-list table tfoot").hide();

                }
                application.taskListCache = data;
                application.renderTaskList(data);
            },
            error:function(){

            }
        });

    }
    //刷新Task列表
    SupportApplication.prototype.renderTaskList = function(data){
        $("#edgex-support-task-list table tbody").empty();
        $.each(data,function(i,v){
            var rowData = "<tr>";
            rowData += "<td>" + (i + 1) +"</td>";
            rowData += "<td>" +  v.id + "</td>";
            rowData += "<td>" +  v.name + "</td>";
            rowData += "<td>" +  v.desc + "</td>";
            rowData += "<td>" +  v.cpu_request + "</td>";
            rowData += "<td>" +  v.memory_request + "</td>";
            rowData += "<td>" +  v.disk_request + "</td>";
            rowData += "<td>" +  v.exec_limit + "</td>";
            rowData += "<td>" +  v.exec_state + "</td>";
            rowData += '<td class="task-delete-icon del_task"><input type="hidden" value="'+v.id+'"><div class="edgexIconBtn"><i class="fa fa-trash-o fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += '<td class="task-edit-icon edit_task"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-edit fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += '<td class="task-detail-icon task_detail"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-eye fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += "</tr>";
            $("#edgex-support-task-list table tbody").append(rowData);
            $("#edgex-support-appid").html(v.appid);
        });
        //delete
        $(".del_task").on('click',function(){
            application.deleteTaskBtn($(this).children("input[type='hidden']").val());
        });
        //edit
        $(".edit_task").on('click',function(){
            application.editTaskBtn($(this).children("input[type='hidden']").val());
        });
        //show detail
        $(".task_detail").on('click',function(){
            application.detailTaskBtn($(this).children("input[type='hidden']").val());
        });
    }
    //删除某个Task的按钮功能
    SupportApplication.prototype.deleteTaskBtn = function(taskId){

        var appid = $("#edgex-support-appid").html();
        bootbox.confirm({
            title: "confirm",
            message: "Are you sure to delete ? ",
            className: 'green-red-buttons',
            callback: function (result) {
                if(result){
                    $.ajax({
                        url: '/api/v1/task/' + taskId,
                        type: 'DELETE',
                        success: function(){
                            application.loadTaskList(appid);
                            bootbox.alert({
                                message: "delete success.",
                                className: 'red-green-buttons'
                            });
                        },
                        statusCode: {
                            409: function(){
                                bootbox.alert({
                                    title:'Error',
                                    message: "attempt to delete a task still being referenced by device reports",
                                    className: 'red-green-buttons'
                                });
                            }
                        }
                    });
                }
            }
        });
    }
    //编辑Task按钮的功能
    SupportApplication.prototype.editTaskBtn = function(taskStr){
        var task = JSON.parse(taskStr);
        if(task.exec_state!="NOT EXECUTED"){
            bootbox.alert({
                title:'Error',
                message: "该状态下不可编辑！",
                className: 'red-green-buttons'
            });
            return
        }
        //填空
        $("#edgex-support-task-add-basicinfo-appid").val(task.appid);
        $("#edgex-support-task-add-basicinfo-taskid").val(task.id);
        $("#edgex-support-task-add-basicinfo-exec_state").val(task.exec_state);
        $("#edgex-support-task-add-basicinfo-name").val(task.name);
        $("#edgex-support-task-add-basicinfo-desc").val(task.desc);
        $("#edgex-support-task-add-basicinfo-time_limit_num").val(task.time_limit.split(/([0-9]*)/)[1]);
        $("#edgex-support-task-add-basicinfo-time_limit_unit").val(task.time_limit.split(/([0-9]*)/)[2]);
        $("#edgex-support-task-add-basicinfo-host_name").val(task.host_name);
        $("#edgex-support-task-add-basicinfo-host_port").val(task.host_port);
        $("#edgex-support-task-add-basicinfo-cpu_request").val(task.cpu_request);
        $("#edgex-support-task-add-basicinfo-memory_request").val(task.memory_request);
        $("#edgex-support-task-add-basicinfo-disk_request").val(task.disk_request);
        $("#edgex-support-task-add-basicinfo-kind").val(task.kind);
        $("#edgex-support-task-add-basicinfo-exec_limit").val(task.exec_limit);
        var task_label_list = {}, toleration_list={}, image_need_list={};
        $.each(task.task_labels, function (index,TaskLabel) {
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
        application.makeAttributeTable("#edgex-support-task-add-task_labels table[name= Task_Labels_List]", task_label_list, 12);
        $.each(task.tolerations, function (index,Toleration) {
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
        application.makeAttributeTable("#edgex-support-task-add-tolerations table[name= Toleration_List]", toleration_list, 12);
        $.each(task.image_need, function (index,Image) {
            var random = Math.random();
            var Image = '<input type="text" class="form-control" disabled value='+Image+' >';
            var Image_del_bth = '<div class="edgexIconBtn delImage" random='+random+'>' + '<i class="fa fa-minus-circle fa-lg" aria-hidden="true"/>' + '</div>';
            var Image_need_form_element = new Array()
            Image_need_form_element.push(Image);
            Image_need_form_element.push(Image_del_bth);
            image_need_list[random] = Image_need_form_element;
        });
        application.makeAttributeTable("#edgex-support-task-add-image_need table[name= Image_Need_List]", image_need_list, 12);

        Init_Task_Label_Add_Btn(task_label_list);
        Init_Task_Tolerations_Add_Btn(toleration_list);
        Init_Task_ImageNeed_Add_Btn(image_need_list);

        //页面控制
        $("#edgex-support-task-list-main").hide();
        $("#edgex-support-task-add").show();
        $("#edgex-support-task-add div.add-task").hide();
        $("#edgex-support-task-add div.update-task").show();
    }
    //查看Task详细信息按钮的功能
    SupportApplication.prototype.detailTaskBtn = function(taskStr){
        $("#edgex-support-task-list-main").hide();
        $("#edgex-support-task-detail").show();
        var task = JSON.parse(taskStr);
        var task_keys = Object.keys(task);
        $.each(task_keys,function (index,key) {
            if (key != "tolerations" && key != "image_need" && key != "task_labels"){
                var span = "#edgex-support-task-detail-taskInfo span[name=" + key + "]"
                $(span).html(task[key])
            }
        });
        application.showAttributeDetailList("#edgex-support-node-detail-task-labels table", JSON.stringify(task.task_labels));
        application.showAttributeDetailList("#edgex-support-node-detail-tolerations table", JSON.stringify(task.tolerations));
        var image_need_element = new Array();
        $.each(task.image_need, function (index,image_need) {
            var Image_need_InputElementList = new Array();
            var Image_need_InputElement = '<input type="text" class="form-control" disabled style="width: 80%" value="'+image_need+'"/>';
            Image_need_InputElementList.push(Image_need_InputElement)
            image_need_element.push(Image_need_InputElementList)
        });
        application.makeAttributeTable("#edgex-support-node-detail-image_need table", image_need_element,8);
        $("#cancel_task_detail").off('click').on('click', function () {
            application.cancelTaskDetailBtn();
        });
    }
    //关闭Task详细信息页面功能
    SupportApplication.prototype.cancelTaskDetailBtn = function(){
        $("#edgex-support-task-list-main").show('fast');
        $("#edgex-support-task-detail").hide();
        $("#edgex-support-task-detail-taskInfo span").html("");
        $("#edgex-support-task-detail-taskInfo table").clear();
    }
    //提交Task
    SupportApplication.prototype.commitTaskBtn = function(type){
        //task
        var task = {
            appid: $("#edgex-support-task-add-basicinfo-appid").val().trim(),
            id: $("#edgex-support-task-add-basicinfo-taskid").val().trim(),
            exec_state: "NOT EXECUTED",
            name: $("#edgex-support-task-add-basicinfo-name").val(),
            desc: $("#edgex-support-task-add-basicinfo-desc").val(),
            time_limit: $("#edgex-support-task-add-basicinfo-time_limit_num").val() + $("#edgex-support-task-add-basicinfo-time_limit_unit").val(),
            host_name: $("#edgex-support-task-add-basicinfo-host_name").val(),
            host_port: $("#edgex-support-task-add-basicinfo-host_port").val(),
            cpu_request: Number($("#edgex-support-task-add-basicinfo-cpu_request").val()),
            memory_request: Number($("#edgex-support-task-add-basicinfo-memory_request").val()),
            disk_request: Number($("#edgex-support-task-add-basicinfo-disk_request").val()),
            kind: $("#edgex-support-task-add-basicinfo-kind").val(),
            exec_limit: $("#edgex-support-task-add-basicinfo-exec_limit").val(),
            task_labels: [],
            tolerations: [],
            image_need: [],
        };
        task.tolerations = application.getAttributeVars("#edgex-support-task-add-tolerations table[name= Toleration_List]");
        task.task_labels = application.getAttributeVars("#edgex-support-task-add-task_labels table[name= Task_Labels_List]");
        $("#edgex-support-task-add-image_need table[name= Image_Need_List]").each(function (tindex,titem){
            var image = {};
            $(titem).find("input").each(function(newimageindex,newimage){
                task.image_need.push(newimage.value);
            });
        });
        commitTask(task,type)
        application.cancelAddTaskBtn()
    }
    function commitTask(task,type){
        var method ;
        if (type=="new") {
            method = "POST"
        }else{
            method = "PUT"
        }
        $.ajax({
            url:'/api/v1/task',
            type: method,
            data:JSON.stringify(task),
            success:function(){
                var appid = task.appid;
                application.loadTaskList(appid);
                application.loadNode();
                bootbox.alert({
                    message: "Commit Task Success!",
                    className: 'red-green-buttons'
                });
            },
            statusCode: {
                400: function(err) {
                    //debugger
                    bootbox.alert({
                        title:'Error',
                        message: err.responseText,
                        className: 'red-green-buttons'
                    });
                },
                404: function() {
                    bootbox.alert({
                        title:'Error',
                        message: "the task's associated application is not found !",
                        className: 'red-green-buttons'
                    });
                },
                409: function() {
                    bootbox.alert({
                        title:'Error',
                        message: "the application was not provided or if the name is determined to not be unique with regard to others !",
                        className: 'red-green-buttons'
                    });
                },
                500: function() {
                    bootbox.alert({
                        title:'Error',
                        message: "unknown or unanticipated issues or task name is a duplicate !",
                        className: 'red-green-buttons'
                    });
                }
            }
        });
    }

    //刷新Task列表
    SupportApplication.prototype.refreshTaskListBtn = function(){
        var appid = $("#edgex-support-appid").html();
        application.loadTaskList(appid);
    }




    //===================Task section end===================================

    return application;
})();