const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let checkWindow;

// Listen for app to be ready
app.on('ready', function(){
    // Create new window
    mainWindow = new BrowserWindow({});
    //Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    })

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create check window
function createCheckWindow(){
    // Create new window
    checkWindow = new BrowserWindow({
        width: 300,
        height:200,
        title: 'Check Updates'
    });
    //Load html into window
    checkWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'checkWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Garbage collection handle
    checkWindow.on('close', function(){
        checkWindow = null;
    })
}

// Catch item:add
ipcMain.on('item:add', function(e, item){
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    checkWindow.close();
});

//Create menu template
const mainMenuTemplate = [
    {
        label:'File',
        submenu: [
            {
                label: 'Check Updates',
                click(){
                    createCheckWindow();
                }
            },
            {
                label: 'Move Updates'
            },
            {
                label: 'Quit',
                //Hotkeys für mac oder windows
                accelerator: process.platform == 'darwin' ? 'Command+Q' :
                    'CTRL+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// If mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu:[
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' :
                    'CTRL+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}