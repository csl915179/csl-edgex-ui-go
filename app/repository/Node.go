package repository

import (
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"github.com/edgexfoundry/edgex-ui-go/app/repository/mongo"
)

type NodeRepos interface {
	SelectAll() ([]domain.Node,error)
	Insert(node *domain.Node) (string, error)
	Delete(id string) error
	Update(node domain.Node) error
}
func GetNodeRepos() NodeRepos {
	if mongo.DS.S != nil {
		return NodeRepos(&mongo.NodeMongoRepository{})
	} else{
		return nil
	}
}