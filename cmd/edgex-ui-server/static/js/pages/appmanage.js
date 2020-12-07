$(document).ready(function(){
    orgEdgexFoundry.supportApplication.renderApplicationList();
});
//init application object

orgEdgexFoundry.supportApplication = (function(){
    "use strict";
    function SupportApplication() {
        // this.applicationListCache = [];
        // this.selectedApplicationRow = null;
        // this.taskListCache = [];
        // this.selectedTaskRow = null;
        // this.applicationCache = [];
    }
    SupportApplication.prototype = {
        renderApplicationList: null,
        getApplicationList: null,
        addApplication: null,
        exitAddApplication: null,
        getTaskList: null,
        fillTaskList:null,
        getApplicationFromEditPage:null,
        uploadApplication:null,
        editApplication: null,
        deleteApplication: null,
        showAppDetail:null,
        execApplication:null,
        renderScheduleResultList: null,
        getScheduleResultList: null,
    }
    var application = new SupportApplication();

    //刷新应用列表
    SupportApplication.prototype.renderApplicationList = function () {
        var applicationList = application.getApplicationList();
        $("#edgex-support-application-basic_info").show('fast');
        $("#edgex-support-application-basic_info-app_list tbody").empty();
        $.each(applicationList, function (i,v) {
            var rowData = "<tr>";
            rowData += "<td>" +  (i+1) + "</td>";
            rowData += "<td>" +  v.id + "</td>";
            rowData += "<td>" +  v.name + "</td>";
            rowData += "<td>" +  v.type + "</td>";
            rowData += "<td>" +  v.desc + "</td>";
            rowData += '<td class="scheduler-edit-icon edit_application"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-edit fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += '<td class="scheduler-del-icon del_application"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-trash-o fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += '<td class="scheduler-detail-icon application_detail"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-eye fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += '<td class="scheduler-apps-icon exec_application"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-play-circle-o fa-lg"/></div></td>';
            rowData += "</tr>";
            $("#edgex-support-application-basic_info-app_list tbody").append(rowData);
        })
        $("#edgex-support-application-basic_info-refresh_application").off('click').on('click', function () {
            application.renderApplicationList()
        })
        $("#edgex-support-application-basic_info-add_application").off('click').on('click', function () {
            application.addApplication()
        })
        $(".edit_application").off('click').on('click', function () {
            application.editApplication($(this).children("input[type='hidden']").val())
        })
        $(".del_application").off('click').on('click', function () {
            application.deleteApplication($(this).children("input[type='hidden']").val())
        })
        $(".application_detail").off('click').on('click', function () {
            application.showAppDetail($(this).children("input[type='hidden']").val())
        })
        $(".exec_application").off('click').on('click', function () {
            application.execApplication($(this).children("input[type='hidden']").val())
        })

    }

    //Ajax获取应用列表
    SupportApplication.prototype.getApplicationList = function () {
        var applicationdata = null;
        $.ajax({
            url:'/export-receiver/api/v1/application',
            type:'GET',
            async:false,
            success:function (data) {
                applicationdata = data
            }
        });
        return applicationdata
    }

    //新建应用
    SupportApplication.prototype.addApplication = function () {
        $("#edgex-support-application-basic_info").hide();
        $("#edgex-support-application-add_or_update").show('fast');
        var taskList = application.getTaskList(null);
        application.fillTaskList(taskList);
        $(".add-application").off('click').on('click', function () {
            application.uploadApplication(true)
        })
    }

    //编辑应用
    SupportApplication.prototype.editApplication = function (appInfo) {
        var app = JSON.parse(appInfo)
        $("#edgex-support-application-basic_info").hide();
        $("#edgex-support-application-add_or_update").show('fast');
        $("#edgex-support-application-add_or_update-app_id").val(app.id)
        $("#edgex-support-application-add_or_update-app_name").val(app.name)
        $("#edgex-support-application-add_or_update-app_desc").val(app.desc)
        $("#edgex-support-application-add_or_update-app_type").val(app.type)
        $("#edgex-support-application-add_or_update-app_frequency").val(app.frequency)
        var taskList = application.getTaskList(app);
        application.fillTaskList(taskList);
        $(".add-application").off('click').on('click', function () {
            application.uploadApplication(false)
        })
    }

    //应用列表Select区相关功能
    SupportApplication.prototype.fillTaskList = function(taskList) {
        $("#edgex-support-application-add_or_update-app_tasks_add_select").find('option').remove();
        $("#edgex-support-application-add_or_update-app_tasks").empty();
        $.each(taskList, function (devicename, device) {
            $.each(device.tasks, function (taskname,task) {
                if (task.used == false){
                    var commandstr = devicename + "-" + task.command.name + "-get";
                    var optionelement = '<option value=\''+JSON.stringify(task)+'\' devicename=\''+device.device_name+'\' deviceid="+device.device_id+">' + commandstr + '</option>'
                    $("#edgex-support-application-add_or_update-app_tasks_add_select").append(optionelement)
                }else {
                    var taskelement = '<tr>'
                    taskelement += '<td>' + '<b>' + '任务名称' + '</b>' + '</td>'
                    taskelement += '<td>' + '<input value='+task.name+' class="form-control"/>' + '</td>'
                    taskelement += '<td>' + '<b>' + '对应设备命令' + '</b>' + '</td>'
                    var commandstr = devicename + "-" + task.command.name + "-get";
                    taskelement += '<td>' + '<input disabled devicename='+device.device_name+' deviceid='+device.device_id+' task=\''+JSON.stringify(task)+'\' value='+commandstr+' class="form-control"/>' + '</td>'
                    taskelement += '<td>' + '<div class="edgexIconBtn remove-task" devicename='+device.device_name+' deviceid='+device.device_id+' task=\''+JSON.stringify(task)+'\' style="float:left;margin-top:7px;"><i class="fa fa-minus-circle fa-lg" aria-hidden="true"/></div>'
                    taskelement += "</tr>"
                    $("#edgex-support-application-add_or_update-app_tasks").append(taskelement)
                }
            })
        })
        $("#edgex-support-application-add_or_update-app_tasks_add_btn").off('click').on('click', function () {
            var devicename = $("#edgex-support-application-add_or_update-app_tasks_add_select").find("option:selected").attr("devicename");
            var task = JSON.parse($("#edgex-support-application-add_or_update-app_tasks_add_select").find("option:selected").val());
            taskList[devicename].tasks[task.command.name].used = true;
            application.fillTaskList(taskList)
        })
        $(".remove-task").off('click').on('click', function () {
            var devicename = this.getAttribute("devicename");
            var task = JSON.parse(this.getAttribute("task"));
            taskList[devicename].tasks[task.command.name].used = false;
            application.fillTaskList(taskList)
        })
    }

    //关闭新建应用页
    SupportApplication.prototype.exitAddApplication = function () {
        $("#edgex-support-application-add_or_update-app_tasks").empty();
        $("#edgex-support-application-add_or_update input").val("");
        $("#edgex-support-application-add_or_update").hide();
        application.renderApplicationList()
    }

    //获取某个应用已定义为任务的设备命令和未定义为任务的设备命令
    SupportApplication.prototype.getTaskList = function (application) {
        var taskList = {}, app=JSON.parse(JSON.stringify(application));
        if (app == null){
            app = {"devicetasks":{}};
        }
        $.ajax({
            url:'/export-receiver/api/v1/device',
            type:'GET',
            async:false,
            success:function (data) {
                $.each(data, function (idex,device) {
                    if (app.devicetasks[device.name] == null){
                        app.devicetasks[device.name] = {"device_name":device.name, "device_id":device.id, "tasks":{}}
                    }
                    taskList[device.name]={"device_name":device.name, "device_id":device.id, "tasks":{}};
                    $.each(device.getcommands, function (i,v) {
                        taskList[device.name].tasks[v.name] = {
                            command: v,
                            used: app.devicetasks[device.name].tasks[v.name] != null
                        }
                        if (app.devicetasks[device.name].tasks[v.name] != null) {
                            taskList[device.name].tasks[v.name].name = app.devicetasks[device.name].tasks[v.name].name
                        }else {
                            taskList[device.name].tasks[v.name].name = v.name
                        }
                    })
                })
            }
        });
        return taskList
    }

    //从新建应用页获取到应用
    SupportApplication.prototype.getApplicationFromEditPage = function () {
        var app = {};
        app.id = $("#edgex-support-application-add_or_update-app_id").val();
        app.name = $("#edgex-support-application-add_or_update-app_name").val();
        app.desc = $("#edgex-support-application-add_or_update-app_desc").val();
        app.type = $("#edgex-support-application-add_or_update-app_type").val();
        app.frequency = Number($("#edgex-support-application-add_or_update-app_frequency").val());
        app.devicetasks = {};
        $("#edgex-support-application-add_or_update-app_tasks tr").each(function (tindex, telement) {
            var nameinput = $(telement).find("td:eq(1) input");
            var name = nameinput.val();
            var taskinput = $(telement).find("td:eq(3) input");
            var devicename = taskinput.attr("devicename"), deviceid = taskinput.attr("deviceid"), task = JSON.parse(taskinput.attr("task"));
            if (app.devicetasks[devicename]==null){
                app.devicetasks[devicename] = {"device_name":devicename, "device_id":deviceid, "tasks":{}}
            }
            app.devicetasks[devicename].tasks[task.command.name] = {"name":name, "command":task.command}
        })
        return app;
    }

    //Ajax上传应用
    SupportApplication.prototype.uploadApplication = function (add) {
        var type = "PUT"
        if (add == true){
            type = "POST"
        }
        var app = application.getApplicationFromEditPage()
        $.ajax({
            url: '/export-receiver/api/v1/application',
            type:type,
            data:JSON.stringify(app),
            contentType:'application/json',
            async : false,
            dataType : 'text',
            success:function(data){
                application.renderApplicationList()
                $("#edgex-support-application-add_or_update").hide();
            },
            error:function(){
                alert("ERROR! 上传任务信息失败")

            }
        });
    }

    //删除应用
    SupportApplication.prototype.deleteApplication = function (appInfo) {
        var app = JSON.parse(appInfo);
        $.ajax({
            url: '/export-receiver/api/v1/application/' + app.id,
            type: "DELETE",
            contentType:'application/json',
            async : false,
            dataType : 'text',
            success:function(data){
                alert("删除Application" + app.name + "成功！");
                application.renderApplicationList();
            },
            error:function(){
            }
        });
    }

    //查看应用详细信息
    SupportApplication.prototype.showAppDetail = function (appInfo) {
        var app = JSON.parse(appInfo);
        $("#edgex-support-application-detail-name").html(app.name)
        $("#applicationedgex-support-application-detail-basic_info input").val("");
        $("#applicationedgex-support-application-detail-app_tasks tbody").empty();
        $("#edgex-support-application-detail").show('fast');
        $("#applicationedgex-support-application-detail-app_id").val(app.id);
        $("#applicationedgex-support-application-detail-app_name").val(app.name);
        $("#applicationedgex-support-application-detail-app_desc").val(app.desc);
        $("#applicationedgex-support-application-detail-app_type").val(app.type);
        $("#applicationedgex-support-application-detail-app_frequency").val(app.frequency);
        var taskSum = 0;
        $.each(app.devicetasks, function (devicename,device) {
            $.each(device.tasks, function (index, task) {
                taskSum ++;
                var command = task.command;
                var rowData = "<tr>";
                rowData += "<td>" +  taskSum + "</td>";
                rowData += "<td>" +  task.name + "</td>";
                rowData += "<td>" +  device.device_name + "</td>";
                rowData += "<td>" +  command.name + "</td>";
                rowData += "<td>" +  command.cpu + "</td>";
                rowData += "<td>" +  command.memory + "</td>";
                rowData += "<td>" +  command.disk + "</td>";
                rowData += "<td>" +  command.size + "</td>";
                rowData += "<td>" +  command.energy_limit + "</td>";
                rowData += "<td>" +  command.exec_limit + "</td>";
                rowData += "</tr>";
                $("#applicationedgex-support-application-detail-app_tasks tbody").append(rowData);
            })
        })
        $("#edgex-support-application-detail-close").off('click').on('click', function () {
            $("#edgex-support-application-detail").hide();
            application.renderApplicationList()
        })
    }

    //执行应用
    SupportApplication.prototype.execApplication = function(appInfo){
        $.ajax({
            url:'/export-receiver/api/v1/push',
            type:'POST',
            data:appInfo,
            success:function (data) {

            }
        });
    }

    //查看调度结果
    SupportApplication.prototype.renderScheduleResultList = function () {

    }

    //Ajax获取调度结果
    SupportApplication.prototype.renderScheduleResultList = function (scheduleresult) {
        $.ajax({
            url:'/export-receiver/api/v1/scheduleresult',
            type:'GET',
            success:function (data) {
                scheduleresult = data
            }
        });
    }

    return application;
})();