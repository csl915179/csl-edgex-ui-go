$(document).ready(function(){
    orgEdgexFoundry.supportApplication.renderApplicationList();
    orgEdgexFoundry.supportApplication.renderScheduleResultList();
    orgEdgexFoundry.supportApplication.renderExecuteEventList()
});

// function wsTest(){
//     var gateway = "";
//     $.ajax({
//         url: '/api/v1/gateway/currentgateway',
//         contentType:'application/json',
//         async : false,
//         success:function(data){
//             gateway = data.gateway;
//         },
//     });
//     alert(gateway);
//     var sock = null;
//     var wsuri = "ws://121.40.165.18:8800";
//     sock = new WebSocket(wsuri);
//     sock.onopen = function() {
//         //成功连接到服务器
//         console.log("connected to " + wsuri);
//         sock.send("CSL")
//     }
//     sock.onclose = function(e) {
//         console.log("connection closed (" + e.code + ")");
//     }
//         //收到信息的动作
//     sock.onmessage = function(e) {
//         //服务器发送通知
//         //开始处理
//         console.log("message received: " + e.data);
//     };
// }

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
        divideScheduleresultTable: null,
        getScheduledTaskList: null,
        renderEventList:null,
        divideEventTable: null,
        getEventList:null,
        divideEventToExecuteTable: null,
        getEventToExecuteList:null,
        divideEventExecutedTable: null,
        getEventExecutedList:null,
        showEventTaskList:null,
        showExecutedEventTaskList: null,
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
            if (v.auto_event_state == true){
                rowData += '<td class="scheduler-apps-icon application_autoevent"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-unlock fa-lg"/></div></td>';
            }else {
                rowData += '<td class="scheduler-apps-icon application_autoevent"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-lock fa-lg"/></div></td>';
            }
            rowData += '<td class="scheduler-apps-icon exec_application"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-play-circle-o fa-lg"/></div></td>';
            rowData += "</tr>";
            $("#edgex-support-application-basic_info-app_list tbody").append(rowData);
        });
        $("#edgex-support-application-basic_info-refresh_application").off('click').on('click', function () {
            application.renderApplicationList()
        });
        $("#edgex-support-application-basic_info-add_application").off('click').on('click', function () {
            application.addApplication()
        });
        $(".edit_application").off('click').on('click', function () {
            application.editApplication($(this).children("input[type='hidden']").val())
        });
        $(".del_application").off('click').on('click', function () {
            application.deleteApplication($(this).children("input[type='hidden']").val())
        });
        $(".application_detail").off('click').on('click', function () {
            application.showAppDetail($(this).children("input[type='hidden']").val())
        });
        $(".application_autoevent").off('click').on('click', function () {
            var app = JSON.parse($(this).children("input[type='hidden']").val());
            app.auto_event_state = (!app.auto_event_state);
            application.uploadApplication(false, JSON.stringify(app));
            application.renderApplicationList();
        });
        $(".exec_application").off('click').on('click', function () {
            application.execApplication($(this).children("input[type='hidden']").val())
        });

    };

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
    };

    //新建应用
    SupportApplication.prototype.addApplication = function () {
        $("#edgex-support-application-basic_info").hide();
        $("#edgex-support-application-add_or_update").show('fast');
        var taskList = application.getTaskList(null);
        application.fillTaskList(taskList);
        $(".add-application").off('click').on('click', function () {
            var appInfo = JSON.stringify(application.getApplicationFromEditPage());
            application.uploadApplication(true, appInfo);
        })
    };

    //编辑应用
    SupportApplication.prototype.editApplication = function (appInfo) {
        var app = JSON.parse(appInfo)
        $("#edgex-support-application-basic_info").hide();
        $("#edgex-support-application-add_or_update").show('fast');
        $("#edgex-support-application-add_or_update-app_id").val(app.id);
        $("#edgex-support-application-add_or_update-app_name").val(app.name);
        $("#edgex-support-application-add_or_update-app_desc").val(app.desc);
        $("#edgex-support-application-add_or_update-app_type").val(app.type);
        $("#edgex-support-application-add_or_update-app_auto_event_state").val(String(app.auto_event_state));
        $("#edgex-support-application-add_or_update-app_frequency").val(app.frequency);
        var taskList = application.getTaskList(app);
        application.fillTaskList(taskList);
        $(".add-application").off('click').on('click', function () {
            var appInfo = JSON.stringify(application.getApplicationFromEditPage());
            application.uploadApplication(false, appInfo);
        })
    };

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
    };

    //关闭新建应用页
    SupportApplication.prototype.exitAddApplication = function () {
        $("#edgex-support-application-add_or_update-app_tasks").empty();
        $("#edgex-support-application-add_or_update input").val("");
        $("#edgex-support-application-add_or_update").hide();
        application.renderApplicationList()
    };

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
    };

    //从新建应用页获取到应用
    SupportApplication.prototype.getApplicationFromEditPage = function () {
        var app = {};
        app.id = $("#edgex-support-application-add_or_update-app_id").val();
        app.name = $("#edgex-support-application-add_or_update-app_name").val();
        app.desc = $("#edgex-support-application-add_or_update-app_desc").val();
        app.type = $("#edgex-support-application-add_or_update-app_type").val();
        app.auto_event_state = ($("#edgex-support-application-add_or_update-app_auto_event_state").val() == "true");
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
        });
        return app;
    };

    //Ajax上传应用
    SupportApplication.prototype.uploadApplication = function (add,appInfo) {
        var type = "PUT";
        if (add == true){
            type = "POST"
        }
        var app = JSON.parse(appInfo);
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
    };

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
    };

    //查看应用详细信息
    SupportApplication.prototype.showAppDetail = function (appInfo) {
        var app = JSON.parse(appInfo);
        $("#edgex-support-application-basic_info").hide();
        $("#edgex-support-application-detail-name").html(app.name)
        $("#applicationedgex-support-application-detail-basic_info input").val("");
        $("#applicationedgex-support-application-detail-app_tasks tbody").empty();
        $("#edgex-support-application-detail").show('fast');
        $("#applicationedgex-support-application-detail-app_id").val(app.id);
        $("#applicationedgex-support-application-detail-app_name").val(app.name);
        $("#applicationedgex-support-application-detail-app_desc").val(app.desc);
        $("#applicationedgex-support-application-detail-app_type").val(app.type);
        $("#applicationedgex-support-application-detail-app_auto_event_state").val(app.auto_event_state);
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
    };

    //执行应用
    SupportApplication.prototype.execApplication = function(appInfo){
        $.ajax({
            url:'/export-receiver/api/v1/push',
            type:'POST',
            data:appInfo,
            success:function (data) {

            }
        });
    };

    //查看调度结果
    SupportApplication.prototype.renderScheduleResultList = function () {
        application.divideScheduleresultTable(0);
        $("#edgex-support-scheduleresult-refresh_scheduleresult").off('click').on('click', function () {
            application.renderScheduleResultList()
        })
    };

    //调度结果分页展示
    SupportApplication.prototype.divideScheduleresultTable = function(start){
        if (start<=0){
            start = 0;
        }
        var scheduleresult = application.getScheduleResultList(start, start+5);
        if (scheduleresult.length == 0){
            return;
        }
        var table = $('#edgex-support-scheduleresult table tbody');
        table.empty();
        $.each(scheduleresult, function (appIndex, appElement) {
            var row = '<tr>';
            var index = parseInt(start) +1 + appIndex
            row += '<td>' + index + '</td>';
            row += '<td>' + appElement.id + '</td>';
            row += '<td>' + appElement.name + '</td>';
            row += '<td>' + appElement.shceduled_time + '</td>';
            row += '<td class="scheduler-detail-icon application-task_detail"><input type="hidden" value=\''+JSON.stringify(appElement.tasks)+'\'><div class="edgexIconBtn"><i class="fa fa-eye fa-lg" aria-hidden="true"></i> </div></td>';
            row += '</tr>';
            table.append(row)
        })
        $('#edgex-support-scheduleresult-scheduleresult_paging a[name="Pagenumber"]').html((start/5)+1);
        $('#edgex-support-scheduleresult-scheduleresult_paging a[name="Next"]').off('click').on('click', function () {
            application.divideScheduleresultTable(start+5);
        });
        $('#edgex-support-scheduleresult-scheduleresult_paging a[name="Previous"]').off('click').on('click', function () {
            application.divideScheduleresultTable(start-5);
        });
        $('.application-task_detail').off('click').on('click', function () {
            var taskList = $(this).children("input[type='hidden']").val();
            application.getScheduledTaskList(taskList);
        })
    };

    //Ajax获取某几条调度结果
    SupportApplication.prototype.getScheduleResultList = function (low,high) {
        var result = {}
        $.ajax({
            url:'/export-receiver/api/v1/scheduleresult/' + low + "/" + high,
            type:'GET',
            async:false,
            success:function (data) {
                result = data
            }
        });
        return result
    };

    //获取应用对应的任务列表
    SupportApplication.prototype.getScheduledTaskList = function(taskListInfo){
        var taskList = JSON.parse(taskListInfo);
        $("#edgex-support-scheduleresult-app_detail").show('fast');
        $("#edgex-support-scheduleresult-app_detail table tbody").empty();
        $.each(taskList, function (index, task) {
            var row = '<tr>';
            row += '<td>' + (index + 1) + '</td>';
            row += '<td>' + task.name + '</td>';
            row += '<td>' + task.dst_addr+ '</td>';
            row += '<td>' + task.exec_time + '</td>';
            row += '<td>' + task.exec_energy+ '</td>';
            row += '</tr>';
            $("#edgex-support-scheduleresult-app_detail table tbody").append(row)
        })
        $("#edgex-support-scheduleresult-app_detail-close").off('click').on('click', function () {
            $("#edgex-support-scheduleresult-app_detail").hide();
            $("#edgex-support-scheduleresult-app_detail table tbody").empty();
        })
    };

    //刷新任务执行情况表
    SupportApplication.prototype.renderExecuteEventList = function(){
        application.divideEventTable(0);
        application.divideEventToExecuteTable(0);
        application.divideEventExecutedTable(0);
        $("#edgex-support-event-refresh").off('click').on('click', function () {
            application.renderExecuteEventList();
        })
    };

    //获取等待调度的Event列表
    SupportApplication.prototype.divideEventTable = function (start) {
        if (start<=0){
            start = 0;
        }
        var event = application.getEventList(start, start+5);
        if (event.length == 0){
            return;
        }
        var table = $('#edgex-support-event fieldset table[name=event_not_scheduled] tbody');
        table.empty();
        $.each(event, function (eventIndex, eventElement) {
            var row = '<tr>';
            var index = parseInt(start) +1 + eventIndex
            row += '<td>' + index + '</td>';
            row += '<td>' + eventElement.id + '</td>';
            row += '<td>' + eventElement.name + '</td>';
            row += '<td>' + eventElement.modified + '</td>';
            row += '<td>' + eventElement.desc + '</td>';
            row += '<td class="scheduler-detail-icon event-task_detail"><input type="hidden" value=\''+JSON.stringify(eventElement.devices)+'\'><div class="edgexIconBtn"><i class="fa fa-eye fa-lg" aria-hidden="true"></i> </div></td>';
            row += '</tr>';
            table.append(row)
        })
        $('#edgex-support-event-event_paging a[name="Pagenumber"]').html((start/5)+1);
        $('#edgex-support-event-event_paging a[name="Next"]').off('click').on('click', function () {
            application.divideEventTable(start+5);
        });
        $('#edgex-support-event-event_paging a[name="Previous"]').off('click').on('click', function () {
            application.divideEventTable(start-5);
        });
        //查看任务列表按键功能
        $('.event-task_detail').off('click').on('click', function () {
            var deviceList = $(this).children("input[type='hidden']").val();
            $("#edgex-support-event-app_tasks").show('fast');
            var deviceList = $(this).children("input[type='hidden']").val();
            var table = $("#edgex-support-event-app_tasks table tbody");
            application.showEventTaskList(table, deviceList)
            $("#edgex-support-event-app_tasks button").off('click').on('click', function () {
                table.empty();
                $("#edgex-support-event-app_tasks").hide();
            })
        })
    };

    //Ajax获取某几条等待调度的event
    SupportApplication.prototype.getEventList = function (low,high) {
        var result = {}
        $.ajax({
            url:'/export-receiver/api/v1/event/event/' + low + "/" + high,
            type:'GET',
            async:false,
            success:function (data) {
                result = data
            }
        });
        return result
    };

    //获取调度后等待执行的Event列表
    SupportApplication.prototype.divideEventToExecuteTable = function (start) {
        if (start<=0){
            start = 0;
        }
        var event = application.getEventToExecuteList(start, start+5);
        if (event.length == 0){
            return;
        }
        var table = $('#edgex-support-event fieldset table[name=event_to_execute] tbody');
        table.empty();
        $.each(event, function (eventIndex, eventElement) {
            var row = '<tr>';
            var index = parseInt(start) +1 + eventIndex
            row += '<td>' + index + '</td>';
            row += '<td>' + eventElement.id + '</td>';
            row += '<td>' + eventElement.name + '</td>';
            row += '<td>' + eventElement.modified + '</td>';
            row += '<td>' + eventElement.desc + '</td>';
            row += '<td class="scheduler-detail-icon eventtoexecute-task_detail"><input type="hidden" value=\''+JSON.stringify(eventElement.devices)+'\'><div class="edgexIconBtn"><i class="fa fa-eye fa-lg" aria-hidden="true"></i> </div></td>';
            row += '</tr>';
            table.append(row)
        })
        $('#edgex-support-eventtoexecute-eventtoexecute_paging a[name="Pagenumber"]').html((start/5)+1);
        $('#edgex-support-eventtoexecute-eventtoexecute_paging a[name="Next"]').off('click').on('click', function () {
            application.divideEventToExecuteTable(start+5);
        });
        $('#edgex-support-eventtoexecute-eventtoexecute_paging a[name="Previous"]').off('click').on('click', function () {
            application.divideEventToExecuteTable(start-5);
        });
        //查看任务列表按键功能
        $('.eventtoexecute-task_detail').off('click').on('click', function () {
            var deviceList = $(this).children("input[type='hidden']").val();
            $("#edgex-support-eventtoexecute-app_tasks").show('fast');
            var deviceList = $(this).children("input[type='hidden']").val();
            var table = $("#edgex-support-eventtoexecute-app_tasks table tbody");
            application.showEventTaskList(table, deviceList)
            $("#edgex-support-eventtoexecute-app_tasks button").off('click').on('click', function () {
                table.empty();
                $("#edgex-support-eventtoexecute-app_tasks").hide();
            })
        })
    };

    //Ajax获取某几条调度后等待执行的event
    SupportApplication.prototype.getEventToExecuteList = function (low,high) {
        var result = {}
        $.ajax({
            url:'/export-receiver/api/v1/event/eventtoexecute/' + low + "/" + high,
            type:'GET',
            async:false,
            success:function (data) {
                result = data
            }
        });
        return result
    };

    //获取执行完成的Event列表
    SupportApplication.prototype.divideEventExecutedTable = function (start) {
        if (start<=0){
            start = 0;
        }
        var event = application.getEventExecutedList(start, start+5);
        if (event.length == 0){
            return;
        }
        var table = $('#edgex-support-event fieldset table[name=event_executed] tbody');
        table.empty();
        $.each(event, function (eventIndex, eventElement) {
            var row = '<tr>';
            var index = parseInt(start) +1 + eventIndex
            row += '<td>' + index + '</td>';
            row += '<td>' + eventElement.id + '</td>';
            row += '<td>' + eventElement.name + '</td>';
            row += '<td>' + eventElement.modified + '</td>';
            row += '<td>' + eventElement.desc + '</td>';
            row += '<td class="scheduler-detail-icon eventexecuted-task_detail"><input type="hidden" value=\''+JSON.stringify(eventElement.devices)+'\'><div class="edgexIconBtn"><i class="fa fa-eye fa-lg" aria-hidden="true"></i> </div></td>';
            row += '</tr>';
            table.append(row)
        })
        $('#edgex-support-eventexecuted-eventexecuted_paging a[name="Pagenumber"]').html((start/5)+1);
        $('#edgex-support-eventexecuted-eventexecuted_paging a[name="Next"]').off('click').on('click', function () {
            application.divideEventExecutedTable(start+5);
        });
        $('#edgex-support-eventexecuted-eventexecuted_paging a[name="Previous"]').off('click').on('click', function () {
            application.divideEventExecutedTable(start-5);
        });
        //查看任务列表按键功能
        $('.eventexecuted-task_detail').off('click').on('click', function () {
            var deviceList = $(this).children("input[type='hidden']").val();
            $("#edgex-support-eventexecuted-app_tasks").show('fast');
            var deviceList = $(this).children("input[type='hidden']").val();
            var table = $("#edgex-support-eventexecuted-app_tasks table tbody");
            application.showExecutedEventTaskList(table, deviceList)
            $("#edgex-support-eventexecuted-app_tasks button").off('click').on('click', function () {
                table.empty();
                $("#edgex-support-eventexecuted-app_tasks").hide();
            })
        })
    };

    //Ajax获取某几条执行完成的event
    SupportApplication.prototype.getEventExecutedList = function (low,high) {
        var result = {}
        $.ajax({
            url:'/export-receiver/api/v1/event/eventexecuted/' + low + "/" + high,
            type:'GET',
            async:false,
            success:function (data) {
                result = data
            }
        });
        return result
    };

    //展示还没有执行的Event对应的任务表格
    SupportApplication.prototype.showEventTaskList = function (tasktable, deviceListInfo) {
        var deviceList = JSON.parse(deviceListInfo);
        tasktable.empty();
        var index = 0;
        $.each(deviceList, function (deviceIndex, deviceElement) {
            $.each(deviceElement.tasks, function (taskIndex, taskElement) {
                index ++;
                var row = '<tr>';
                row += '<td>' + index + '</td>';
                row += '<td>' + taskElement.name + '</td>';
                row += '<td>' + deviceElement.name + '</td>';
                row += '<td>' + taskElement.cpu + '</td>';
                row += '<td>' + taskElement.memory + '</td>';
                row += '<td>' + taskElement.disk + '</td>';
                row += '<td>' + taskElement.exec_limit + '</td>';
                row += '<td>' + taskElement.time_limit + '</td>';
                row += '<td>' + taskElement.energy_limit + '</td>';
                tasktable.append(row)
            })
        })
    };

    //展示已经执行的Event对应的任务表格
    SupportApplication.prototype.showExecutedEventTaskList = function (tasktable, deviceListInfo) {
        var deviceList = JSON.parse(deviceListInfo);
        tasktable.empty();
        var index = 0;
        $.each(deviceList, function (deviceIndex, deviceElement) {
            $.each(deviceElement.tasks, function (taskIndex, taskElement) {
                index ++;
                var row = '<tr>';
                row += '<td>' + index + '</td>';
                row += '<td>' + taskElement.name + '</td>';
                row += '<td>' + deviceElement.name + '</td>';
                row += '<td>' + taskElement.exec_place + '</td>';
                row += '<td>' + taskElement.exec_time + '</td>';
                row += '<td>' + taskElement.exec_result + '</td>';
                tasktable.append(row)
            })
        })
    };

    return application;
})();