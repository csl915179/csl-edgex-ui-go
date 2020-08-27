package domain

import (
	"gopkg.in/mgo.v2/bson"
)

//应用
type Application struct {
	Id          	bson.ObjectId `bson:"_id,omitempty" json:"id"`
	Name        	string        `json:"name"`
	Description 	string        `json:"desc"`
	TaskNum			string        `json:"task_num"`
	EnergyLimit     string        `json:"energy_limit"`
	TimeLimit     	string        `json:"time_limit"`
	Etc				string		  `json:"etc"`
}

//任务
type Task struct {
	Id          bson.ObjectId `bson:"_id,omitempty" json:"id"`
	Pid         string        `bson:"_pid,omitempty" json:"pid"`
	Name        string        `json:"name"`
	Description string        `json:"desc"`
	CpuRequire  string        `json:"cpu_require"`
	DataSize    string        `json:"data_size"`
	DataIn      string        `json:"data_in"`
	DataOut     string        `json:"data_out"`
	ExecLimit   string        `json:"exec_limit"`
	State       string        `bson:"_state" json:"state"`
}

//本地资源
type Resource struct {
	Id           bson.ObjectId `bson:"_id,omitempty" json:"id"`
	CpuResource  string		   `json:"cpu_resource"`
	Storage		 string		   `json:"storage"`
	UploadRate   string 	   `json:"upload_rate"`
	DownloadRate string		   `json:"download_rate"`

}