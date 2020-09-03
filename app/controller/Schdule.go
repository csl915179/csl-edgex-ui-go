package controller

import (
	"bytes"
	"encoding/json"
	"github.com/edgexfoundry/edgex-ui-go/app/common"
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"github.com/edgexfoundry/edgex-ui-go/app/repository"
	"io/ioutil"
	"log"
	"net/http"
	"runtime"
	"strconv"
	"sync"
	"time"
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
	//获取所有Resource信息
	resource,_ := repository.GetResourceRepos().SelectAll()
	resourceCpu := resource[0].CpuResource
	resourceStorage := resource[0].Storage
	for _,v := range localList{
		taskCpu := v.CpuRequire
		taskStorage := v.DataSize
		resourceCpu -= taskCpu
		resourceStorage -= taskStorage
		if resourceCpu < 0 || resourceStorage < 0 {
			return localOrRemoteList
		}
	}
	for i,v := range localOrRemoteList{
		taskCpu := v.CpuRequire
		taskStorage := v.DataSize
		resourceCpu -= taskCpu
		resourceStorage -= taskStorage

		if resourceCpu < 0 || resourceStorage < 0 {
			var remainList = localOrRemoteList[i:]
			return remainList
		}else{
			localList = append(localList,v)
		}
	}
	return nil

}

func ScheduleConfirm(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var t []domain.Task
	taskList, _ := ioutil.ReadAll(r.Body)
	json.Unmarshal(taskList,&t)
	for _,v:=range t{
		v.State = "已发送远端"
		repository.GetTaskRepos().Update(v)

	}

}
func ScheduleRun(){

	judgeList := make([]int,len(localList))
	timeOne := time.Now()
	for{
		timeTwo := time.Now()
		if AllDone(judgeList) || timeTwo.Sub(timeOne) > time.Minute*2 {
			break
		}
		for i,v := range localList {
			if judgeList[i] == 0 {			//该任务没有被处理过
				// 访问数据库，加锁
				mutex.Lock()
				resource, _ := repository.GetResourceRepos().SelectAll()
				mutex.Unlock()
				resourceCpu := resource[0].CpuResource
				resourceStorage := resource[0].Storage
				taskCpu := v.CpuRequire
				taskStorage := v.DataSize
				if resourceCpu >= taskCpu && resourceStorage >= taskStorage {
					//把资源占用
					resourceStorage -= taskStorage
					resourceCpu -= taskCpu
					resource[0].CpuResource = resourceCpu
					resource[0].Storage = resourceStorage

					mutex.Lock()
					repository.GetResourceRepos().Update(resource[0])
					mutex.Unlock()
					go TaskRun(v)
					judgeList[i] = 1
				}
			}
		}
	}
}

func TaskRun(task domain.Task){
	task.State = "正在执行"
	repository.GetTaskRepos().Update(task)
	time.Sleep(time.Second*20)
	//执行完毕

	task.State = "本地执行完毕"
	repository.GetTaskRepos().Update(task)
	log.Print(goID())
	log.Print(task)
	//资源释放
	mutex.Lock()
	resource,_ := repository.GetResourceRepos().SelectAll()
	resourceCpu := resource[0].CpuResource
	resourceStorage := resource[0].Storage
	taskCpu := task.CpuRequire
	taskStorage := task.DataSize
	resourceStorage += taskStorage
	resourceCpu += taskCpu
	resource[0].CpuResource = resourceCpu
	resource[0].Storage = resourceStorage
	repository.GetResourceRepos().Update(resource[0])
	log.Print(resource[0])
	mutex.Unlock()

}
func AllDone( judgeList []int) bool{
	for _,v := range judgeList{
		if v == 0 {
			return false
		}
	}
	return true
}
func goID() uint64 {
	b := make([]byte, 64)
	b = b[:runtime.Stack(b, false)]
	b = bytes.TrimPrefix(b, []byte("goroutine "))
	b = b[:bytes.IndexByte(b, ' ')]
	n, _ := strconv.ParseUint(string(b), 10, 64)
	return n
}
