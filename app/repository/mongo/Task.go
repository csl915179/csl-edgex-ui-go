package mongo

import (
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"gopkg.in/mgo.v2/bson"
	"log"
	"strconv"
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
	//修改相关任务数
	pid := t.Pid
	coll = ds.S.DB(database).C(applicationScheme)

	result := domain.Application{}
	err = coll.Find(bson.M{"_id": bson.ObjectIdHex(pid)}).One(&result)
	if err != nil{
		log.Println("Select application failed!(2)" + err.Error())
	}
	TaskNum,err := strconv.Atoi(result.TaskNum)
	TaskNum += 1
	result.TaskNum = strconv.Itoa(TaskNum)
	log.Print(result)
	err = coll.UpdateId(result.Id, &result)
	if err != nil{
		log.Println("Update application failed!(2)" + err.Error())
	}

	return t.Id.Hex(), nil
}

func (ar *TaskMongoRepository) Delete(pid, id string) error {
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(taskScheme)
	err := coll.Remove(bson.M{"_id": bson.ObjectIdHex(id)})
	if err != nil {
		log.Println("Delete task failed!" + err.Error())
		return err
	}
	//修改相关任务数
	coll = ds.S.DB(database).C(applicationScheme)

	log.Print(pid)
	result := domain.Application{}
	err = coll.Find(bson.M{"_id": bson.ObjectIdHex(pid)}).One(&result)
	if err != nil{
		log.Println("Select application failed!(2)" + err.Error())
	}
	TaskNum,err := strconv.Atoi(result.TaskNum)
	TaskNum -= 1
	result.TaskNum = strconv.Itoa(TaskNum)
	err = coll.UpdateId(result.Id, &result)
	if err != nil{
		log.Println("Update application failed!(2)" + err.Error())
	}
	return nil
}

func (ar *TaskMongoRepository) SelectAll(pid string) ([]domain.Task, error) {
	// 根据pid 查询相关的task
	ds := DS.DataStore()
	defer ds.S.Close()

	coll := ds.S.DB(database).C(taskScheme)

	result := make([]domain.Task, 0)
	err := coll.Find(bson.M{"_pid": pid}).All(&result)
	if err != nil {
		log.Println("SelectAll failed!")
		return nil, err
	}
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


