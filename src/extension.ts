'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "wg-getters-and-setters" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.generateGettersAndSetters', () => {
        // The code you place here will be executed every time your command is executed

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        let selection = editor.selection;
        let text = editor.document.getText(selection);

        if (text.length < 1) {
            vscode.window.showErrorMessage('No selected properties.');
            return;
        }

        try {
            var getterAndSetter = createGetterAndSetter(text);

            editor.edit(
                edit => editor.selections.forEach(
                    selection => {
                        edit.insert(selection.end, getterAndSetter);
                    }
                )
            );
        }
        catch (error) {
            console.log(error);
            vscode.window.showErrorMessage('Something went wrong! Try that the properties are in this format: "private String name;"');
        }
    });

    context.subscriptions.push(disposable);
}

function toCamelCase(str: string) {
    return str.replace(/\w+/g, w => w[0].toUpperCase() + w.slice(1));
}

function createGetterAndSetter(textProperties: string) {
    let rows = textProperties.split('\n').map(x => x.replace(';', ''));
    let properties: Array<string> = [];

    for (let row of rows) {
        if (row.trim() !== "") {
            properties.push(row);
        }
    }

    let generatedCode = `
    `;
    for (let p in properties) {
        while (properties[p].startsWith(" ")) { properties[p] = properties[p].substr(1); }
        while (properties[p].startsWith("\t")) { properties[p] = properties[p].substr(1); }
        let words: Array<string> = [];

        let rows = properties[p].split(" ").map(x => x.replace('\r\n', ''));
        for (let row of rows) {
            if (row.trim() !== '') {
                words.push(row);
            }
        }
        let type, attribute, Attribute = "";
        let create = false;

        // if words === ["private", "name:", "string"];
        if (words.length === 3) {
            let attributeArray = words[1].split(":");
            type = words[2];
            attribute = attributeArray[0];
            Attribute = toCamelCase(attribute);

            create = true;
            // if words === ["private", "name:string"];
        } else if (words.length === 2) {
            let array = words[1].split(":");
            type = array[1];
            attribute = array[0];
            Attribute = toCamelCase(attribute);
            create = true;
            // if words === ["private", "name", ":", "string"];
        } else if (words.length === 4) {

            let array: Array<string> = [];
            for (let word of words) {
                if (word !== ':') {
                    array.push(word);
                }
            }
            type = array[2].trim();
            attribute = array[1];
            Attribute = toCamelCase(attribute);
            create = true;
        } else {
            vscode.window.showErrorMessage('Something went wrong! Try that the properties are in this format: "private name: string;"');
            generatedCode = ``;
            break;
        }

        if (create) {

            let code =
                `
\tpublic ${(type === "Boolean" || type === "boolean" ? "is" : "get")}${Attribute}(): ${type} {
\t\treturn this.${attribute};
\t}

\tpublic set${Attribute}(${attribute}: ${type}): void {
\t\tthis.${attribute} = ${attribute};
\t}
`;
            generatedCode += code;
        }
    }

    return generatedCode;
}

// this method is called when your extension is deactivated
export function deactivate() {
}