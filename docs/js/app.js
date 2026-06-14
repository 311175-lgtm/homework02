// app.js: frontend logic (CRUD + UI)
let todos = [];
const listEl = document.getElementById('todo-list');
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const fetchQuoteBtn = document.getElementById('fetch-quote');
const syncLoadBtn = document.getElementById('sync-load');

function render(){
  listEl.innerHTML='';
  todos.forEach(t=>{
    const li = document.createElement('li');
    li.className='todo-item';
    const left = document.createElement('div'); left.className='todo-left';
    const chk = document.createElement('input'); chk.type='checkbox'; chk.checked = !!t.completed;
    chk.addEventListener('change', async ()=>{
      t.completed = chk.checked;
      try{ await gasUpdateTodo(t.id,{completed:t.completed}); }catch(e){console.warn(e)}
      render();
    });
    const title = document.createElement('span'); title.className='todo-title';
    title.textContent = t.title;
    if(t.completed) title.classList.add('todo-completed');
    left.appendChild(chk); left.appendChild(title);

    const actions = document.createElement('div'); actions.className='todo-actions';
    const editBtn = document.createElement('button'); editBtn.textContent='編輯';
    editBtn.addEventListener('click', ()=>{
      const newText = prompt('編輯待辦', t.title);
      if(newText!=null && newText.trim()!==''){
        t.title = newText.trim();
        gasUpdateTodo(t.id,{title:t.title}).catch(()=>{});
        render();
      }
    });
    const delBtn = document.createElement('button'); delBtn.textContent='刪除';
    delBtn.addEventListener('click', async ()=>{
      if(!confirm('確定刪除？')) return;
      try{ await gasDeleteTodo(t.id); todos = todos.filter(x=>x.id!==t.id); render(); }catch(e){console.warn(e)}
    });
    actions.appendChild(editBtn); actions.appendChild(delBtn);

    li.appendChild(left); li.appendChild(actions);
    listEl.appendChild(li);
  });
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const title = input.value.trim();
  if(!title) return;
  const newTodo = {title, completed:false, createTime: new Date().toISOString()};
  try{
    const created = await gasCreateTodo(newTodo);
    if(created && created.id) newTodo.id = created.id;
  }catch(err){
    console.warn('Create via GAS failed, using local ID');
    newTodo.id = 'local-' + Date.now();
  }
  todos.unshift(newTodo);
  input.value='';
  render();
});

fetchQuoteBtn.addEventListener('click', async ()=>{
  try{
    const quote = await fetchRandomQuote();
    const newTodo = {title:quote, completed:false, createTime:new Date().toISOString()};
    try{ const created = await gasCreateTodo(newTodo); if(created && created.id) newTodo.id = created.id; }catch(e){ newTodo.id='local-'+Date.now(); }
    todos.unshift(newTodo); render();
  }catch(err){alert('取得 Quote 失敗');}
});

syncLoadBtn.addEventListener('click', async ()=>{
  try{
    const data = await gasGetTodos();
    // expect array [{id,title,completed,createTime}, ...]
    todos = Array.isArray(data) ? data.reverse() : [];
    render();
  }catch(err){alert('從 Spreadsheet 載入失敗');}
});

// initial render
render();
