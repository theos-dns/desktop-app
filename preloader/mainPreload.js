const {
  ipcRenderer,
  contextBridge
} = require("electron");

contextBridge.exposeInMainWorld("api", {
  sendSelectCore: function({ core }){
    ipcRenderer.send("main:selectCore",{ core });
  },
  sendStartCore: function(){
    ipcRenderer.send("main:startCore");
  },
  sendStopCore: function(){
    ipcRenderer.send("main:stopCore");
  },
  getCores: function(func){
    ipcRenderer.on("main:getCores", (event,cores) => func(event, cores));
  },
  getCoreStatus:  function(func){
    ipcRenderer.on("main:coreStatus", (event, coreName, isInstalling, isStarted, message) => func(event, coreName, isInstalling, isStarted, message));
  },


  submitConf: function({ authServer, whoamiServer, dohServer, token }){
    ipcRenderer.send("main:submitConf",{ authServer, whoamiServer, dohServer, token });
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
