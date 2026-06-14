// Google Apps Script 範例，用於與 Spreadsheet 同步 To-Do List
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const SHEET_NAME = 'Sheet1';

function doGet(e){
  const action = e.parameter.action;
  if(action === 'get'){
    return ContentService.createTextOutput(JSON.stringify(getAllTasks())).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({error:'Unknown action'})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e){
  const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
  const action = body.action;
  if(action === 'create') return ContentService.createTextOutput(JSON.stringify(createTask(body.todo))).setMimeType(ContentService.MimeType.JSON);
  if(action === 'update') return ContentService.createTextOutput(JSON.stringify(updateTask(body.id, body.fields))).setMimeType(ContentService.MimeType.JSON);
  if(action === 'delete') return ContentService.createTextOutput(JSON.stringify(deleteTask(body.id))).setMimeType(ContentService.MimeType.JSON);
  return ContentService.createTextOutput(JSON.stringify({error:'Unknown action'})).setMimeType(ContentService.MimeType.JSON);
}

function openSheet(){
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
}

function getAllTasks(){
  const sheet = openSheet();
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift();
  return rows.map(row => {
    const item = {};
    headers.forEach((key, index) => {
      item[key] = row[index];
    });
    return item;
  }).filter(item => item.ID);
}

function findRowById(sheet, id){
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  for(let i=0;i<values.length;i++){
    if(values[i][0].toString() === id.toString()) return i + 2;
  }
  return null;
}

function createTask(todo){
  const sheet = openSheet();
  const id = todo.id || Utilities.getUuid();
  const row = [id, todo.title || '', todo.status || '', todo.createTime || '', todo.category || '', todo.priority || '', todo.estimate || '', todo.tags || '', todo.dueDate || '', todo.completed || false, todo.completedAt || ''];
  sheet.appendRow(row);
  return {id};
}

function updateTask(id, fields){
  const sheet = openSheet();
  const rowNumber = findRowById(sheet, id);
  if(!rowNumber) return {error:'Task not found'};
  const headerRow = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  Object.keys(fields).forEach(key => {
    const col = headerRow.indexOf(key);
    if(col >= 0){
      sheet.getRange(rowNumber, col+1).setValue(fields[key]);
    }
  });
  return {id};
}

function deleteTask(id){
  const sheet = openSheet();
  const rowNumber = findRowById(sheet, id);
  if(!rowNumber) return {error:'Task not found'};
  sheet.deleteRow(rowNumber);
  return {id};
}
