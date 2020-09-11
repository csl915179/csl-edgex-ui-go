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

func AddNode(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var a domain.Node
	err := json.NewDecoder(r.Body).Decode(&a)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}
	repository.GetNodeRepos().Insert(&a)

}

func UpdateNode(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var a domain.Node
	err := json.NewDecoder(r.Body).Decode(&a)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}
	repository.GetNodeRepos().Update(a)
}

func QueryAllNode(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	nodeList, err := repository.GetNodeRepos().SelectAll()
	if err != nil {
		w.Write([]byte(err.Error()))
		return
	}
	result, _ := json.Marshal(&nodeList)
	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	w.Write(result)
}

func RemoveNode(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	err := repository.GetNodeRepos().Delete(id)
	if err != nil {
		http.Error(w, "", http.StatusServiceUnavailable)
		return
	}
}