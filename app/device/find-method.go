package device

import device20191104 "github.com/edgexfoundry/edgex-ui-go/app/device/device-20191104"

func Getboot(name string){
	switch name{
		case "device-simple":
			go device20191104.Boot()
	}
}