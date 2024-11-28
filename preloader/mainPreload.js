const {
  ipcRenderer,
  contextBridge
} = require("electron");

contextBridge.exposeInMainWorld("api", {
  selectCore: function({ core }){
    ipcRenderer.send("main:selectCore",{ core });
  },
  tunCores: function(func){
    ipcRenderer.on("main:tunCores", (event,cores) => func(event, cores));
  },
  i18nJson: function(func){
    ipcRenderer.on("main:i18nJson", (event,json) => func(event, json));
  },
});
