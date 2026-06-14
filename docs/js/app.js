// app.js: frontend logic (CRUD + UI)
const STORAGE_KEY = 'todo-app-todos';
let todos = loadTodosLocal();
const listEl = document.getElementById('todo-list');
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const fetchQuoteBtn = document.getElementById('fetch-quote');
const syncLoadBtn = document.getElementById('sync-load');
const categorySelect = document.getElementById('todo-category');
const statusSelect = document.getElementById('todo-status');
const prioritySelect = document.getElementById('todo-priority');
const estimateInput = document.getElementById('todo-estimate');
const tagsInput = document.getElementById('todo-tags');
const filterCategory = document.getElementById('filter-category');
const filterStatus = document.getElementById('filter-status');
const filterPriority = document.getElementById('filter-priority');
const filterKeyword = document.getElementById('filter-keyword');
const sortSelect = document.getElementById('sort-select');
const reviewButton = document.getElementById('review-button');
const exportButton = document.getElementById('export-button');
const summaryBox = document.getElementById('summary-box');
const GAS_ENABLED = typeof isGasConfigured === 'function' && isGasConfigured();

function saveTodosLocal(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodosLocal(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return [];
  try{return JSON.parse(raw);}catch(err){return []}
}

function formatPriorityRank(priority){
  switch(priority){
    case '緊急且重要': return 1;
    case '重要不緊急': return 2;
    case '緊急不重要': return 3;
    case '不緊急也不重要': return 4;
    default: return 5;
  }
}

function compareTasks(a,b){
  const sort = sortSelect.value;
  if(sort==='created-desc') return new Date(b.createTime) - new Date(a.createTime);
  if(sort==='created-asc') return new Date(a.createTime) - new Date(b.createTime);
  if(sort==='dueDate-asc') return (a.dueDate || '').localeCompare(b.dueDate || '');
  if(sort==='dueDate-desc') return (b.dueDate || '').localeCompare(a.dueDate || '');
  if(sort==='priority') return formatPriorityRank(a.priority) - formatPriorityRank(b.priority);
  if(sort==='status') return (a.status||'').localeCompare(b.status||'');
  return 0;
}

function getFilteredTodos(){
  return todos
    .filter(t=>{
      if(filterCategory.value && t.category !== filterCategory.value) return false;
      if(filterStatus.value && t.status !== filterStatus.value) return false;
      if(filterPriority.value && t.priority !== filterPriority.value) return false;
      const keyword = filterKeyword.value.trim().toLowerCase();
      if(!keyword) return true;
      return [t.title, t.category, t.status, t.priority, t.tags, t.dueDate]
        .filter(Boolean)
        .some(value=>value.toLowerCase().includes(keyword));
    })
    .slice()
    .sort(compareTasks);
}

function renderSummary(tasks){
  const total = tasks.length;
  const completed = tasks.filter(t=>t.completed).length;
  const blocked = tasks.filter(t=>t.status==='阻塞中').length;
  const dueSoon = tasks.filter(t=>{
    if(!t.dueDate) return false;
    const due = new Date(t.dueDate);
    const now = new Date();
    const diff = (due - now) / (1000*60*60*24);
    return diff >=0 && diff <= 7;
  }).length;
  const estimateSum = tasks.reduce((sum,t)=>sum + (parseFloat(t.estimate)||0),0);
  summaryBox.innerHTML = `總任務：${total}；完成：${completed}；阻塞：${blocked}；7日內到期：${dueSoon}；總預估：${estimateSum} 小時`;
}

function render(){
  const visibleTodos = getFilteredTodos();
  listEl.innerHTML='';
  renderSummary(visibleTodos);
  visibleTodos.forEach(t=>{
    const li = document.createElement('li');
    li.className='todo-item';

    const left = document.createElement('div'); left.className='todo-left';
    const chk = document.createElement('input'); chk.type='checkbox'; chk.checked = !!t.completed;
    chk.addEventListener('change', async ()=>{
      t.completed = chk.checked;
      if(t.completed) t.status = '完成';
      else if(t.status==='完成') t.status = '待處理';
      saveTodosLocal();
      render();
      if(GAS_ENABLED){
        gasUpdateTodo(t.id,{completed:t.completed, status:t.status, completedAt: t.completed ? new Date().toISOString() : ''}).catch(err=>{
          console.warn('Gas update failed', err);
        });
      }
    });
    left.appendChild(chk);

    const title = document.createElement('span'); title.className='todo-title';
    title.textContent = t.title;
    if(t.completed) title.classList.add('todo-completed');
    left.appendChild(title);

    const meta = document.createElement('div'); meta.className='todo-details';
    meta.textContent = `${t.category || '未分類'} · ${t.status || '待處理'} · ${t.priority || '無優先級'}`;
    left.appendChild(meta);

    if(t.dueDate){
      const due = document.createElement('div'); due.className='todo-details';
      due.textContent = `到期日：${t.dueDate}`;
      left.appendChild(due);
    }

    if(t.estimate){
      const estimate = document.createElement('div'); estimate.className='todo-details';
      estimate.textContent = `預估：${t.estimate} 小時`;
      left.appendChild(estimate);
    }

    if(t.tags){
      const tags = document.createElement('div'); tags.className='todo-details';
      tags.textContent = t.tags;
      left.appendChild(tags);
    }

    const actions = document.createElement('div'); actions.className='todo-actions';
    const statusSelect = document.createElement('select');
    ['待處理','進行中','阻塞中','待驗證','完成'].forEach(value=>{
      const opt = document.createElement('option'); opt.value=value; opt.textContent=value;
      statusSelect.appendChild(opt);
    });
    statusSelect.value = t.status || '待處理';
    statusSelect.addEventListener('change', async ()=>{
      t.status = statusSelect.value;
      if(t.status==='完成') t.completed = true;
      saveTodosLocal();
      render();
      if(GAS_ENABLED){
        gasUpdateTodo(t.id,{status:t.status, completed:t.status==='完成'}).catch(err=>{
          console.warn('Gas status update failed', err);
        });
      }
    });
    actions.appendChild(statusSelect);

    const editBtn = document.createElement('button'); editBtn.type='button'; editBtn.textContent='編輯';
    editBtn.addEventListener('click', ()=>{
      const newText = prompt('編輯待辦', t.title);
      if(newText!=null && newText.trim()!==''){
        t.title = newText.trim();
        saveTodosLocal();
        render();
        if(GAS_ENABLED){
          gasUpdateTodo(t.id,{title:t.title}).catch(err=>{
            console.warn('Gas update failed:', err);
            alert('更新 Google Spreadsheet 失敗，已本地儲存。');
          });
        }
      }
    });
    actions.appendChild(editBtn);

    const delBtn = document.createElement('button'); delBtn.type='button'; delBtn.textContent='刪除';
    delBtn.addEventListener('click', async ()=>{
      if(!confirm('確定刪除？')) return;
      todos = todos.filter(x=>x.id!==t.id);
      saveTodosLocal();
      render();
      if(GAS_ENABLED){
        try{
          await gasDeleteTodo(t.id);
        }catch(e){
          console.warn('Gas delete failed', e);
          alert('刪除 Google Spreadsheet 失敗，但已從頁面移除。');
        }
      }
    });
    actions.appendChild(delBtn);

    li.appendChild(left); li.appendChild(actions);
    listEl.appendChild(li);
  });
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const title = input.value.trim();
  const dueDate = document.getElementById('todo-date').value;
  const category = categorySelect.value;
  const status = statusSelect.value;
  const priority = prioritySelect.value;
  const estimate = estimateInput.value;
  const tags = tagsInput.value.trim();
  if(!title) return;

  const newTodo = {
    title,
    completed: status==='完成',
    createTime: new Date().toISOString(),
    dueDate: dueDate || '',
    category,
    status,
    priority,
    estimate: estimate || '',
    tags,
    completedAt: status==='完成' ? new Date().toISOString() : ''
  };

  if(GAS_ENABLED){
    try{
      const created = await gasCreateTodo(newTodo);
      if(created && created.id) newTodo.id = created.id;
    }catch(err){
      console.warn('Create via GAS failed, using local ID', err);
      newTodo.id = 'local-' + Date.now();
      alert('新增 Google Spreadsheet 失敗，已本地顯示待辦。');
    }
  }else{
    newTodo.id = 'local-' + Date.now();
  }

  todos.unshift(newTodo);
  input.value='';
  document.getElementById('todo-date').value = '';
  categorySelect.value = '';
  statusSelect.value = '待處理';
  prioritySelect.value = '';
  estimateInput.value = '';
  tagsInput.value = '';
  saveTodosLocal();
  render();
});

