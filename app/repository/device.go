package repository

import (
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"github.com/edgexfoundry/edgex-ui-go/app/repository/mongo"
)

type DeviceRepos interface {
	Select(id string) (domain.Device, error)
	SelectAll() ([]domain.Device, error)
	Exists(name string) (bool, error)
	Insert(device *domain.Device) (string, error)
	Update(device domain.Device) error
	Delete(id string) error
	GetDevice(name string) (domain.Device, error)
}
func GetDeviceRepos() DeviceRepos {
	//if mongo.DS.S != nil {
	return DeviceRepos(&mongo.DeviceMongoRepository{})
	//}
}
