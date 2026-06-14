// gas.js: wrapper for Google Apps Script Web App endpoints
// TODO: replace with your deployed GAS web app base URL
const GAS_BASE_URL = 'https://script.google.com/macros/s/AKfycbxZbSY17n-Em6aKyFfruo5c0aNuXccoYS5XU_3A5S6vjJDtnuqAqMOIbiZ10Jc68PY/exec';
const GAS_CONFIGURED = GAS_BASE_URL.startsWith('https://script.google.com/macros/s/') && GAS_BASE_URL.trim() !== '';

function isGasConfigured(){
  return GAS_CONFIGURED;
}

function ensureGasConfigured(){
  if(!GAS_CONFIGURED){
    throw new Error('Google Apps Script 未設定，請在 js/gas.js 中填入您的 GAS Web App URL');
  }
}

async function gasGetTodos(){
  ensureGasConfigured();
  try{
    const res = await fetch(`${GAS_BASE_URL}?action=get`);
    if(!res.ok) throw new Error('GAS get failed');
    const data = await res.json();
    return data; // expect array of todos
  }catch(err){
    console.error('gasGetTodos', err);
    throw err;
  }
}

async function gasCreateTodo(todo){
  ensureGasConfigured();
  try{
    const res = await fetch(GAS_BASE_URL,{ 
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'create', todo})
    });
    if(!res.ok) throw new Error('GAS create failed');
    return await res.json();
  }catch(err){
    console.error('gasCreateTodo', err);
    throw err;
  }
}

async function gasUpdateTodo(id, fields){
  ensureGasConfigured();
  try{
    const res = await fetch(GAS_BASE_URL,{ 
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'update', id, fields})
    });
    if(!res.ok) throw new Error('GAS update failed');
    return await res.json();
  }catch(err){
    console.error('gasUpdateTodo', err);
    throw err;
  }
}

async function gasDeleteTodo(id){
  ensureGasConfigured();
  try{
    const res = await fetch(GAS_BASE_URL,{ 
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'delete', id})
    });
    if(!res.ok) throw new Error('GAS delete failed');
    return await res.json();
  }catch(err){
    console.error('gasDeleteTodo', err);
    throw err;
  }
}
