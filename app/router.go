/*******************************************************************************
 * Copyright © 2017-2018 VMware, Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 *
 * @author: Huaqiao Zhang, <huaqiaoz@vmware.com>
 *******************************************************************************/

package app

import (
	"net/http"

	"github.com/edgexfoundry/edgex-ui-go/app/component"
	"github.com/edgexfoundry/edgex-ui-go/app/controller"
	mux "github.com/gorilla/mux"
)

func InitRestRoutes() http.Handler {
	r := mux.NewRouter()

	s := r.PathPrefix("/api/v1").Subrouter()
	s.HandleFunc("/ping", ping).Methods(http.MethodGet)
	s.HandleFunc("/auth/login", controller.Login).Methods(http.MethodPost)
	s.HandleFunc("/auth/logout", controller.Logout).Methods(http.MethodGet)

	s.HandleFunc("/gateway", controller.QueryAllGateway).Methods(http.MethodGet)
	s.HandleFunc("/gateway", controller.AddGateway).Methods(http.MethodPost)
	s.HandleFunc("/gateway/{id}", controller.RemoveGateway).Methods(http.MethodDelete)
	s.HandleFunc("/gateway/proxy", controller.ProxyConfigGateway).Methods(http.MethodPost)

	s.HandleFunc("/exportshow", controller.ExportShow).Methods(http.MethodPost)

	s.HandleFunc("/profile/download", controller.DowloadProfile).Methods(http.MethodGet)
	//s.HandleFunc("/profile/ls", controller.FindProfileList_by_Service).Methods(http.MethodGet)

	//application manage
	s.HandleFunc("/application", controller.QueryAllApplication).Methods(http.MethodGet)
	s.HandleFunc("/application", controller.AddApplication).Methods(http.MethodPost)
	s.HandleFunc("/application", controller.UpdateApplication).Methods(http.MethodPut)
	s.HandleFunc("/application/{id}", controller.RemoveApplication).Methods(http.MethodDelete)

	// task manage
	s.HandleFunc("/task/{app_id}", controller.QueryAllTask).Methods(http.MethodGet)
	s.HandleFunc("/task", controller.AddTask).Methods(http.MethodPost)
	s.HandleFunc("/task", controller.UpdateTask).Methods(http.MethodPut)
	s.HandleFunc("/task/{id},{pid}", controller.RemoveTask).Methods(http.MethodDelete)

	s.HandleFunc("/schedule", controller.Schedule).Methods(http.MethodGet)
	s.HandleFunc("/schedule", controller.ScheduleConfirm).Methods(http.MethodPut)

	s.HandleFunc("/resource",controller.QueryAllResource).Methods(http.MethodGet)
	s.HandleFunc("/resource",controller.UpdateResource).Methods(http.MethodPut)
	s.HandleFunc("/resource",controller.AddResource).Methods(http.MethodPost)

	s1 := r.PathPrefix("").Subrouter()
	s1.HandleFunc("/ws", component.WebSocketHandler)

	return r
}

func ping(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte("pong"))
}
