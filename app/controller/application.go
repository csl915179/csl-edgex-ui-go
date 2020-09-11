package controller

import (
	"encoding/json"
	"github.com/edgexfoundry/edgex-ui-go/app/common"
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"github.com/edgexfoundry/edgex-ui-go/app/repository"
	"github.com/gorilla/mux"
	"net/http"
)

func AddApplication(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var a domain.Application
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}
	repository.GetApplicationRepos().Insert(&a)

}

func UpdateApplication(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var a domain.Application
	err := json.NewDecoder(r.Body).Decode(&a)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}
	repository.GetApplicationRepos().Update(a)
}

func QueryAllApplication(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	applicationList, err := repository.GetApplicationRepos().SelectAll()
	if err != nil {
		w.Write([]byte(err.Error()))
		return
	}
	result, _ := json.Marshal(&applicationList)
	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	w.Write(result)
}

func RemoveApplication(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	vars := mux.Vars(r)
	id := vars["id"]
	err := repository.GetApplicationRepos().Delete(id)
	if err != nil {
		http.Error(w, "", http.StatusServiceUnavailable)
		return
	}
}

func FindApplicationByNode(w http.ResponseWriter, r *http.Request)  {
	defer r.Body.Close()
	vars := mux.Vars(r)
	nodeid := vars["nodeid"]

	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	appList, err := repository.GetApplicationRepos().FindNode(nodeid)
	if err != nil {
		w.Write([]byte(err.Error()))
		return
	}
	result, _ := json.Marshal(&appList)
	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	w.Write(result)
}