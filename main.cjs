const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: { contextIsolation: true },
  });

  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log('Loading:', indexPath);  // 🔍 Debug log
  win.loadFile(indexPath);

  // win.webContents.openDevTools(); // Optional
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
