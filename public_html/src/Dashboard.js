Ext.ux.Dashboard = Ext.extend(Ext.Viewport, {

    constructor: function(config) {
        var me = this;

        me.userName = config.user;
        me.param = {};

        Ext.ux.Dashboard.superclass.constructor.call(me, Ext.apply(config,  {
            layout: 'border',
            items: [{
                // TODO 詳細パネル作成
                // TODO タグ機能つけよう
                // TODO コンポーネントもう少しわけよう
                region: 'east',
                collapsible: true,
                title : '詳細',
                html  : "<div><b>詳細パネル作るよ〜</b></div>",
                width : 200
            },{
                region: 'center',
                tbar : [{

                    xtype : 'label',
                    text  : 'メッセージ一覧'
                }, '->', {

                    text : 'Follow',
                    ref  : 'menu',
                    iconCls : 'menu-button',
                    disabled : true,
                    menu : [{

                        text  : 'Follow',
                        scale : 'medium',
                        iconCls : 'follow-button',
                        scope : me,
                        handler : function() {
                            var me = this;
                            var sel = Ext.getCmp('timeline').getSelectionModel().getSelected();
                            if (sel) {
                                var name = sel.data["name"];
                                if (name == me.userName) {
                                    Ext.Msg.alert("",  "It's you.");
                                } else {
                                    follower.doFollow(me.getUserData(),  name,  function(result) {
                                        console.log(result);
                                    });
                                }
                            }
                        }
                    },  {

                        text  : 'Remove',
                        scale : 'medium',
                        iconCls : 'remove-button',
                        scope : me,
                        handler : function() {
                            var me = this;
                            var sel = Ext.getCmp('timeline').getSelectionModel().getSelected();
                            if (sel) {
                                var name = sel.data["name"];
                                if (name == me.userName) {
                                    Ext.Msg.alert("",  "It's you.");
                                } else {
                                    follower.doRemove(me.getUserData(),  name,  function(result) {
                                        console.log(result);
                                    });
                                }
                            }
                        }

                    }]
                }, '-', {
                    text  : 'User',
                    scale : 'medium',
                    scope : me,
                    iconCls : 'user-button',
                    handler : function() {
                        var me = this;
                        me.param.user = me.getUserData();
                        console.log(me.param.user);
                        me.getStore().load();
                    }

                }, '-', {
                    text  : 'All',
                    scale : 'medium',
                    scope : me,
                    iconCls : 'all-users-button',
                    handler : function() {
                        var me = this;
                        me.param.user = {};
                        me.getStore().load();

                    }

                }, '-', {
                    text  : 'Logout',
                    scale : 'medium',
                    scope : me,
                    iconCls : 'logout-button',
                    handler : function() {
                        var me = this;
                        me.onLogout(me.getUserData());
                    }

                }],
                items:[{
                    xtype: 'grid',
                    listeners : {
                        'afterrender' : {
                            scope : me,
                            fn    : function(c) {
                                console.log("on render");
                                me.param.user = me.getUserData();
                                me.getStore().load();
                            }
                        }
                    },
                    id   : 'timeline',
                    sm: new Ext.grid.RowSelectionModel({
                        listeners: {
                            'selectionchange': {
                                scope: me,
                                fn : function(sm) {
                                    sm.grid.ownerCt.getTopToolbar().menu.setDisabled(sm.getCount()>0 ? false: true);

                                }
                            }
                        },
                        singleSelect:true
                    }),

                    colModel: new Ext.grid.ColumnModel({
                        defaults: {
                            sortable: false
                        },
                        columns: [
                            {id: 'name', header: '名前', dataIndex: 'name',  width: 100},
                            {header: 'メッセージ', dataIndex: 'message',  width:700},
                            {
                                header: '時間',
                                width : 180,
                                dataIndex: 'time',
                                xtype : 'datecolumn',
                                format : 'Y-m-d H:i:s'
                            }
                        ]
                    }),

                    store: {
                        root      : 'result',
                        autoLoad  : false,
                        paramOrder: ['user'],
                        xtype     :'directstore',
                        directFn  : timeline.getUserPost,
                        fields    : ['name', 'message', 'time'],
                        listeners : {
                            'beforeload': {
                                scope : me,
                                fn: function(st, opt) {
                                    st.setBaseParam('user', me.param.user || {});

                                }
                            },
                            'load': {
                                scope : me,
                                fn: function(st, rc, opt) {
                                //    Ext.each(rc,  function(r){
                                //        console.log(r);
                                //    });

                                }
                            },
                            'exception': {
                                scope : me,
                                fn: function(st, opt) {
                                    console.log(st,  opt);

                                }
                            }
                        }
                    },
                    viewConfig : {
                                     forceFit: true
                                 },
                    height : 450,
                    layout : 'fit',
                   // autoHeight:true
                }]

            },{
                region : 'south',
                xtype  : 'compositefield',
                height : 50,
                items : [{
                    xtype : 'label',
                    text  : 'メッセージ'

                }, {
                    xtype: 'textfield',
                    id: 'comment',
                    enableKeyEvents: true,
                    flex : 1,
                    listeners : {
                        'keyup' : {
                            scope : me,
                            fn    : function(f,  e) {
                                if(e.ctrlKey && e.getKey() === 13) {
                                    console.log("key up");
                                    me.postMessage();
                                }

                            }

                        }
                    }

                }, {
                    xtype: 'button',
                    text: '送信',
                    id  : "send",
                    width: 100,
                    scope : me,
                    handler: me.postMessage

                }]
            }]
        }));

    },

    getUserData : function() {

        return Ext.decode(sessionStorage["redis"]);

    },

    getStore : function() {

        return Ext.getCmp('timeline').getStore();

    },

    postMessage: function() {

        var me = this;

        var cmp = Ext.getCmp('comment');
        var text = cmp.getValue();

        console.log("Text:", text);
        console.log("Timeline", timeline);
        if(text !== '') {
            timeline.postData(me.getUserData(), text,  function(result){
                if (result.err) {
                    return;
                }
                var defaultData = {
                    name: result.name,
                    message: result.post,
                    time: result.time
                };

                var st = me.getStore()
                var r = new st.recordType(defaultData, ++me.recId);
                st.insert(0, r);


                console.log(result);
                cmp.setValue("");
                cmp.focus();
            });
        }

    }


});
