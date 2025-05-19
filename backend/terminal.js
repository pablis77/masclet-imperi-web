const vscode = require('vscode');

function createServerTerminal() {
    const terminal = vscode.window.createTerminal('Server');
    terminal.sendText('cd backend');
    terminal.sendText('uvicorn app.main:app --reload --host 0.0.0.0 --port 8000');
    terminal.show();
}

function createTestTerminal() {
    const terminal = vscode.window.createTerminal('Tests');
    terminal.sendText('cd backend');
    terminal.sendText('python -m pytest test_endpoints.py -v');
    terminal.show();
}

module.exports = {
    createServerTerminal,
    createTestTerminal
};