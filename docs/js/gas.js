// gas.js: wrapper for Google Apps Script Web App endpoints
// TODO: replace with your deployed GAS web app base URL
const GAS_BASE_URL = 'https://script.google.com/macros/s/AKfycbxT51RsdJSaMYI-o__fv7UVGZp9BzTmmkN5JZhh6wqk8JLmKddX1WppJMddV4SXyPRv/exec';
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
    console.debug('gasGetTodos -> GET', `${GAS_BASE_URL}?action=get`);
    const res = await fetch(`${GAS_BASE_URL}?action=get`, {method:'GET'});
    console.debug('gasGetTodos response status', res.status, res.headers && res.headers.get('content-type'));
    const text = await res.text();
    try{ const data = JSON.parse(text); console.debug('gasGetTodos parsed', data); return data; }catch(err){ console.warn('gasGetTodos parse failed, raw:', text); throw new Error('GAS get parse failed: ' + err.toString()); }
  }catch(err){
    console.error('gasGetTodos', err);
    throw err;
  }
}

async function gasCreateTodo(todo){
  ensureGasConfigured();
  try{
    const payload = {action:'create', todo};
    console.debug('gasCreateTodo -> POST', GAS_BASE_URL, payload);
    const res = await fetch(GAS_BASE_URL,{ 
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload),
      mode: 'cors'
    });
    console.debug('gasCreateTodo response status', res.status, res.headers && res.headers.get('content-type'));
    const text = await res.text();
    try{ const data = JSON.parse(text); console.debug('gasCreateTodo parsed', data); return data; }catch(err){ console.warn('gasCreateTodo parse failed, raw:', text); throw new Error('GAS create parse failed: ' + err.toString()); }
  }catch(err){
    console.error('gasCreateTodo', err);
    throw err;
  }
}

async function gasUpdateTodo(id, fields){
  ensureGasConfigured();
  try{
    const payload = {action:'update', id, fields};
    console.debug('gasUpdateTodo -> POST', GAS_BASE_URL, payload);
    const res = await fetch(GAS_BASE_URL,{ 
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload),
      mode: 'cors'
    });
    console.debug('gasUpdateTodo response status', res.status, res.headers && res.headers.get('content-type'));
    const text = await res.text();
    try{ const data = JSON.parse(text); console.debug('gasUpdateTodo parsed', data); return data; }catch(err){ console.warn('gasUpdateTodo parse failed, raw:', text); throw new Error('GAS update parse failed: ' + err.toString()); }
  }catch(err){
    console.error('gasUpdateTodo', err);
    throw err;
  }
}

async function gasDeleteTodo(id){
  ensureGasConfigured();
  try{
    const payload = {action:'delete', id};
    console.debug('gasDeleteTodo -> POST', GAS_BASE_URL, payload);
    const res = await fetch(GAS_BASE_URL,{ 
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload),
      mode: 'cors'
    });
    console.debug('gasDeleteTodo response status', res.status, res.headers && res.headers.get('content-type'));
    const text = await res.text();
    try{ const data = JSON.parse(text); console.debug('gasDeleteTodo parsed', data); return data; }catch(err){ console.warn('gasDeleteTodo parse failed, raw:', text); throw new Error('GAS delete parse failed: ' + err.toString()); }
  }catch(err){
    console.error('gasDeleteTodo', err);
    throw err;
  }
}
