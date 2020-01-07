$(document).ready(function(){
    profileManagementModule .loadProfileList();
});
var profileManagementModule = {
    selectedRow:null,
    profileDataCache:[],
    loadProfileList:function(){
        $.ajax({
            url: '/core-metadata/api/v1/deviceprofile',
            type: 'GET',
        })
    },
    loadDeviceList:function(){
        $.ajax({
            url: '/core-metadata/api/v1/device',
            type: 'GET',
        })
    }
}