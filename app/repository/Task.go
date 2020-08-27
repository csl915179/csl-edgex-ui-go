package repository

import (
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"github.com/edgexfoundry/edgex-ui-go/app/repository/mongo"
)

type TaskRepos interface {
	Select(id string) (domain.Task, error)
	SelectAll(pid string) ([]domain.Task, error)
	SelectAllWait()([]domain.Task, error)
	Exists(id string) (bool, error)
	Insert(task *domain.Task) (string, error)
	Update(task domain.Task) error
	Delete(pid, id string) error
}

func GetTaskRepos() TaskRepos {
	if mongo.DS.S != nil {
		return TaskRepos(&mongo.TaskMongoRepository{})
	} else{
		return nil
	}
}
