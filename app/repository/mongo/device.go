package mongo

import (
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"gopkg.in/mgo.v2/bson"
	"log"
	"time"
)

type DeviceMongoRepository struct {
}

func (de *DeviceMongoRepository) Insert(g *domain.Device) (string, error) {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(deviceScheme)
	timestamp := time.Now().UnixNano() / 1000000
	g.Created = timestamp
	err := coll.Insert(g)

	if err != nil {
		log.Println("Insert device failed !")
		return "", err
	}

	return g.Id.Hex(), nil
}

func (de *DeviceMongoRepository) Delete(id string) error {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(deviceScheme)
	err := coll.Remove(bson.M{"_id": bson.ObjectIdHex(id)})
	if err != nil {
		log.Println("Delete device failed!" + err.Error())
		return err
	}
	return nil
}

func (de *DeviceMongoRepository) SelectAll() ([]domain.Device, error) {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(deviceScheme)

	result := make([]domain.Device, 0)
	err := coll.Find(nil).All(&result)
	if err != nil {
		log.Println("SelectAll failed!")
		return nil, err
	}
	return result, nil
}

func (de *DeviceMongoRepository) Select(id string) (domain.Device, error) {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(deviceScheme)

	result := domain.Device{}
	err := coll.Find(nil).One(&result)
	if err != nil {
		log.Println("Select failed!")
		return result, err
	}
	return result, nil
}

func (de *DeviceMongoRepository) Exists(name string) (bool, error) {
	ds := DS.DataStore()
	defer ds.S.Close()
	log.Println("Check device exists...")

	coll := ds.S.DB(database).C(deviceScheme)
	count, err := coll.Find(bson.M{"name": name}).Count()

	if err != nil {
		log.Println("Check device exists failed !")
		return false, err
	}

	return count > 0, nil
}

func (de *DeviceMongoRepository) Update(device domain.Device) error {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(deviceScheme)
	timestamp := time.Now().UnixNano() / 1000000
	device.Modified = timestamp
	err := coll.UpdateId(device.Id, &device)

	if err != nil {
		log.Println("Update device failed !")
		return err
	}

	return nil
}

func (de *DeviceMongoRepository) GetDevice(name string) (domain.Device, error){
	ds := DS.DataStore()
	defer ds.S.Close()
	coll := ds.S.DB(database).C(deviceScheme)

	g := domain.Device{}
	err := coll.Find(bson.M{"name": name}).One(&g)
	if err != nil{
		log.Println("Update device failed !")
		return g, err
	}

	return g, nil
}
