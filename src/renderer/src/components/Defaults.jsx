let defaultPath = '';
let defaultPlots = [];
let numRunScripts= 0;

function updateDefaultPlots(newPlots){
    defaultPlots = newPlots;
}

function updateDefaultPath(newPath){
    defaultPath= newPath;
}
export {defaultPlots, updateDefaultPlots, defaultPath, updateDefaultPath, numRunScripts}