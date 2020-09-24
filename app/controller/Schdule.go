package controller

import (
	"github.com/edgexfoundry/edgex-ui-go/app/common"
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"github.com/edgexfoundry/edgex-ui-go/app/repository"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"sync"
	"time"
)

var execLock sync.Mutex
var allocateResourceLock sync.Mutex



//执行Application里的Task
func ExecAppTask(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["appid"]
	execLock.Lock()
	go SchedulePartation(id)


	//result, _ := json.Marshal(&app)
	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	//w.Write(result)

}

//清分还没有执行的Task，如果支持本地执行且没有执行的，就放入待执行列表，如果可以满足限制条件，就执行，否则退回
func SchedulePartation(id string) error{
	app,err := repository.GetApplicationRepos().Select(id)
	if err != nil {
		log.Println(err);
		return err
	}
	//挑选出application对应的Task
	TaskList,err := repository.GetTaskRepos().FindByAppId(id)
	if err != nil {
		log.Println(err);
		return err
	}
	//对这些任务进行检查，如果可以满足要求就执行
	for i:=0; i<int(app.TaskNum);  i++{
		if TaskList[i].State == "NOT EXECUTED" && (TaskList[i].ExecLimit == "Local" || TaskList[i].ExecLimit == ""){
			go allocateLocalResourceAndExec(TaskList[i], app.NodeID)
			if err != nil {
				log.Println(err);
				return err
			}
		}else if  TaskList[i].State == "NOT EXECUTED" && TaskList[i].ExecLimit == "LocalOrRemote"{

		}else if  TaskList[i].State == "NOT EXECUTED" && TaskList[i].ExecLimit == "Remote"{
		}
	}
	execLock.Unlock()
	return nil
}

//为某一个Task分配本地资源并执行
func allocateLocalResourceAndExec(Task domain.Task, NodeID string) error{
	//获取node信息
	allocateResourceLock.Lock()
	Node,err := repository.GetNodeRepos().Select(NodeID)
	if err != nil {
		log.Println(err);
		return err
	}
	//节点硬件资源情况获取
	cpu, cpu_usage, cpu_allocated := Node.CPU, Node.CPUUsage, int64(-1)
	memory, memory_usage, memory_allocated := Node.Memory, Node.MemoryUsage, int64(-1)
	disk, disk_usage, disk_allocated := Node.Disk, Node.DiskUsage, int64(-1)
	//检查CPU剩余资源是否可以满足时延限制并分配CPU，即使不需要CPU也会分配一个最小值，从3%开始分配,步长1%，最多分配20%，分配后增加节点CPU利用率
	step := float32(cpu)*0.01	//每一次分配的CPU频率的增量，为频率的1%
	TimeLimit,_ := (time.ParseDuration(Task.TimeLimit))
	for i:=3; i <= 20; i++ {
		if int64(i) + cpu_usage >100{ //本地CPU资源无法承受
			break
		} else if int64(TimeLimit) == 0 { //没有声明执行时间限制，分配最低3%的CPU资源
			cpu_allocated = 3
			break
		} else if int64(float32(Task.CPURequest)/(step * float32(i))) <= int64(TimeLimit)/1000000000 { //可以满足时间限制
			cpu_allocated = int64(i)
			break
		}
	}
	//检查节点内存资源是否可以满足要求
	if Task.MemoryRequest <= memory - memory_usage {
		memory_allocated = Task.MemoryRequest
	}
	//检查节点磁盘资源是否可以满足要求
	if Task.DiskRequest <= disk - disk_usage {
		disk_allocated = Task.DiskRequest
	}
	//检查资源分配情况
	if cpu_allocated == -1 || memory_allocated == -1 || disk_allocated == -1{
		log.Printf("Task %s 资源不足，无法执行\n",Task.Name)
		allocateResourceLock.Unlock()
		return nil
	}
	//为Task分配从本地Node扣减的资源,然后执行
	go ExecTask(Node, Task, cpu_allocated, memory_allocated, disk_allocated)
	return nil
}

func ExecTask (Node domain.Node, Task domain.Task, cpu_allocation int64, memory_allocation int64, disk_allocation int64) error{
	//修改执行状态
	Task.State = "EXECUTING"
	Task.NodeID = Node.Id.Hex()
	repository.GetTaskRepos().Update(Task)
	//扣减本地资源
	err := consume_local_resource(Node, Task, cpu_allocation, memory_allocation, disk_allocation)
	if err != nil {
		log.Println(err)
		return err
	}
	allocateResourceLock.Unlock()
	//然后执行
	log.Printf("Task %s 开始执行\n", Task.Name)
	allocated_cpu_frequency := float32(Node.CPU) * float32(cpu_allocation) / 100
	exec_time := time.Duration(int64(float32(Task.CPURequest) / allocated_cpu_frequency))
	time.Sleep(exec_time * time.Second)
	Task.State = "EXECUTED"
	repository.GetTaskRepos().Update(Task)
	err = restitute_local_resource(Node, Task, cpu_allocation, memory_allocation, disk_allocation)
	if err != nil {
		log.Println(err)
		return err
	}
	log.Printf("Task %s 完成执行\n", Task.Name)
	return nil
}

//扣减本地资源，也可传入负参数以加回本地资源
func consume_local_resource(Node domain.Node, Task domain.Task, cpu_counsume int64, memory_consume int64, disk_consume int64) error {
	//刷新Node，此时别的应用可能更新了Node
	Node,err := repository.GetNodeRepos().Select(Node.Id.Hex())
	if err != nil {
		log.Println(err)
		return err
	}
	Node.CPUUsage = Node.CPUUsage + cpu_counsume
	log.Println("Node.CPUUsage: ", Node.CPUUsage)
	if Node.CPUUsage >= 85 {
		Node.CPUPressure = true
	}
	Node.MemoryUsage = Node.MemoryUsage + memory_consume
	if float64(Node.MemoryUsage) / float64(Node.Memory) >= 0.85 {
		Node.MemoryPressure = true
	}
	Node.DiskUsage = Node.DiskUsage + disk_consume
	if float64(Node.DiskUsage) / float64(Node.Disk) >= 0.85 {
		Node.DiskPressure = true
	}
	Node.TaskLabels[Task.Id.Hex()] = Task.TaskLabels
	err = repository.GetNodeRepos().Update(Node)
	if err != nil {
	log.Println(err)
	return err
	}
	return nil
}

//执行完毕后返还本地资源
func restitute_local_resource(Node domain.Node, Task domain.Task, cpu_counsume int64, memory_consume int64, disk_consume int64) error {
	Node,err := repository.GetNodeRepos().Select(Node.Id.Hex())
	if err != nil {
		log.Println(err)
		return err
	}
	Node.CPUUsage = Node.CPUUsage - cpu_counsume
	if Node.CPUUsage < 85 {
		Node.CPUPressure = false
	}
	Node.MemoryUsage = Node.MemoryUsage - memory_consume
	if float64(Node.MemoryUsage) / float64(Node.Memory) < 0.85 {
		Node.MemoryPressure = false
	}
	Node.DiskUsage = Node.DiskUsage - disk_consume
	if float64(Node.DiskUsage) / float64(Node.Disk) < 0.85 {
		Node.DiskPressure = false
	}
	delete(Node.TaskLabels,Task.Id.Hex())
	err = repository.GetNodeRepos().Update(Node)
	if err != nil {
	log.Println(err)
	return err
	}
	return nil
}