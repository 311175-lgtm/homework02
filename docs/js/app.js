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

    if(t.dueDate){
      const detail = document.createElement('div'); detail.className='todo-details';
      detail.textContent = `到期日：${t.dueDate}`;
      left.appendChild(detail);
    }

    const actions = document.createElement('div'); actions.className='todo-actions';
    const editBtn = document.createElement('button'); editBtn.textContent='編輯';
    editBtn.addEventListener('click', ()=>{
      const newText = prompt('編輯待辦', t.title);
      if(newText!=null && newText.trim()!==''){
        t.title = newText.trim();
        render();
        gasUpdateTodo(t.id,{title:t.title}).catch(err=>{
          console.warn('Gas update failed:', err);
          alert('更新 Google Spreadsheet 失敗，已本地儲存。');
        });
      }
    });
    const delBtn = document.createElement('button'); delBtn.textContent='刪除';
    delBtn.addEventListener('click', async ()=>{
      if(!confirm('確定刪除？')) return;
      todos = todos.filter(x=>x.id!==t.id);
      render();
      try{
        await gasDeleteTodo(t.id);
      }catch(e){
        console.warn('Gas delete failed', e);
        alert('刪除 Google Spreadsheet 失敗，但已從頁面移除。');
      }
    });
    actions.appendChild(editBtn); actions.appendChild(delBtn);

    li.appendChild(left); li.appendChild(actions);
    listEl.appendChild(li);
  });
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const title = input.value.trim();
  const dueDate = document.getElementById('todo-date').value;
  if(!title) return;
  const newTodo = {title, completed:false, createTime: new Date().toISOString(), dueDate: dueDate || ''};
  try{
    const created = await gasCreateTodo(newTodo);
    if(created && created.id) newTodo.id = created.id;
  }catch(err){
    console.warn('Create via GAS failed, using local ID', err);
    newTodo.id = 'local-' + Date.now();
    alert('新增 Google Spreadsheet 失敗，已本地顯示待辦。');
  }
  todos.unshift(newTodo);
  input.value='';
  document.getElementById('todo-date').value = '';
  render();
});

fetchQuoteBtn.addEventListener('click', async ()=>{
  try{
    const quote = await fetchRandomQuote();
    const newTodo = {title:quote, completed:false, createTime:new Date().toISOString(), dueDate: ''};
    try{
      const created = await gasCreateTodo(newTodo);
      if(created && created.id) newTodo.id = created.id;
    }catch(e){
      console.warn('Gas create for quote failed', e);
      newTodo.id='local-'+Date.now();
      alert('Quote 已加入頁面，但 Google Spreadsheet 同步失敗。');
    }
    todos.unshift(newTodo);
    render();
  }catch(err){
    console.error(err);
    alert('取得 Quote 失敗，請稍後再試。');
  }
});

syncLoadBtn.addEventListener('click', async ()=>{
  try{
    const data = await gasGetTodos();
    // expect array [{id,title,completed,createTime, dueDate}, ...]
    todos = Array.isArray(data) ? data.reverse() : [];
    render();
  }catch(err){
    console.error('Spreadsheet load failed', err);
    alert('從 Google Spreadsheet 讀取失敗，請確認 GAS 已部署。');
  }
});

// initial render
render();
