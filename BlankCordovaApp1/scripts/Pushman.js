


///a "class" wrapping the PushPlug and AzureNotificationHub plugins in a simple service for consumers.
///the two plugins are used together because the actual notifications only work with PushPlug, and only the NotificationsHub 
///plugin works with Azure Notifications Hub for tag registration.
var Pushman = {
    
    Initialize: function (hubConnString, hubName, gcmSenderId, callbackRegistered, callbackUnRegistered, callbackInlineNotification, callbackBackgroundNotification, callbackError) {

        //store connection and callback information on app startup for Push Registration later
        Pushman.HubConnectionString = hubConnString;
        Pushman.HubName = hubName;
        Pushman.GcmSenderId = gcmSenderId;

        //callbacks
        Pushman.RegisteredCallback = callbackRegistered;
        Pushman.UnRegisteredCallback = callbackUnRegistered;
        Pushman.NotificationForegroundCallback = callbackInlineNotification;
        Pushman.NotificationBackgroundCallback = callbackBackgroundNotification;
        Pushman.ErrorCallback = callbackError;

    },

    RegisterForPushNotifications: function (tags)
    {
        //setup Azure Notification Hub registration
        Pushman.Hub = new WindowsAzure.Messaging.NotificationHub(Pushman.HubName, Pushman.HubConnectionString, Pushman.GcmSenderId);
        Pushman.Hub.registerApplicationAsync(tags).then(Pushman.onRegistered, Pushman.onError);

        //setup PushPlugin registration
        Pushman.Push = window.plugins.pushNotification;

        //register depending on device being run
        if (device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos") {

            //android
            Pushman.Push.register(Pushman.onRegistered, Pushman.onError,
            {
                "senderID": Pushman.GcmSenderId,
                "ecb": "Pushman.onAndroidNotification"
            });

        } else {

            //iOS
            Pushman.Push.register(Pushman.tokenHandler, Pushman.onError,
            {
                "badge": "true",
                "sound": "false",
                "alert": "true",
                "ecb": "Pushman.onIOSNotification"
            });

        }
    },

    UnRegisterForPushNotifications: function () {

        if (Pushman.Hub != null) {

            //dont pass through error handler

            //unreg azure
            Pushman.Hub.unregisterApplicationAsync()
               .then(Pushman.onUnRegistered, null);

            //unreg native
            Pushman.Push.unregister(Pushman.onUnRegistered, null);

        }

    },

    onRegistered: function (msg) {
        Pushman.log("Registered: " + msg.registrationId);

        //only call callback if registrationId actually set
        if (msg.registrationId.length > 0 && Pushman.RegisteredCallback != null) {
            Pushman.RegisteredCallback(msg);
        }
    },

    onUnRegistered: function () {
        Pushman.log("UnRegistered");

        if (Pushman.UnRegisteredCallback != null) {
            Pushman.UnRegisteredCallback();
        }
    },

    onInlineNotification: function (msg) {
        Pushman.log("OnInlineNotification: " + msg);

        if (Pushman.NotificationForegroundCallback != null) {
            Pushman.NotificationForegroundCallback(msg);
        }
    },

    onBackgroundNotification: function (msg) {
        Pushman.log("OnBackgroundNotification: " + msg);

        if (Pushman.NotificationBackgroundCallback != null) {
            Pushman.NotificationBackgroundCallback(msg);
        }
    },

    onColdStartNotification: function (msg) {
        Pushman.log("OnColdStartNotification: " + msg);

        if (Pushman.NotificationBackgroundCallback != null) {
            Pushman.NotificationBackgroundCallback(msg);
        }
    },

    onError: function (error) {
        Pushman.log("Error: " + error);

        if (Pushman.ErrorCallback != null) {
            Pushman.ErrorCallback(error);
        }
    },

    onAndroidNotification: function (e) {

        switch (e.event) {
            case 'registered':

                if (e.regid.length > 0) {
                    Pushman.onRegistered("Registered");
                }
                break;

            case 'message':

                if (e.foreground) {

                    //if this flag is set, this notification happened while app in foreground
                    Pushman.onInlineNotification(e.payload.message);

                } else {

                    //otherwise app launched because the user touched a notification in the notification tray.
                    if (e.coldstart) {
                        //app was closed
                        Pushman.onColdStartNotification(e.payload.message);
                    }
                    else {
                        //app was minimized
                        Pushman.onBackgroundNotification(e.payload.message);
                    }
                }
                break;

            case 'error':
                Pushman.onError(e.msg);
                break;

            default:
                Pushman.onError("Unknown message");
                break;
        }
    },

    onIOSNotification: function (event) {

        //TODO: not sure how ios works re cold start vs inline msg types?

        if (event.alert) {
            navigator.notification.alert(event.alert);
        }
        if (event.badge) {
            Push.setApplicationIconBadgeNumber(app.successHandler, app.errorHandler, event.badge);
        }
    },

    tokenHandler: function (result) {
        // iOS - not sure its use though appears somewhat important

        // Your iOS push server needs to know the token before it can push to this device
        // here is where you might want to send it the token for later use.
        alert('device token = ' + result);

    },

    log: function (msg) {
        console.log(msg);
    },

}

///"class" variables - not sure how to put them into the js "class"
Pushman.Push = null;
Pushman.Hub = null;
Pushman.HubConnectionString = null;
Pushman.HubName = null;
Pushman.GcmSenderId = null;
Pushman.NotificationForegroundCallback = null;
Pushman.NotificationBackgroundCallback = null;
Pushman.RegisteredCallback = null;
Pushman.UnRegisteredCallback = null;
Pushman.ErrorCallback = null;
