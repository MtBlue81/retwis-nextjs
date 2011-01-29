
Ext.onReady(function() {

    Ext.BLANK_IMAGE_URL = 'http://extjs.cachefly.net/ext-3.2.1/resources/images/default/s.gif';
    Ext.QuickTips.init();
    Ext.Direct.addProvider(Ext.app.REMOTING_API);

    var me = this;
    me.recId = 1000;

    var session = sessionStorage["redis"] || "{}";
    console.log(session);

    var login = new Ext.ux.Signin({

        listeners : {
            'login': {
                scope: me,
                fn   : function(username, msg,  user) {
                    console.log("login: ",  username);
                    me.userName = username;
                    sessionStorage["redis"] = Ext.encode(user);

                    showDashboard();

                    login.close();
                }
            },

            'signin': {
                scope: me,
                fn   : function(msg) {
                    console.log(msg);

                    Ext.Msg.alert("",  msg);
                }
            },

            'error': {
                scope: me,
                fn   : function(msg) {
                    Ext.Msg.alert("",  msg);
                }
            }
        }

    });

    user.isLogin(Ext.decode(session),  function(err) {
        console.log("Session:",  err);

        if (err) {

            login.show();
            return;

        } else {

            me.userName = session.name;


            showDashboard();

        }

    });


    function showDashboard() {

        var me = this;

        var view = new Ext.ux.Dashboard({
            onLogout : function(userData) {

                login.on("logout",  function(msg) {
                    console.log(msg);
                    me.socket.disconnect();

                    Ext.Msg.alert("",  msg,  function() {
                        location.reload();
                    },  me);

                }, me);
                login.logout(userData,  function() {
                    sessionStorage.clear();

                });

            },
            user : me.userName
        });

        me.socket = new Ext.ux.util.SocketIO(null, {port: 3000, rememberTransport: false});

        me.socket.on('message', function(obj) {
            console.log("From WS:", obj);
            if (obj.err || !obj.post) {
                console.log(obj.err);
                return;
            }
            if (obj.name == me.userName) {
                console.log("my tweet");
                return;
            }

            var defaultData = {
                name: obj.name,
                message: obj.post,
                time: obj.time
            };

            var st = view.getStore()
            var r = new st.recordType(defaultData, ++me.recId);
            st.insert(0, r);


        });

        me.socket.connect();

    }


});
