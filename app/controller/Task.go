package controller

import (
	"encoding/json"
	"github.com/edgexfoundry/edgex-ui-go/app/common"
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"github.com/edgexfoundry/edgex-ui-go/app/repository"
	"github.com/gorilla/mux"
	"log"
	"net/http"
)

func AddTask(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var t domain.Task
	err := json.NewDecoder(r.Body).Decode(&t)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		log.Print("err")
		return
	}
	repository.GetTaskRepos().Insert(&t)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		log.Print("err")
		return
	}
	return
}

func QueryAllTask(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	appid := vars["appid"]

	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	taskList, err := repository.GetTaskRepos().SelectAll(appid)
	if err != nil {
		w.Write([]byte(err.Error()))
		return
	}
	result, _ := json.Marshal(&taskList)
	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	w.Write(result)
}

func RemoveTask(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	err := repository.GetTaskRepos().Delete(id)
	if err != nil {
		http.Error(w, "", http.StatusServiceUnavailable)
		return
	}
}
func UpdateTask(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var t domain.Task
	err := json.NewDecoder(r.Body).Decode(&t)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}
	repository.GetTaskRepos().Update(t)
}

func FindTaskApp(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	app,err := repository.GetTaskRepos().FindApp(id)
	if err != nil {
		http.Error(w, "", http.StatusServiceUnavailable)
		return
	}
	result, _ := json.Marshal(&app)
	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	w.Write(result)
}