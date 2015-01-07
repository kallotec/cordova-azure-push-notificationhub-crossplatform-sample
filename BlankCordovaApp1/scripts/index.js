
//azure notificationshub connection information
notificationHubPath = "<notitification hub name>";
connectionString = "<notification hub connection string>";
//sender id for google cloud services
var senderIdGCM = "<enter gcm id here>";
//tag registration (csv string), can be empty but not undefined
var registrationTagsCsv = "test1,test2";


var app = {

    Initialize: function () {
        //reg for onload event
        document.addEventListener('deviceready', app.onLoad, false);
    },

    onLoad: function () {

        app.log("Initializing...");

        //setup push notifications
        Pushman.Initialize(connectionString, notificationHubPath, senderIdGCM,
                           app.onNotificationRegistered, app.onNotificationUnRegistered,
                           app.onNotificationInline, app.onNotificationBackground, app.onNotificationError);

        //hookup cmd buttons
        $("#register").click(app.registerForPush);
        $("#unregister").click(app.unRegisterForPush);

        app.onAppReady();
    },

    registerForPush: function (a,c) {

        app.log("Registering...");
        //register for tags
        Pushman.RegisterForPushNotifications(registrationTagsCsv);

    },
    unRegisterForPush: function (a, c) {

        app.log("UnRegistering...");
        //register for tags
        Pushman.UnRegisterForPushNotifications();

    },
    

    onAppReady: function () {
        app.log("Ready");
    },

    onNotificationRegistered: function (msg) {
        app.log("Registered: " + msg.registrationId);
    },

    onNotificationUnRegistered: function () {
        app.log("UnRegistered");
    },

    onNotificationInline: function (data) {
        app.log("Inline Notification: " + data);
    },

    onNotificationBackground: function (data) {
        app.log("Background Notification: " + data);
    },

    onNotificationError: function (error) {
        app.log("Error: " + error);
    },

    log: function(msg) {
        $("#ul-app-status").append('<li>' + msg + "</li>");
    },

};
