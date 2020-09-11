package domain

import (
	"gopkg.in/mgo.v2/bson"
)

//描述属性用
type Attribute struct {
	//用于描述某个属性
	Key				string				`json:"key"`				//属性名
	Value			string				`json:"value"`				//属性取值
}
type Attribute_Rule struct {
	//用于描述某个属性需要满足的条件
	Key				string				`json:"key"`				//某个key
	Operator		string				`json:"value"`				//某个operator，取值范围:{In, NotIn, Exist, NotExist, GT, LT}
	Value_Num		int64				`json:"value_num"`			//key的取值数目
	Value_List		[]string			`json:"value_list"`			//key的取值列表
}
//对于一个实体（Node或Pod），它可能在某些时候需要罗列自己所有的Attribute或Attribute_Rule
type 	Entity_Attribute	struct{
	Name			string				`json:"name"`				//实体名称
	Attribute		Attribute			`json:"attribute"`			//实体属性
}
type Entity_Attribute_Rule struct {
	Name			string				`json:"name"`				//实体名称
	Attribute_Rule	Attribute_Rule		`json:"attribute_rule"`		//实体属性规则
}

//本地节点
type Node struct {
	Id          	bson.ObjectId		`bson:"_id,omitempty" json:"id"`
	NodeName		string				`json:"name"`					//节点名称
	CPU				int64				`json:"cpu"`					//节点CPU
	Memory			int64				`json:"memory"`					//节点内存
	Disk			int64				`json:"disk"`					//节点磁盘
	MemoryPressure	bool				`json:"memory_pressure"`		//节点是否有内存压力
	DiskPressure	bool				`json:"disk_pressure"`			//节点是否有磁盘压力
	PIDPressure		bool				`json:"pid_pressure"`			//节点是否有进程ID压力
	Ready			bool				`json:"ready"`					//节点是否已经准备好做任务调度
	CPUUsage		int64				`json:"cpu_usage"`				//节点CPU占用百分比
	MemoryUsage		int64				`json:"memory_usage"`			//节点内存占用百分比
	Taint			[]Attribute			`json:"taint"`					//节点污点
	NodeLabels		[]Attribute			`json:"node_labels"`			//节点的标签
	TaskLabels		[]Attribute			`json:"task_labels"`			//节点中运行的所有Task(Pod)的标签
}

//应用
type Application struct {
	Id          	bson.ObjectId 		`bson:"_id,omitempty" json:"id"`
	NodeID			string				`json:"nodeid"`					//因为应用必须在适配的Node（手机，电脑，平板等）上执行，所以需要绑定一下具体哪一个本地Node
	Name        	string        		`json:"name"`
	Description 	string        		`json:"desc"`
	TaskNum			int64				`json:"task_num"`
}

//任务
type Task struct {
	Id          	bson.ObjectId		`bson:"_id,omitempty" json:"id"`					//不解释~
	AppID			string				`json:"appid"`
	NodeID			string				`json:"nodeid"`										//任务最后使用哪个Node执行,是本地的还是云端的
	Name        	string				`json:"name"`
	Description 	string        		`json:"desc"`
	HostName		string				`json:"host_name"`									//任务要占用的主机名
	HostPort		string				`json:"host_port"`									//任务要占用的端口号，范围5001-65535
	Kind			string				`json:"kind"`										//任务要建立的Pod类型，取值{"ReplicationController","ReplicaSet","Pod","Service","DaemonSet","Deployment"}，Pod为主
	Tolerations		[]Attribute			`json:"tolerations"`								//任务的容忍列表
	ImageNeed		[]string			`json:"image_need"`									//任务需要的镜像
	CPURequest		int64				`json:"cpu_request"`								//任务需要的CPU资源
	MemoryRequest	int64				`json:"memory_request"`								//任务需要的内存资源
	DiskRequest		int64				`json:"disk_request"`								//任务需要的磁盘资源
	TaskLabels		[]Attribute			`json:"task_labels"`								//Task(Pod)的标签
	ExecLimit   	string       		`json:"exec_limit"`									//执行地点限制
	TimeLimit		string				`json:"time_limit"`									//完成时间限制，格式为数字+ms/s/min/h/d
	State       	string       		`json:"exec_state"`									//执行状态
}
