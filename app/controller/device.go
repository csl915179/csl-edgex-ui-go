package controller

import (
	"bytes"
	"encoding/json"
	"github.com/edgexfoundry/device-sdk-go/pkg/startup"
	"github.com/edgexfoundry/edgex-ui-go/app/device"
	"github.com/edgexfoundry/edgex-ui-go/app/repository"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/edgexfoundry/edgex-ui-go/app/common"
)


func GetDeviceList(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	deviceList, err := repository.GetDeviceRepos().SelectAll()
	if err != nil {
		w.Write([]byte(err.Error()))
		return
	}
	result, _ := json.Marshal(&deviceList)
	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	w.Write(result)
}

func StartSimpledevice(w http.ResponseWriter, r *http.Request){
	//使用go语言的 goroutine 机制创建子进程来运行simple device示例
	go startSimpleDeviceThread()

	defer r.Body.Close()
	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	w.Write([]byte("starting"))
}

func StopSimpledevice(w http.ResponseWriter, r *http.Request)  {
	//todo 未找到关闭方法，暂时不做处理
	go startup.StopService()

	defer r.Body.Close()
	w.Header().Set(common.ContentTypeKey, common.JsonContentType)
	w.Write([]byte("stoping"))
}

func startSimpleDeviceThread(){
	device.Getboot("device-simple")
}




func putStop(){
	url := "http://10.109.24.136:49990/api/v1/device/Simple-Device-yxm/SwitchButton"
	log.Println("URL:>", url)
	item := "off"
	updateParams := `{"SwitchButton":"` + item + `"}`
	var jsonStr = []byte(updateParams)
	req, _ := http.NewRequest(http.MethodPut, url, bytes.NewBuffer(jsonStr))
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, _ := client.Do(req)
	log.Println("response Status:", resp.Status)
	log.Println("response Headers:", resp.Header)
	body, _ := ioutil.ReadAll(resp.Body)
	log.Println("response Body:", string(body))
}