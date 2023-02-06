(function() {
  'use strict';

  class HeartRateSensor {
    constructor() {
      this.device = null;
      this.server = null;
      this._characteristics = new Map();
      //const heart_rate = 0x1810;
      //const 0x2A35 = 0x2A35
    }
    /*connect() {
      return navigator.bluetooth.requestDevice({filters:[{services:[ 'heart_rate' ]}]})
      .then(device => {
        this.device = device;
        return device.gatt.connect();
      })
      .then(server => {
        this.server = server;
        return server.getPrimaryService('heart_rate');
      })
      .then(service => {
        return this._cacheCharacteristic(service, '0x2A35');
      })
    }*/
    connect(device1) {
        this.device = device1;
        console.log(device1)
        device1.gatt.connect()
      .then(server => {
        this.server = server;
        
        return server.getPrimaryService(0x180D);
      })
      .then(service => {
        return this._cacheCharacteristic(service, 4);
      })
    }

    /* Heart Rate Service */

    startNotificationsHeartRateMeasurement() {
      return this._startNotifications(4);
    }
    stopNotificationsHeartRateMeasurement() {
      return this._stopNotifications(4);
    }
    parseHeartRate(value) {
      // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      value = value.buffer ? value : new DataView(value);
      let flags = value.getUint8(0);
      let rate16Bits = flags & 0x1;
      let result = {};
      let index = 1;
      if (rate16Bits) {
        result.heartRate = value.getUint16(index, /*littleEndian=*/true);
        index += 2;
      } else {
        result.heartRate = value.getUint8(index);
        index += 1;
      }
      let contactDetected = flags & 0x2;
      let contactSensorPresent = flags & 0x4;
      if (contactSensorPresent) {
        result.contactDetected = !!contactDetected;
      }
      let energyPresent = flags & 0x8;
      if (energyPresent) {
        result.energyExpended = value.getUint16(index, /*littleEndian=*/true);
        index += 2;
      }
      let rrIntervalPresent = flags & 0x10;
      if (rrIntervalPresent) {
        let rrIntervals = [];
        for (; index + 1 < value.byteLength; index += 2) {
          rrIntervals.push(value.getUint16(index, /*littleEndian=*/true));
        }
        result.rrIntervals = rrIntervals;
      }
      
      return result;
    }

    /* Utils */

    _cacheCharacteristic(service, characteristicUuid) {
      return service.getCharacteristic(characteristicUuid)
      .then(characteristic => {
        this._characteristics.set(characteristicUuid, characteristic);
      });
    }
    _readCharacteristicValue(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      return characteristic.readValue()
      .then(value => {
        // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
        value = value.buffer ? value : new DataView(value);
        return value;
      });
    }
    _writeCharacteristicValue(characteristicUuid, value) {
      let characteristic = this._characteristics.get(characteristicUuid);
      return characteristic.writeValue(value);
    }
    _startNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to set up characteristicvaluechanged event
      // handlers in the resolved promise.
      return characteristic.startNotifications()
      //.then(() => characteristic);
    }
    _stopNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to remove characteristicvaluechanged event
      // handlers in the resolved promise.
      return characteristic.stopNotifications()
      //.then(() => characteristic);
    }
  }

  window.heartRateSensor = new HeartRateSensor();

})();
window.onload = () => {
      heart_icon = document.getElementById('heart_ico');
      heart_icon.style.visibility = "hidden";
      beat = false;
      const button = document.getElementById('pair');
      const button1 = document.getElementById('getVal');
let device1;
//1, 3, 7
      parseValue = (value) => {
        // В Chrome 50+ используется DataView.
        value = value.buffer ? value : new DataView(value);
        let flags = value.getUint8(0);

        // Определяем формат
        let rate16Bits = flags & 0x1;
        let result = {};
        let index = 1;
        

        // Читаем в зависимости от типа
        if (rate16Bits) {
          result.SYS = value.getUint16(index, /*littleEndian=*/true);
          index = 3;
          result.DIA = value.getUint16(index, true);
          index = 7;
          result.PUL = value.getUint16(index, true);
          result.Artim = value.getUint16(9, true);
        } else {
          result.SYS = value.getUint8(index);
          index = 3;
          result.DIA = value.getUint8(index);
          index = 7;
          result.PUL = value.getUint8(index);
          result.Artim = value.getUint8(9);
        }


        // RR интервалы

       /* let rrIntervalPresent = flags & 0x10;
        if (rrIntervalPresent) {
          let rrIntervals = [];
          for (; index + 1 < value.byteLength; index += 2) {
            rrIntervals.push(value.getUint16(index,true));
          }
          result.rrIntervals = rrIntervals;
        }*/

        return result;
      }

      button.addEventListener('pointerup', function(event) {
        navigator.bluetooth.requestDevice({acceptAllDevices:true, 
         optionalServices: [0x1800, 0x1801,0x2A25, 0x180A, 0x2A00, 0x1810]})
          .then((device) => {
            device1 = device;
            
            //console.log(server.getPrimaryService(0x180A).getCharacteristic(0x2A25))
            return device1.gatt.connect();

            //return device.gatt.disconnect();
            console.log(device1);

          })
          

/*          function handleCharacteristicValueChanged(event) {
            var value = event.target.value;
            console.log(parseValue(value));
            console.log(value);
            // See https://github.com/WebBluetoothCG/demos/blob/gh-pages/heart-rate-sensor/heartRateSensor.js
          }*/
      });

      let value;
      let sys = 0;
      let dia = 0;
      let pul = 0;
      button1.addEventListener('pointerup', function(){
        
          beat = false;
          document.getElementById("SYS_id").innerHTML = "Loading";
          document.getElementById("DIA_id").innerHTML = "Loading";
          document.getElementById("PUL_id").innerHTML = "Loading";

          /*device1.gatt.getPrimaryService(0x180A)
            .then(service => {
              return service.getCharacteristic(0x2A25)
            })
            .then(characteristic => {
              console.log(characteristic)
            })
            return server.getPrimaryService(0x1810);*/
          
          function discoverServicesAndCharacteristics() {
          return device1.gatt
            .getPrimaryServices()
            .then(services => {
              let queue = Promise.resolve();
              services.forEach(service => {
                queue = queue.then(_ =>
                  service.getCharacteristics().then(characteristics => {
                    console.log("> Service: " + service.uuid);
                    characteristics.forEach(characteristic => {
                      console.log(
                        ">> Characteristic: " +
                          characteristic.uuid +
                          " " +
                          characteristic
                      );
                    });
                  })
                );
              });
              return queue;
            })
            .catch(error => {
              console.log(error.message);
            });
        }
        discoverServicesAndCharacteristics()
          device1.gatt.connect().then(server => {
            return server.getPrimaryService(0x180A);
          })
          .then(service => {
            return service.getCharacteristic(0x2A25);
          })
          .then(characteristic => {
            console.log(characteristic)
            //console.log(characteristic.startNotifications());
            return characteristic.startNotifications();
          })
          .then(characteristic => {
            console.log(characteristic.readValue)
            characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
          })
          /*.catch(error => { console.log(error); });*/  


          device1.gatt.connect().then(server => {
            
            return server.getPrimaryService(0x1810);
          })
          .then(service => {
            //console.log(service.getCharacteristic(0x2A35))
            return service.getCharacteristic(0x2A35);
          })
          .then(characteristic => {
            //console.log(characteristic.startNotifications());
            return characteristic.startNotifications();
          })
          
          .then(characteristic => {
            characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
          })
          .catch(error => { console.log(error); });
          

           function handleCharacteristicValueChanged(event) {
            var val = event.target.value;
            console.log(val)
            value = parseValue(val);
            show_result(value);
            console.log(value);
            // See https://github.com/WebBluetoothCG/demos/blob/gh-pages/heart-rate-sensor/heartRateSensor.js
          }
          function show_result(value){
            
            document.getElementById("SYS_id").innerHTML = value.SYS;
                document.getElementById("DIA_id").innerHTML = value.DIA;
                document.getElementById("PUL_id").innerHTML = value.PUL;
            var i = 1;                  //  set your counter to 1

            function myLoop() {         //  create a loop function
                setTimeout(function() {   //  call a 3s setTimeout when the loop is called
                if (i % 2 == 0){
                    heart_icon.style.width = "40pt"; heart_icon.style.heigth = "40pt";
                    heart_icon.style.paddingLeft = "15px";   //  your code here
                
                }
                else{
                    heart_icon.style.width = "50pt"; heart_icon.style.heigth = "50pt";   //  your code here
                    heart_icon.style.paddingLeft = "5px";
                }
                i++;                    //  increment the counter
                if (i < 400) {           //  if the counter < 10, call the loop function
                  myLoop();             //  ..  again which will trigger another 
                }                       //  ..  setTimeout()
              }, 300)
            }

            if (value.Artim == 4){
                heart_icon.style.visibility = "visible";
                   myLoop();
                
            }
          }

      });

      function handleHeartRateMeasurement(heartRateMeasurement) {
        heartRateMeasurement.addEventListener('characteristicvaluechanged', event => {
          var heartRateMeasurement = heartRateSensor.parseHeartRate(event.target.value);
          statusText.innerHTML = heartRateMeasurement.heartRate + ' &#x2764;';
          heartRates.push(heartRateMeasurement.heartRate);
          drawWaves();
        });
      }

    }