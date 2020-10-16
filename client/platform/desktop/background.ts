import { app, protocol, BrowserWindow, ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import server from './api/mediaserver';
import { add } from 'lodash';
// const path = require("path");
// const {getPluginEntry} = require("mpv.js");
// Absolute path to the plugin directory.
// const pluginDir = path.join(path.dirname(require.resolve("mpv.js")), "build", "Release");
// See pitfalls section for details.
// if (process.platform !== "linux") {process.chdir(pluginDir);}
// Fix for latest Electron.
app.commandLine.appendSwitch("no-sandbox");
// To support a broader number of systems.
app.commandLine.appendSwitch("ignore-gpu-blacklist");

const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html
      // #node-integration for more info
      nodeIntegration: (process.env
        .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      plugins: true,
    },
  });

  if (process.env.IS_ELECTRON) {
    // Load the url of the dev server if in development mode
    console.log(process.env.IS_ELECTRON);
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    // win.loadURL(`file:/${__dirname}/index.html`);

    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    console.log('local');
    // Load the index.html when not in development
    win.loadURL(`file://${__dirname}/index.html`);
  }

  win.on('closed', () => {
    win = null;
  });
  server.listen(0, () => {
    let address = server.address();
    let port = 0;
    if (typeof address === 'object' && address !== null) {
      port = address.port || 0;
      address = address.address || '';
    }
    console.log(`Server listening on ${address}:${port}`);
  });
}

ipcMain.on('info', (event) => {
  event.returnValue = server.address();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}