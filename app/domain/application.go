package domain

import (
	"gopkg.in/mgo.v2/bson"
)

//应用
type Application struct {
	Id          	bson.ObjectId 		`bson:"_id,omitempty" json:"id"`
	Name        	string        		`json:"name"`
	Description 	string        		`json:"desc"`
	TaskNum			int64				`json:"task_num"`
	EnergyLimit     int64      			`json:"energy_limit"`
	TimeLimit     	int64				`json:"time_limit"`
	Etc				string				`json:"etc"`
}

//任务
type Task struct {
	Id          bson.ObjectId		`bson:"_id,omitempty" json:"id"`
	AppID		string				`json:"appid"`
	Name        string				`json:"name"`
	Description string        		`json:"desc"`
	CpuRequire  int64				`json:"cpu_require"`
	DataSize    int64        		`json:"data_size"`
	DataIn      int64        		`json:"data_in"`
	DataOut     int64        		`json:"data_out"`
	ExecLimit   string       		`json:"exec_limit"`
	State       string       		`bson:"_state" json:"state"`
}

//本地资源
type Resource struct {
	Id           bson.ObjectId		`bson:"_id,omitempty" json:"id"`
	CpuResource  int64				`json:"cpu_resource"`
	Storage		 int64				`json:"storage"`
	UploadRate   int64				`json:"upload_rate"`
	DownloadRate int64				`json:"download_rate"`

}