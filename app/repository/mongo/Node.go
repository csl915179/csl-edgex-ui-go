package mongo

import (
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"gopkg.in/mgo.v2/bson"
	"log"
)

type NodeMongoRepository struct {
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

	coll := ds.S.DB(database).C(nodeScheme)
	err := coll.Remove(bson.M{"_id": bson.ObjectIdHex(id)})
	if err != nil {
		log.Println("Delete application failed!" + err.Error())
		return err
	}
	return nil
}
