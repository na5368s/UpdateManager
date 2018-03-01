const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// SET ENV
// process.env.NODE_ENV = 'production';

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

function checkUpdate(item){
    "use strict";

// The path to the .bat file
    var myBatFilePath = "I:\\SQL-Skripte\\executeSQL.bat " + item.username + " " + item.password + " " + item.db ;

    const spawn = require('child_process').spawn;
    const bat = spawn('cmd.exe', ['/c', myBatFilePath]);


// Handle normal output
    bat.stdout.on('data', (data) => {
        // As said before, convert the Uint8Array to a readable string.
        var str = String.fromCharCode.apply(null, data);
        console.info(str);
    });

// Handle error output
    bat.stderr.on('data', (data) => {
        // As said before, convert the Uint8Array to a readable string.
        var str = String.fromCharCode.apply(null, data);
        console.error(str);
    });

// Handle on exit event
    bat.on('exit', (code) => {
        var preText = `Child exited with code ${code} : `;

        switch(code){
            case 0:
                console.info(preText+"Something unknown happened executing the batch.");
                break;
            case 1:
                console.info(preText+"The file already exists");
                break;
            case 2:
                console.info(preText+"The file doesn't exists and now is created");
                break;
            case 3:
                console.info(preText+"An error ocurred while creating the file");
                break;
        }
    });
}

// Catch item:add
ipcMain.on('item1:add', function(e, item){
    // !!! Abfangen wenn item.username,password,db = null !!! -> validierung
    //console.log(item.username);
    checkUpdate(item)
   // mainWindow.webContents.send('item:add', item);
   // checkWindow.close();
});

//Create menu template
const mainMenuTemplate = [
    {
        label:'File',
        submenu: [
            {
                label: 'Check Updates',
                click(){
                    // createCheckWindow();
                }
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