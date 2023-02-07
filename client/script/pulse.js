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
          })
          

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
            console.log(JSON.stringify(value))
            send_result(value);
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

          function send_result(value) {

            $.ajax({
              url: '/getResults',
              type: 'POST',
              dataType: 'json',
              data: JSON.stringify(value),
              contentType: 'application/json; charset=utf-8',
              success: function(msg) {
                  console.log(msg);
              }
          });

          }


      });

    }