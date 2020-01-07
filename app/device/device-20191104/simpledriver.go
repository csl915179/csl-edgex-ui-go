// -*- Mode: Go; indent-tabs-mode: t -*-
//
// Copyright (C) 2018 Canonical Ltd
// Copyright (C) 2018-2019 IOTech Ltd
//
// SPDX-License-Identifier: Apache-2.0

// This package provides a simple example implementation of
// ProtocolDriver interface.
//
package device20191104

import (
	"bytes"
	"fmt"
	"github.com/edgexfoundry/device-sdk-go/pkg/startup"
	"github.com/edgexfoundry/edgex-ui-go/app/domain"
	"github.com/edgexfoundry/edgex-ui-go/app/repository"
	"image"
	"image/jpeg"
	"image/png"
	"log"
	"math/rand"
	"os"
	"time"

	dsModels "github.com/edgexfoundry/device-sdk-go/pkg/models"
	"github.com/edgexfoundry/go-mod-core-contracts/clients/logger"
	contract "github.com/edgexfoundry/go-mod-core-contracts/models"
)

type SimpleDriver struct {
	lc           logger.LoggingClient
	asyncCh      chan<- *dsModels.AsyncValues
	switchButton bool
	xRotation    int32
	yRotation    int32
	zRotation    int32
}

func Pin(){
	fmt.Println("OK")
}

func getImageBytes(imgFile string, buf *bytes.Buffer) error {
	// Read existing image from file
	img, err := os.Open(imgFile)
	if err != nil {
		return err
	}
	defer img.Close()

	// TODO: Attach MediaType property, determine if decoding
	//  early is required (to optimize edge processing)

	// Expect "png" or "jpeg" image type
	imageData, imageType, err := image.Decode(img)
	if err != nil {
		return err
	}
	// Finished with file. Reset file pointer
	img.Seek(0, 0)
	if imageType == "jpeg" {
		err = jpeg.Encode(buf, imageData, nil)
		if err != nil {
			return err
		}
	} else if imageType == "png" {
		err = png.Encode(buf, imageData)
		if err != nil {
			return err
		}
	}
	return nil
}

var ConfDir = "../../app/device/device-20191104/res"

// Initialize performs protocol-specific initialization for the device
// service.
func (s *SimpleDriver) Initialize(lc logger.LoggingClient, asyncCh chan<- *dsModels.AsyncValues) error {
	s.lc = lc
	s.asyncCh = asyncCh
	return nil
}

// HandleReadCommands triggers a protocol Read operation for the specified device.
func (s *SimpleDriver) HandleReadCommands(deviceName string, protocols map[string]contract.ProtocolProperties, reqs []dsModels.CommandRequest) (res []*dsModels.CommandValue, err error) {
	s.lc.Debug(fmt.Sprintf("SimpleDriver.HandleReadCommands: protocols: %v resource: %v attributes: %v", protocols, reqs[0].DeviceResourceName, reqs[0].Attributes))

	if len(reqs) == 1 {
		res = make([]*dsModels.CommandValue, 1)
		now := time.Now().UnixNano()
		if reqs[0].DeviceResourceName == "SwitchButton" {
			cv, _ := dsModels.NewBoolValue(reqs[0].DeviceResourceName, now, s.switchButton)
			res[0] = cv
		}else if reqs[0].DeviceResourceName == "randomnumber" {
    			cv, _ := dsModels.NewInt32Value(reqs[0].DeviceResourceName, now, int32(rand.Intn(100)))
			res[0] = cv
		}else if reqs[0].DeviceResourceName == "Image" {
			// Show a binary/image representation of the switch's on/off value
			buf := new(bytes.Buffer)
			if s.switchButton == true {
				err = getImageBytes("./res/on.png", buf)
			} else {
				err = getImageBytes("./res/off.jpg", buf)
			}
			cvb, _ := dsModels.NewBinaryValue(reqs[0].DeviceResourceName, now, buf.Bytes())
			res[0] = cvb
		}
	} else if len(reqs) == 3 {
		res = make([]*dsModels.CommandValue, 3)
		for i, r := range reqs {
			var cv *dsModels.CommandValue
			now := time.Now().UnixNano()
			switch r.DeviceResourceName {
			case "Xrotation":
				cv, _ = dsModels.NewInt32Value(r.DeviceResourceName, now, s.xRotation)
			case "Yrotation":
				cv, _ = dsModels.NewInt32Value(r.DeviceResourceName, now, s.yRotation)
			case "Zrotation":
				cv, _ = dsModels.NewInt32Value(r.DeviceResourceName, now, s.zRotation)
			}
			res[i] = cv
		}
	}

	return
}

