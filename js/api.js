// api.js: external API helpers
async function fetchRandomQuote(){
  try{
    const res = await fetch('https://api.quotable.io/random');
    if(!res.ok) throw new Error('API response not ok');
    const data = await res.json();
    return `${data.content} — ${data.author}`;
  }catch(err){
    console.error('fetchRandomQuote error', err);
    throw err;
  }
}
