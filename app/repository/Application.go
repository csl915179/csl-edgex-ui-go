package repository

import (
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"github.com/edgexfoundry/edgex-ui-go/app/repository/mongo"
)

type ApplicationRepos interface {
	Select(id string) (domain.Application, error)
	SelectAll() ([]domain.Application, error)
	Exists(id string) (bool, error)
	Insert(application *domain.Application) (string, error)
	Update(application domain.Application) error
	Delete(id string) error
	FindNode(NodeID string) ([]domain.Application,error)
}

func GetApplicationRepos() ApplicationRepos {
	if mongo.DS.S != nil {
		return ApplicationRepos(&mongo.ApplicationMongoRepository{})
	} else{
		return nil
	}
}
