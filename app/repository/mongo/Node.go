package mongo

import (
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"gopkg.in/mgo.v2/bson"
	"log"
)

type NodeMongoRepository struct {
}

func (rr *NodeMongoRepository) Select(id string) (domain.Node, error){
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(nodeScheme)

	result := domain.Node{}
	err := coll.Find(nil).One(&result)
	if err != nil {
		log.Println("Select failed!", err)
		return result, err
	}
	return result, nil
}

func (rr *NodeMongoRepository) SelectAll() ([]domain.Node, error) {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(nodeScheme)

	result := make([]domain.Node, 0)
	err := coll.Find(nil).All(&result)
	if err != nil {
		log.Println("SelectAll failed!")
		return nil, err
	}
	return result, nil
}

func (rr *NodeMongoRepository) Insert(r *domain.Node) (string, error) {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(nodeScheme)
	err := coll.Insert(r)

	if err != nil {
		log.Println("Insert node failed !")
		return "", err
	}

	return r.Id.Hex(), nil
}

func (rr *NodeMongoRepository) Update(node domain.Node) error {
	ds := DS.DataStore()
	defer ds.S.Close()
	log.Print("update node")
	log.Print(node)
	coll := ds.S.DB(database).C(nodeScheme)

	err := coll.UpdateId(node.Id, &node)

	if err != nil {
		log.Println("Update node failed !")
		return err
	}

	return nil
}

func (rr *NodeMongoRepository) Delete(id string) error{
	ds := DS.DataStore()
	defer ds.S.Close()
	//先删除node里面绑定的App和app对应的task
	coll := ds.S.DB(database).C(applicationScheme)
	app_list := make([]domain.Application, 0)
	err := coll.Find(bson.M{"nodeid":id}).All(&app_list)
	if err != nil {
		log.Println("Find node application failed!" + err.Error())
		return err
	}
	err = coll.Remove(bson.M{"nodeid":id})
	if err != nil {
		log.Println("Delete node application failed!" + err.Error())
		return err
	}
	coll = ds.S.DB(database).C(taskScheme)
	for i:=0; i<len(app_list); i++ {
		app_id := app_list[i].Id
		err = coll.Remove(bson.M{"appid":app_id.Hex()})
		if err != nil {
			log.Println("Remove node application task failed!" + err.Error())
			return err
		}
	}
	//正片开始，删除node
	coll = ds.S.DB(database).C(nodeScheme)
	err = coll.Remove(bson.M{"_id": bson.ObjectIdHex(id)})
	if err != nil {
		log.Println("Delete application failed!" + err.Error())
		return err
	}
	return nil
}
