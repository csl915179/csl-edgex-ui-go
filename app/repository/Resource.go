package repository

import (
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"github.com/edgexfoundry/edgex-ui-go/app/repository/mongo"
)

type ResourceRepos interface {
	SelectAll() ([]domain.Resource,error)
	Insert(resource *domain.Resource) (string, error)
	Update(resource domain.Resource) error
}
func GetResourceRepos() ResourceRepos {
	if mongo.DS.S != nil {
		return ResourceRepos(&mongo.ResourceMongoRepository{})
	} else{
		return nil
	}
}