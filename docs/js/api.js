// api.js: external API helpers
async function fetchRandomQuote(){
  try{
    const res = await fetch('https://api.quotable.io/random');
    if(!res.ok) throw new Error('API response not ok');
    const data = await res.json();
    return `${data.content} — ${data.author}`;
  }catch(err){
    console.warn('fetchRandomQuote primary failed, trying fallback', err);
    return fetchQuoteFallback();
  }
}

async function fetchQuoteFallback(){
  try{
    const res = await fetch('https://type.fit/api/quotes');
    if(!res.ok) throw new Error('Fallback API response not ok');
    const quotes = await res.json();
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    return `${quote.text} — ${quote.author || 'Unknown'}`;
  }catch(err){
    console.error('fetchQuoteFallback error', err);
    throw err;
  }
}
