const {
  ipcRenderer,
  contextBridge
} = require("electron");

contextBridge.exposeInMainWorld("api", {
  selectCore: function({ core }){
    ipcRenderer.send("main:selectCore",{ core });
  },
  submitConf: function({ authServer, whoamiServer, dohServer, token }){
    ipcRenderer.send("main:submitConf",{ authServer, whoamiServer, dohServer, token });
  },
  tunCores: function(func){
    ipcRenderer.on("main:tunCores", (event,cores) => func(event, cores));
  },
  tunCoreSelectedStatus: function(func){
    ipcRenderer.on("main:tunCoreSelectedStatus", (event,status) => func(event, status));
  },
  confStatus: function(func){
    ipcRenderer.on("main:confStatus", (event,ok, status) => func(event, ok, status));
  },
  confSet: function(func){
    ipcRenderer.on("main:confSet", (event, authServer, whoamiServer, dohServer, token ) => func(event, authServer, whoamiServer, dohServer, token));
  },
  i18nJson: function(func){
    ipcRenderer.on("main:i18nJson", (event,json) => func(event, json));
  },
});