// HandleWriteCommands passes a slice of CommandRequest struct each representing
// a ResourceOperation for a specific device resource.
// Since the commands are actuation commands, params provide parameters for the individual
// command.
func (s *SimpleDriver) HandleWriteCommands(deviceName string, protocols map[string]contract.ProtocolProperties, reqs []dsModels.CommandRequest,
	params []*dsModels.CommandValue) error {
	s.lc.Debug(fmt.Sprintf("SimpleDriver.HandleWriteCommands: protocols: %v, resource: %v, parameters: %v", protocols, reqs[0].DeviceResourceName, params))
	var err error
	if len(reqs) == 1 {
		if s.switchButton, err = params[0].BoolValue(); err != nil {
			err := fmt.Errorf("SimpleDriver.HandleWriteCommands; the data type of parameter should be Boolean, parameter: %s", params[0].String())
			return err
		}
	} else if len(reqs) == 3 {
		for i, r := range reqs {
			switch r.DeviceResourceName {
			case "Xrotation":
				if s.xRotation, err = params[i].Int32Value(); err != nil {
					err := fmt.Errorf("SimpleDriver.HandleWriteCommands; the data type of parameter should be Int32, parameter: %s", params[i].String())
					return err
				}
			case "Yrotation":
				if s.yRotation, err = params[i].Int32Value(); err != nil {
					err := fmt.Errorf("SimpleDriver.HandleWriteCommands; the data type of parameter should be Int32, parameter: %s", params[i].String())
					return err
				}
			case "Zrotation":
				if s.zRotation, err = params[i].Int32Value(); err != nil {
					err := fmt.Errorf("SimpleDriver.HandleWriteCommands; the data type of parameter should be Int32, parameter: %s", params[i].String())
					return err
				}
			}
		}
	}

	return nil
}

// Stop the protocol-specific DS code to shutdown gracefully, or
// if the force parameter is 'true', immediately. The driver is responsible
// for closing any in-use channels, including the channel used to send async
// readings (if supported).
func (s *SimpleDriver) Stop(force bool) error {
	// Then Logging Client might not be initialized
	if s.lc != nil {
		s.lc.Debug(fmt.Sprintf("SimpleDriver.Stop called: force=%v", force))
	}
	return nil
}

// AddDevice is a callback function that is invoked
// when a new Device associated with this Device Service is added
func (s *SimpleDriver) AddDevice(deviceName string, protocols map[string]contract.ProtocolProperties, adminState contract.AdminState) error {
	s.lc.Debug(fmt.Sprintf("a new Device is added: %s", deviceName))
	return nil
}

// UpdateDevice is a callback function that is invoked
// when a Device associated with this Device Service is updated
func (s *SimpleDriver) UpdateDevice(deviceName string, protocols map[string]contract.ProtocolProperties, adminState contract.AdminState) error {
	s.lc.Debug(fmt.Sprintf("Device %s is updated", deviceName))
	return nil
}

// RemoveDevice is a callback function that is invoked
// when a Device associated with this Device Service is removed
func (s *SimpleDriver) RemoveDevice(deviceName string, protocols map[string]contract.ProtocolProperties) error {
	s.lc.Debug(fmt.Sprintf("Device %s is removed", deviceName))
	return nil
}

func Boot(){
	device_name := "device-simple"
	localConfProfile := ""
	localConfDir := ConfDir
	sd := SimpleDriver{}

	//查询有没有device-simple, 没有的话在数据库中加入设备服务
	exi,err := repository.GetDeviceRepos().Exists(device_name)
	if err == nil {
		log.Println("deviceexist =",exi)
		if exi == false{
			regist(device_name, localConfProfile, localConfDir)
		}
	}

	//修改mongo中的值
	g, err := repository.GetDeviceRepos().GetDevice(device_name)
	if err != nil{
		log.Println(err)
	}
	g.InUse = true
	err = repository.GetDeviceRepos().Update(g)
	if err != nil{
		log.Println(err)
	}

	log.Println(localConfDir)
	log.Println(localConfProfile)
	startup.Bootstrap(device_name, "1.0.0", &sd, localConfProfile, localConfDir)
}

func regist(deviceName string, localprofile string, localconfigdir string) error{
	log.Printf("regist device service %s in mongo\n",deviceName)
	var g domain.Device
	g.Name = deviceName
	g.Localprofile = localprofile
	g.Configdir = localconfigdir
	g.InUse = false
	id,err := repository.GetDeviceRepos().Insert(&g)
	if err == nil{
		log.Println("ID=",id)
	}
	return nil
}