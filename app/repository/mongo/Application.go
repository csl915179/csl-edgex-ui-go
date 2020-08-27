package mongo

import (
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"gopkg.in/mgo.v2/bson"
	"log"
)

type ApplicationMongoRepository struct {
}

func (ar *ApplicationMongoRepository) Insert(a *domain.Application) (string, error) {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(applicationScheme)
	err := coll.Insert(a)

	if err != nil {
		log.Println("Insert application failed !")
		return "", err
	}

	return a.Id.Hex(), nil
}

func (ar *ApplicationMongoRepository) Delete(id string) error {
	ds := DS.DataStore()
	defer ds.S.Close()

	//级联删除  将任务先删除
	coll := ds.S.DB(database).C(taskScheme)
	_, err := coll.RemoveAll(bson.M{"_pid": id})
	if err != nil {
		log.Println("Delete application failed!" + err.Error())
		return err
	}
	coll = ds.S.DB(database).C(applicationScheme)
	err = coll.Remove(bson.M{"_id": bson.ObjectIdHex(id)})
	if err != nil {
		log.Println("Delete application failed!" + err.Error())
		return err
	}
	return nil
}

func (ar *ApplicationMongoRepository) SelectAll() ([]domain.Application, error) {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(applicationScheme)

	result := make([]domain.Application, 0)
	err := coll.Find(nil).All(&result)
	if err != nil {
		log.Println("SelectAll failed!")
		return nil, err
	}
	return result, nil
}

func (ar *ApplicationMongoRepository) Select(id string) (domain.Application, error) {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(applicationScheme)

	result := domain.Application{}
	err := coll.Find(nil).One(&result)
	if err != nil {
		log.Println("Select failed!")
		return result, err
	}
	return result, nil
}

func (ar *ApplicationMongoRepository) Exists(id string) (bool, error) {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(applicationScheme)
	count, err := coll.Find(bson.M{"_id": bson.ObjectIdHex(id)}).Count()

	if err != nil {
		log.Println("Check application exists failed !")
		return false, err
	}

	return count > 0, nil
}

func (ar *ApplicationMongoRepository) Update(application domain.Application) error {
	ds := DS.DataStore()
	defer ds.S.Close()
	log.Print("app update")
	log.Print(application)
	coll := ds.S.DB(database).C(applicationScheme)

	err := coll.UpdateId(application.Id, &application)

	if err != nil {
		log.Println("Update application failed !")
		return err
	}

	return nil
}

