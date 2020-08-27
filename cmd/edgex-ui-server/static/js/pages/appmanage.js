$(document).ready(function(){

    orgEdgexFoundry.supportApplication.loadApplicationList();
    orgEdgexFoundry.supportApplication.loadResource();

});
//init application object

orgEdgexFoundry.supportApplication = (function(){
    "use strict";
    function SupportApplication() {
        this.applicationListCache = [];
        this.selectedApplicationRow = null;
        this.taskListCache = [];
        this.selectedTaskRow = null;
        this.resourceCache = [];
    }
    SupportApplication.prototype = {
        constructor: SupportApplication,
        loadApplicationList: null,
        renderApplicationList: null,

        hideTaskList: null,
        loadTaskList: null,
        renderTaskList: null,

        deleteApplicationBtn: null,
        addApplicationBtn: null,
        cancelAddApplicationBtn: null,
        commitApplicationBtn: null,
        editApplicationBtn: null,
        refreshApplicationListBtn: null,

        deleteTaskBtn: null,
        addTaskBtn: null,
        cancelAddTaskBtn: null,
        commitTaskBtn: null,
        editTaskBtn: null,
        refreshTaskListBtn: null,
        scheduleBtn: null,
        sendCommand: null,
        confirmSend: null,

        addResourceBtn: null,
        refreshResourceListBtn: null,
        commitResourceBtn: null,
        cancelAddResourceBtn: null,
        editResourceBtn: null,
        loadResource: null,
        renderResource: null,
    }
    var application = new SupportApplication();

    //===================App section begin===================================
    SupportApplication.prototype.loadApplicationList = function () {
            $.ajax({
                url:'/api/v1/application',
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

                }
            });

        }
    SupportApplication.prototype.renderApplicationList = function(data){
        console.log(data);
            $("#edgex-support-application-list table tbody").empty();
            $.each(data,function(i,v){
                var rowData = "<tr>";
                rowData += '<td class="scheduler-delete-icon"><input type="hidden" value="'+v.id+'"><div class="edgexIconBtn"><i class="fa fa-trash-o fa-lg" aria-hidden="true"></i> </div></td>';
                rowData += '<td class="scheduler-edit-icon"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-edit fa-lg" aria-hidden="true"></i> </div></td>';
                // rowData += '<td><input type="radio" name="schedulerRadio" value="'+v.id+'"></td>';
                rowData += '<td class="scheduler-detail-icon"><input type="hidden" value="'+v.id+'"><div class="edgexIconBtn"><i class="fa fa-eye fa-lg" aria-hidden="true"></i> </div></td>';

                rowData += "<td>" + (i + 1) +"</td>";
                rowData += "<td>" +  v.id + "</td>";
                rowData += "<td>" +  v.name + "</td>";
                rowData += "<td>" +  v.desc + "</td>";
                rowData += "<td>" +  v.task_num + "</td>";
                rowData += "<td>" +  v.energy_limit + "</td>";
                rowData += "<td>" +  v.time_limit + "</td>";
                rowData += "<td>" +  v.etc + "</td>";
                rowData += "</tr>";
                $("#edgex-support-application-list table tbody").append(rowData);
            });
            $(".scheduler-delete-icon").on('click',function(){
                application.deleteApplicationBtn($(this).children("input[type='hidden']").val());

            });
            $(".scheduler-edit-icon").on('click',function(){
                application.editApplicationBtn($(this).children("input[type='hidden']").val());
            });
            $(".scheduler-detail-icon").on('click',function(){
            application.loadTaskList($(this).children("input[type='hidden']").val());
            });

        }
    SupportApplication.prototype.addApplicationBtn =function () {
            $("#edgex-support-application-add-or-update .update-application").hide();
            $("#edgex-support-application-add-or-update .add-application").show();
            $("#edgex-support-application-add-or-update").show();
        }

    SupportApplication.prototype.commitApplicationBtn = function (type) {
            console.log(type)
            var applicationData = {
                id: $("#edgex-support-application-add-or-update form input[name= 'AppId']").val(),
                name: $("#edgex-support-application-add-or-update form input[name= 'AppName']").val(),
                desc: $("#edgex-support-application-add-or-update form input[name= 'AppDesc']").val(),
                energy_limit: $("#edgex-support-application-add-or-update form input[name= 'EnergyLimit']").val(),
                time_limit: $("#edgex-support-application-add-or-update form input[name= 'TimeLimit']").val(),
                etc: $("#edgex-support-application-add-or-update form input[name= 'etc']").val(),
            }
            //debugger
            if(type=="new"){
                delete applicationData["id"];
                commitApplication(applicationData);
            }else{
                console.log(applicationData);
                updateApplication(applicationData);
            }
        }
    function commitApplication(applicationData) {
            $.ajax({
                url: '/api/v1/application',
                type: 'POST',
                data: JSON.stringify(applicationData),
                success: function(){
                    application.loadApplicationList();
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
    function updateApplication(applicationData) {
            $.ajax({
                url: '/api/v1/application',
                type: 'PUT',
                data: JSON.stringify(applicationData),
                success: function(){
                    application.loadApplicationList();
                    bootbox.alert({
                        message: "Update Application Success!",
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
    SupportApplication.prototype.cancelAddApplicationBtn = function () {
            $("#edgex-support-application-add-or-update").hide();
        }
    SupportApplication.prototype.refreshApplicationListBtn = function () {
            application.loadApplicationList();
        }
    SupportApplication.prototype.editApplicationBtn = function (application) {
            var applicationItem = JSON.parse(application);
            //debugger
            $("#edgex-support-application-add-or-update form input[name='AppId']").val(applicationItem.id);
            $("#edgex-support-application-add-or-update form input[name='AppName']").val(applicationItem.name);
            $("#edgex-support-application-add-or-update form input[name='AppDesc']").val(applicationItem.desc);
            $("#edgex-support-application-add-or-update form input[name='EnergyLimit']").val(applicationItem.energy_limit);
            $("#edgex-support-application-add-or-update form input[name='TimeLimit']").val(applicationItem.time_limit);
            $("#edgex-support-application-add-or-update form input[name='etc']").val(applicationItem.etc);

            $("#edgex-support-application-add-or-update .update-application").show();
            $("#edgex-support-application-add-or-update .add-application").hide();
            $("#edgex-support-application-add-or-update").show();
        }

    SupportApplication.prototype.deleteApplicationBtn = function (applicationId) {
            bootbox.confirm({
                title: "confirm",
                message: "Are you sure to delete ? ",
                className: 'green-red-buttons',
                callback: function (result) {
                    if (result){
                        $.ajax({
                            url: '/api/v1/application/' + applicationId,
                            type: 'DELETE',
                            success: function(){
                                application.loadApplicationList();
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
    //===================App section end===================================

    //===================Task section begin============================

    SupportApplication.prototype.hideTaskList = function(){
        $("#edgex-support-task-list-main").hide();
    }

    SupportApplication.prototype.loadTaskList = function (pid) {
        $("#edgex-support-task-list-main").show('fast');
        $.ajax({
            url:'/api/v1/task/'+pid,
            type:'GET',
            success:function(data){
                if(!data || data.length == 0){
                    $("#edgex-support-pid").html("");
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
    SupportApplication.prototype.renderTaskList = function(data){
        $("#edgex-support-task-list table tbody").empty();
        $.each(data,function(i,v){
            console.log(v)
            var rowData = "<tr>";
            rowData += '<td class="task-delete-icon"><input type="hidden" value="'+v.id+'"><div class="edgexIconBtn"><i class="fa fa-trash-o fa-lg" aria-hidden="true"></i> </div></td>';
            rowData += '<td class="task-edit-icon"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-edit fa-lg" aria-hidden="true"></i> </div></td>';
            // rowData += '<td><input type="radio" name="scheduleEventRadio" value="'+v.id+'"></td>';
            rowData += "<td>" + (i + 1) +"</td>";
            rowData += "<td>" +  v.id + "</td>";
            rowData += "<td><input value="+v.name+" disabled style='outline:none;border-style:none;text-align:center;background-color:transparent;'>" + "</td>";
            rowData += "<td>" +  v.desc + "</td>";
            rowData += "<td>" +  v.cpu_require + "</td>";
            rowData += "<td>" +  v.data_size + "</td>";
            rowData += "<td>" +  v.data_in + "</td>";
            rowData += "<td>" +  v.data_out + "</td>";
            rowData += "<td>" +  v.exec_limit + "</td>";
            rowData += "<td>" +  v.state + "</td>";
            rowData += "</tr>";
            $("#edgex-support-task-list table tbody").append(rowData);
            $("#edgex-support-pid").html(v.pid);


        });
        //delete
        $(".task-delete-icon").on('click',function(){
            application.deleteTaskBtn($(this).children("input[type='hidden']").val());
        });
        //edit
        $(".task-edit-icon").on('click',function(){
            application.editTaskBtn($(this).children("input[type='hidden']").val());
        });
    }
    SupportApplication.prototype.deleteTaskBtn = function(taskId){

        var pid = $("#edgex-support-pid").html();
        bootbox.confirm({
            title: "confirm",
            message: "Are you sure to delete ? ",
            className: 'green-red-buttons',
            callback: function (result) {
                if(result){
                    $.ajax({
                        url: '/api/v1/task/' + taskId +','+pid,
                        type: 'DELETE',
                        success: function(){
                            application.loadTaskList(pid);
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
    SupportApplication.prototype.editTaskBtn = function(taskStr){

        var task = JSON.parse(taskStr);

        if(task.state!="等待执行"&&task.state!=""){
            bootbox.alert({
                title:'Error',
                message: "该状态下不可编辑！",
                className: 'red-green-buttons'
            });
            return
        }

        //application
        $("input[name='ApplicationId']").val(task.pid);

        //task
        $("#edgex-support-task-add input[name='TaskId']").val(task.id);
        $("#edgex-support-task-add input[name='TaskName']").val(task.name);
        $("#edgex-support-task-add input[name='TaskDesc']").val(task.desc);
        $("#edgex-support-task-add input[name='CpuRequire']").val(task.cpu_require);
        $("#edgex-support-task-add input[name='DataSize']").val(task.data_size);
        $("#edgex-support-task-add input[name='DataIn']").val(task.data_in);
        $("#edgex-support-task-add input[name='DataOut']").val(task.data_out);
        $("#edgex-support-task-add select[name='ExecLimit']").val(task.exec_limit);
        $("#edgex-support-task-add input[name='State']").val(task.state);

        $("#edgex-support-task-list-main").hide();

        $("#edgex-support-task-add").show();
        $("#edgex-support-task-add div.add-task").hide();
        $("#edgex-support-task-add div.update-task").show();


    }
    SupportApplication.prototype.addTaskBtn = function(){
        $("#edgex-support-task-list-main").hide();
        $("#edgex-support-task-add").show();
        $("#edgex-support-task-add div.add-task").show();
        $("#edgex-support-task-add div.update-task").hide();
        $(".edgex-support-task-form input[name='ApplicationId']").val($("#edgex-support-pid").html())
    }
    SupportApplication.prototype.cancelAddTaskBtn = function(){
        $("#edgex-support-task-list-main").show();
        $("#edgex-support-task-add").hide();
    }

    SupportApplication.prototype.commitTaskBtn = function(type){
        //application
        var pid = $(".edgex-support-task-form input[name='ApplicationId']").val().trim();

        //task
        var task = {
            pid: pid,
            id: $("input[name='TaskId']").val().trim(),
            name: $("input[name='TaskName']").val().trim(),
            desc: $("input[name='TaskDesc']").val().trim(),
            cpu_require: $("input[name='CpuRequire']").val().trim(),
            data_size: $("input[name='DataSize']").val().trim(),
            data_in: $("input[name='DataIn']").val().trim(),
            data_out: $("input[name='DataOut']").val().trim(),
            exec_limit: $("select[name='ExecLimit']").val(),
            state: $("input[name='State']").val(),
        }

        if (task.state == ""){
            task.state = "等待执行"
        }

        if(type == "new") {
            delete task["id"];
        }
        commitTask(task,type)
        $("#edgex-support-task-add").hide();
    }
    function commitTask(task,type){
        var method ;
        if (type=="new") {
            method = "POST"
        }else{
            method = "PUT"
        }
        //debugger
        console.log(method)
        $.ajax({
            url:'/api/v1/task',
            type: method,
            data:JSON.stringify(task),
            success:function(){
                var pid = $(".edgex-support-task-form input[name='ApplicationId']").val().trim();
                application.loadTaskList(pid);
                application.loadResource();
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

    SupportApplication.prototype.refreshTaskListBtn = function(){
        var pid = $("#edgex-support-pid").html();
        application.loadTaskList(pid);
    }



    SupportApplication.prototype.scheduleBtn = function () {
        $.ajax({
            url:'/api/v1/schedule',
            type: 'GET',
            success: function (data) {
                var code = application.sendCommand(data);
                if(code == "success"){
                    application.confirmSend(data);
                }
            },
            error: function (err) {
                bootbox.alert({
                    title:'Error',
                    message: err.responseText,
                    className: 'red-green-buttons'
                });
            },
        });
    }
    SupportApplication.prototype.confirmSend = function (data) {
        $.ajax({
            url:'/api/v1/schedule',
            type: 'PUT',
            data: JSON.stringify(data),
            success: function () {
                bootbox.alert({
                    message: "success!",
                    className: 'red-green-buttons'
                });
            },
        });
    }
    SupportApplication.prototype.sendCommand = function (data) {
        var paramBody={};
        data = JSON.stringify(data);
        paramBody["Task"] = data;
        console.log(paramBody);

        var url = "/core-command/api/v1/device/name/Task-Report-Device/command/Task";
        var code;
        $.ajax({
            url:url,
            type:'PUT',
            contentType:'application/json',
            async:false,
            data:JSON.stringify(paramBody),
            success:function(data){
               code = "success"
            },
            error:function(err){
                bootbox.alert({
                    title:'Error',
                    message: err.responseText,
                    className: 'red-green-buttons'
                });
                code = "failed";
            },

        })
        return code;
    }
    //===================Task section end===================================
    //===================Resource section begin===================================
    SupportApplication.prototype.loadResource = function () {
            $.ajax({
                url:'/api/v1/resource',
                type:'GET',
                success:function (data) {
                    if(!data || data.length == 0){
                        $("#edgex-support-resource-list table tbody").empty();
                        $("#edgex-support-resource-list table tfoot").show();

                        return
                    }else{
                        $("#edgex-support-resource-list table tfoot").hide();
                    }
                    application.resourceCache = data;
                    application.renderResource(data);
                },
                error:function(){

                }
            });
    }
    SupportApplication.prototype.renderResource = function (data) {
            console.log(data)
            $("#edgex-support-resource-list table tbody").empty();
            $.each(data,function(i,v){
                var rowData = "<tr>";
                rowData += '<td class="scheduler-edit-icon"><input type="hidden" value=\''+JSON.stringify(v)+'\'><div class="edgexIconBtn"><i class="fa fa-edit fa-lg" aria-hidden="true"></i> </div></td>';
                rowData += "<td>" +  v.id + "</td>";
                rowData += "<td>" +  v.cpu_resource + "</td>";
                rowData += "<td>" +  v.storage + "</td>";
                rowData += "<td>" +  v.upload_rate + "</td>";
                rowData += "<td>" +  v.download_rate + "</td>";
                rowData += "</tr>";
                $("#edgex-support-resource-list table tbody").append(rowData);
            });

            $(".scheduler-edit-icon").on('click',function(){
                application.editResourceBtn($(this).children("input[type='hidden']").val());
            });

    }
    SupportApplication.prototype.addResourceBtn = function () {
        $("#edgex-support-resource-list").hide();
        $("#edgex-support-resource-add").show();
        $("#edgex-support-resource-add div.update-resource").hide();
        $("#edgex-support-resource-add div.add-resource").show();
    }
    SupportApplication.prototype.commitResourceBtn = function (type) {
        console.log(type)
        var resourceData = {
            id: $("#edgex-support-resource-add form input[name= 'ResourceId']").val(),
            cpu_resource: $("#edgex-support-resource-add form input[name= 'CpuResource']").val(),
            storage: $("#edgex-support-resource-add form input[name= 'Storage']").val(),
            upload_rate: $("#edgex-support-resource-add form input[name= 'UploadRate']").val(),
            download_rate: $("#edgex-support-resource-add form input[name= 'DownloadRate']").val(),

        }
        //debugger
        if(type=="new"){
            delete resourceData["id"];
            commitResource(resourceData);
        }else{
            console.log(resourceData);
            updateResource(resourceData);
        }
    }
    function commitResource(resourceData) {
            $.ajax({
            url: '/api/v1/resource',
            type: 'POST',
            data: JSON.stringify(resourceData),
            success: function(){
                application.loadResource();
                bootbox.alert({
                    message: "Add Resource Success!",
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
    function updateResource(resourceData) {
            $.ajax({
            url: '/api/v1/resource',
            type: 'PUT',
            data: JSON.stringify(resourceData),
            success: function(){
                application.loadResource();
                bootbox.alert({
                    message: "Update Resource Success!",
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
    SupportApplication.prototype.cancelAddResourceBtn = function () {
        $("#edgex-support-resource-list").show();
        $("#edgex-support-resource-add").hide();
    }
    SupportApplication.prototype.refreshResourceListBtn = function () {
        application.loadResource();
    }
    SupportApplication.prototype.editResourceBtn = function (resource) {
        var ResourceItem = JSON.parse(resource);
        //debugger
        $("#edgex-support-resource-add form input[name='ResourceId']").val(ResourceItem.id);
        $("#edgex-support-resource-add form input[name='CpuResource']").val(ResourceItem.cpu_resource);
        $("#edgex-support-resource-add form input[name='Storage']").val(ResourceItem.storage);
        $("#edgex-support-resource-add form input[name='UploadRate']").val(ResourceItem.upload_rate);
        $("#edgex-support-resource-add form input[name='DownloadRate']").val(ResourceItem.download_rate);

        $("#edgex-support-resource-list").hide();
        $("#edgex-support-resource-add").show();
        $("#edgex-support-resource-add div.update-resource").show();
        $("#edgex-support-resource-add div.add-resource").hide();

    }

    return application;
})();