package controller

import (
	"encoding/json"
	"github.com/edgexfoundry/edgex-ui-go/app/common"
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"github.com/edgexfoundry/edgex-ui-go/app/repository"
	"net/http"
	"sync"
)
var mutex sync.Mutex
var localOrRemoteList []domain.Task
var localList []domain.Task

func Schedule(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	taskList, err := repository.GetTaskRepos().SelectAllWait()//找出所有的等待执行的Task
	if err != nil {
		w.Write([]byte(err.Error()))
		return
	}
	localList = nil
	localOrRemoteList = nil
	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	var waitList []domain.Task
	//按执行限制分类
	for _,v:= range taskList{
		if v.ExecLimit == "Remote"{
			waitList = append(waitList,v)
		} else if v.ExecLimit == "Local" {
			localList = append(localList,v)
		} else {
			localOrRemoteList = append(localOrRemoteList,v)
		}
	}
	remainList := SelectLocalList()
	waitList = append(waitList,remainList...)
	result, _ := json.Marshal(&waitList)
	w.Write(result)
	go ScheduleRun()

}

//进行分配
func SelectLocalList() []domain.Task{
	//获取所有Node信息

	return nil

}

func ScheduleConfirm(w http.ResponseWriter, r *http.Request) {


}
func ScheduleRun(){

}

func TaskRun(task domain.Task){


}
func AllDone( judgeList []int) bool{
	return false
}
func goID() uint64 {

	return 0
}