fetchQuoteBtn.addEventListener('click', async ()=>{
  try{
    const quote = await fetchRandomQuote();
    const newTodo = {
      title: quote,
      completed:false,
      createTime:new Date().toISOString(),
      dueDate:'',
      category:'',
      status:'待處理',
      priority:'',
      estimate:'',
      tags:''
    };
    if(GAS_ENABLED){
      try{
        const created = await gasCreateTodo(newTodo);
        if(created && created.id) newTodo.id = created.id;
      }catch(e){
        console.warn('Gas create for quote failed', e);
        newTodo.id='local-'+Date.now();
        alert('Quote 已加入頁面，但 Google Spreadsheet 同步失敗。');
      }
    }else{
      newTodo.id='local-'+Date.now();
    }
    todos.unshift(newTodo);
    saveTodosLocal();
    render();
  }catch(err){
    console.error(err);
    alert('取得 Quote 失敗，請稍後再試。');
  }
});

syncLoadBtn.addEventListener('click', async ()=>{
  if(!GAS_ENABLED){
    alert('Google Spreadsheet 尚未設定，無法從 GAS 載入。');
    return;
  }
  try{
    const data = await gasGetTodos();
    todos = Array.isArray(data) ? data.reverse() : [];
    saveTodosLocal();
    render();
  }catch(err){
    console.error('Spreadsheet load failed', err);
    alert('從 Google Spreadsheet 讀取失敗，請確認 GAS 已部署。');
  }
});

