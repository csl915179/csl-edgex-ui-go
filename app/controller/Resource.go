package controller

import (
	"encoding/json"
	"github.com/edgexfoundry/edgex-ui-go/app/common"
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"github.com/edgexfoundry/edgex-ui-go/app/repository"
	"net/http"
)

func AddResource(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var a domain.Resource
	err := json.NewDecoder(r.Body).Decode(&a)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}
	repository.GetResourceRepos().Insert(&a)
}

func UpdateResource(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var a domain.Resource
	err := json.NewDecoder(r.Body).Decode(&a)
	if err != nil {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}
	repository.GetResourceRepos().Update(a)
}
func QueryAllResource(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	resourceList, err := repository.GetResourceRepos().SelectAll()
	if err != nil {
		w.Write([]byte(err.Error()))
		return
	}
	result, _ := json.Marshal(&resourceList)
	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	w.Write(result)
}
