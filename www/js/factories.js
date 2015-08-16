angular.module('app.factories', [])

// Factory for wordpress-pushserver http://codecanyon.net/item/send-mobile-push-notification-messages/6548533, if you are using other push notifications server you need to change this
.factory('WpPushServer', function ($http, WORDPRESS_PUSH_URL){

  // Configure push notifications server address in  www/js/config.js

  return {
    // Stores the device token in a db
    // type:  Platform type (ios, android)
    storeDeviceToken: function(type, regId) {

      console.log("Stored token for registered device with data "+ 'device_token=' + regId + '&device_type='+ type);

      $http.post(WORDPRESS_PUSH_URL + 'savetoken/' +
        '?device_token=' + regId +
        '&device_type='+ type)
      .success(function (data, status) {
        console.log("Token stored, device is successfully subscribed to receive push notifications.");
      })
      .error(function (data, status) {
        console.log("Error storing device token." + data + " " + status);
      });
    }
  };
})





;