function downloadICS(filename, content){
  const blob = new Blob([content], {type:'text/calendar;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function createCalendarEvent(task){
  if(!task.dueDate) return '';
  const date = task.dueDate.replace(/-/g,'');
  const dtStamp = new Date().toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
  const dtStart = `${date}T090000Z`;
  const dtEnd = `${date}T100000Z`;
  const description = [`分類:${task.category||'未分類'}`, `狀態:${task.status||'待處理'}`, `優先級:${task.priority||'無'}`, `標籤:${task.tags||'無'}`].join('\\n');
  return [
    'BEGIN:VEVENT',
    `UID:${task.id}@homework02`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${task.title.replace(/\n/g,' ')}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT'
  ].join('\r\n');
}

exportButton.addEventListener('click', ()=>{
  const events = todos.filter(t=>t.dueDate).map(createCalendarEvent).filter(Boolean);
  if(!events.length){
    alert('沒有待匯出的到期任務。請先填寫到期日。');
    return;
  }
  const content = ['BEGIN:VCALENDAR','VERSION:2.0','CALSCALE:GREGORIAN',...events,'END:VCALENDAR'].join('\r\n');
  downloadICS('todolist.ics', content);
});

function computeWeeklyReview(){
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7*24*60*60*1000);
  const completedTasks = todos.filter(t=>t.completed && t.completedAt && new Date(t.completedAt) >= weekAgo);
  const count = completedTasks.length;
  const estimate = completedTasks.reduce((sum,t)=>sum+(parseFloat(t.estimate)||0),0);
  const blocked = todos.filter(t=>t.status==='阻塞中').length;
  const message = `過去7天完成任務：${count}\n總預估工時：${estimate} 小時\n目前阻塞任務：${blocked}`;
  alert(message);
}

reviewButton.addEventListener('click', computeWeeklyReview);

[filterCategory, filterStatus, filterPriority, filterKeyword, sortSelect].forEach(el=>{
  el.addEventListener('change', render);
});

// initial render
render();
