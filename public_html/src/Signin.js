Ext.ux.Signin = Ext.extend(Ext.Window, {

    constructor : function(config) {
        var me = this;
        Ext.ux.Signin.superclass.constructor.call(me, Ext.apply(config, {

            title  : "ログイン/登録",

            width  : 300,

            height : 200,

            defaults : {
                frame  : true,
                layout : "form",
            },

            layout : "accordion",

            items  : [{

                title : "ログイン",

                items : [{
                    ref    : "username",
                    xtype  : "textfield",
                  //  value  : "aoyama",
                    fieldLabel : "ユーザ名"

                },  {
                    ref    : "password",
                    xtype  : "textfield",
                  //  value  : "aoyama",
                    fieldLabel : "パスワード",
                    inputType  : "password"
                }],

                buttons : [{
                    text : "login",
                    handler : function(btn) {
                        console.log(btn);
                        var form = btn.ownerCt.ownerCt;

                        var username = form.username.getValue();

                        user.login(username,  form.password.getValue(),  function(result){
                            console.log("on Login:", result.err || result.result);

                            if (result.err) {

                                me.fireEvent("error", result.err);

                            } else {

                                me.fireEvent("login", username, result.result,  result.user);

                            }

                        });
                    }
                }]

            },  {

                title : "登録",

                items : [{
                    ref    : "username",
                    xtype  : "textfield",
                    fieldLabel : "ユーザ名"

                },  {
                    ref    : "password",
                    xtype  : "textfield",
                    fieldLabel : "パスワード",
                    inputType  : "password"

                },  {

                    xtype  : "textfield",
                    ref    : "password2",
                    fieldLabel : "確認",
                    inputType  : "password",
                    msgTarget : "side",
                    validator : function(value) {

                        var me = this;
                        var ct = me.ownerCt;

                        if (value == ct.password.getValue()) {
                            console.log(ct);
                            ct.buttons[0].enable();
                            return true;
                        }

                        ct.buttons[0].disable();

                        return "パスワードが一致しません";

                    }
                }],

                buttons : [{
                    text : "signin",
                    disabled : true,
                    handler : function(btn) {
                        console.log(btn);
                        var form = btn.ownerCt.ownerCt;
                        if (!form.password2.isValid()) {
                            return;
                        }
                        var username = form.username.getValue(),
                            password = form.password2.getValue();

                        user.signup(username, password,  function(result){

                            console.log("on Signin:", result.err || result.result);

                            if (result.err) {

                                me.fireEvent("error", result.err);

                            } else {

                                me.fireEvent("signin", result.result);

                                user.login(username,  form.password.getValue(),  function(result){
                                    console.log("on Login:", result.err || result.result);

                                    if (result.err) {

                                        me.fireEvent("error", result.err);

                                    } else {

                                        me.fireEvent("login", username, result.result,  result.user);

                                    }

                                });


                            }

                        });

                    }
                }]
            }]
        }));
    },

    initEvents : function() {
        var me = this;
        Ext.ux.Signin.superclass.initEvents.call(me);
        console.log("Init Event");
        me.addEvents(
            "login",
            "logout",
            "signin",
            "error"
        );
    },

    logout : function(userData) {
        var me = this;

        user.logout(userData,  function(result){
            console.log("logout : ",  result);

            if (result.err) {

                me.fireEvent("error", result.err);

            } else {

                me.fireEvent("logout", result.result);

            }

        });

    }

});
