package mongo

import (
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"gopkg.in/mgo.v2/bson"
	"log"
)

type TaskMongoRepository struct {
}

func (ar *TaskMongoRepository) Insert(t *domain.Task) (string, error) {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(taskScheme)
	err := coll.Insert(t)
	if err != nil {
		log.Println("Insert task failed !")
		return "", err
	}
	//修改Application中信息
	appid := t.AppID
	coll = ds.S.DB(database).C(applicationScheme)
	result := domain.Application{}
	err = coll.Find(bson.M{"_id": bson.ObjectIdHex(appid)}).One(&result)
	if err != nil{
		log.Println("Select application failed!(2)" + err.Error())
	}
	result.TaskNum += 1
	err = coll.UpdateId(result.Id, &result)
	if err != nil{
		log.Println("Update application failed!(2)" + err.Error())
	}
	return t.Id.Hex(), nil
}

func (ar *TaskMongoRepository) Delete(id string) error {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(taskScheme)
	t := domain.Task{}
	err := coll.Find(nil).One(&t)
	if err != nil {
		log.Println("Delete task failed!" + err.Error())
		return err
	}
	//先删除Task本身
	err = coll.Remove(bson.M{"_id": bson.ObjectIdHex(id)})
	if err != nil {
		log.Println("Delete task failed!" + err.Error())
		return err
	}
	//修改Application中信息
	appid := t.AppID
	coll = ds.S.DB(database).C(applicationScheme)
	result := domain.Application{}
	err = coll.Find(bson.M{"_id": bson.ObjectIdHex(appid)}).One(&result)
	if err != nil{
		log.Println("Select application failed!(2)" + err.Error())
	}
	result.TaskNum -= 1
	err = coll.UpdateId(result.Id, &result)
	if err != nil{
		log.Println("Update application failed!(2)" + err.Error())
	}
	return nil
}

func (ar *TaskMongoRepository) SelectAll(appid string) ([]domain.Task, error) {
	// 根据appid 查询相关的task
	ds := DS.DataStore()
	defer ds.S.Close()
	coll := ds.S.DB(database).C(taskScheme)

	result := make([]domain.Task, 0)
	err := coll.Find(bson.M{"appid": appid}).All(&result)
	if err != nil {
		log.Println("SelectAll failed!")
		return nil, err
	}
	//log.Println(result)
	return result, nil
}

func (ar *TaskMongoRepository) SelectAllWait() ([]domain.Task, error) {
	//  查询所有等待执行的task
	ds := DS.DataStore()
	defer ds.S.Close()
	coll := ds.S.DB(database).C(taskScheme)
	state := "等待执行"
	result := make([]domain.Task, 0)
	err := coll.Find(bson.M{"_state": state}).All(&result)
	if err != nil {
		log.Println("SelectAllWait failed!")
		return nil, err
	}
	return result, nil
}

func (ar *TaskMongoRepository) Select(id string) (domain.Task, error) {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(taskScheme)

	result := domain.Task{}
	err := coll.Find(nil).One(&result)
	if err != nil {
		log.Println("Select failed!")
		return result, err
	}
	return result, nil
}

func (ar *TaskMongoRepository) Exists(id string) (bool, error) {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(taskScheme)
	count, err := coll.Find(bson.M{"_id": bson.ObjectIdHex(id)}).Count()

	if err != nil {
		log.Println("Check task exists failed !")
		return false, err
	}

	return count > 0, nil
}

func (ar *TaskMongoRepository) Update(task domain.Task) error {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(taskScheme)

	err := coll.UpdateId(task.Id, &task)

	if err != nil {
		log.Println("Update task failed !")
		return err
	}

	return nil
}

func (ar *TaskMongoRepository) FindApp(id string) (domain.Application,error){
	ds := DS.DataStore()
	defer ds.S.Close()
	resultApp := domain.Application{}
	//先查出Task的appid
	coll := ds.S.DB(database).C(taskScheme)
	task := domain.Task{}
	err := coll.Find(nil).One(&task)
	if err != nil {
		log.Println("Delete task failed!" + err.Error())
		return resultApp,err
	}
	appid := task.AppID
	//再去查Application
	coll = ds.S.DB(database).C(applicationScheme)
	err = coll.Find(bson.M{"_id": bson.ObjectIdHex(appid)}).One(&resultApp)
	if err != nil{
		log.Println("Select application failed!(2)" + err.Error())
	}

	return resultApp,err
}