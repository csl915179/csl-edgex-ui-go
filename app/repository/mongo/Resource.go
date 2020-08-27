package mongo

import (
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"log"
)

type ResourceMongoRepository struct {
}

func (rr *ResourceMongoRepository) SelectAll() ([]domain.Resource, error) {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(resourceScheme)

	result := make([]domain.Resource, 0)
	err := coll.Find(nil).All(&result)
	if err != nil {
		log.Println("SelectAll failed!")
		return nil, err
	}
	return result, nil
}
func (rr *ResourceMongoRepository) Insert(r *domain.Resource) (string, error) {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(resourceScheme)
	err := coll.Insert(r)

	if err != nil {
		log.Println("Insert resource failed !")
		return "", err
	}

	return r.Id.Hex(), nil
}
func (rr *ResourceMongoRepository) Update(resource domain.Resource) error {
	ds := DS.DataStore()
	defer ds.S.Close()
	log.Print("update resource")
	log.Print(resource)
	coll := ds.S.DB(database).C(resourceScheme)

	err := coll.UpdateId(resource.Id, &resource)

	if err != nil {
		log.Println("Update resource failed !")
		return err
	}

	return nil
}