import {CONFIG} from './config.js';
const L=await import('./launch.bundle.js');
const LIVE=!!(CONFIG.PLATFORM_ID&&CONFIG.IPFS_ENDPOINT);
document.querySelectorAll('[data-name]').forEach(e=>e.textContent=CONFIG.NAME);
const $=s=>document.querySelector(s),app=$('#app'),esc=v=>String(v??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const short=a=>a.slice(0,4)+'…'+a.slice(-4),fmt=n=>n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(1)+'k':(+n).toFixed(2);
let SOLUSD=0;const getSol=async()=>{for(const u of ['https://lite-api.jup.ag/price/v3?ids=So11111111111111111111111111111111111111112','https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd']){try{const j=await (await fetch(u)).json();const v=j.So11111111111111111111111111111111111111112?.usdPrice||j.solana?.usd;if(v>0){SOLUSD=+v;return}}catch{}}};await getSol();setInterval(getSol,60000);
const usd=sol=>{if(!SOLUSD)return fmt(sol)+' SOL';const n=sol*SOLUSD;return '$'+(n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':n.toFixed(0))};

$('#plat').textContent=CONFIG.PLATFORM_ID?'platform '+short(CONFIG.PLATFORM_ID):'platform not live yet';
const wbtn=$('#wallet');wbtn.onclick=async()=>{if(L.pubkey()){await L.disconnect();wbtn.textContent='Connect wallet';return}
 if(!L.detected().includes('phantom')){wbtn.textContent='Phantom not found';setTimeout(()=>wbtn.textContent='Connect wallet',1800);return}
 try{wbtn.textContent=short(await L.connect('phantom'))}catch{}};
let CACHE=null;async function coins(){if(!CONFIG.PLATFORM_ID)return [];if(CACHE&&Date.now()-CACHE.t<15000)return CACHE.v;const v=await L.listLaunches(CONFIG)||[];CACHE={t:Date.now(),v};return v}
const SOL=c=>+c.raised/10**c.decB,pct=c=>Math.min(100,SOL(c)/(+c.target/10**c.decB)*100);
const card=c=>`<a href="#/coin/${c.mintA}" class="card coin coinlink"><div class="img">${c.meta?.image?`<img src="${esc(c.meta.image)}" alt="">`:'?'}</div><div class="tk">$${esc(c.meta?.symbol||'?')}</div><div class="dim">${esc(c.meta?.name||short(c.mintA))}</div><div class="mc">${usd(c.mcap)} <span class="dim" style="font-weight:400">mcap</span></div><div class="dim mono" style="font-size:12px">${SOL(c).toFixed(2)} SOL raised · ${pct(c).toFixed(1)}% to graduation</div></a>`;
const steps=`<div class="steps">
<div class="card"><div class="n">01 · LAUNCH</div><b>Anyone launches a coin</b><p>Name, ticker, image, done. Every coin on ${CONFIG.NAME} has HODL rewards built in.</p></div>
<div class="card"><div class="n">02 · HOLD</div><b>Your hold clock starts</b><p>Trading fees flow to that coin's holders, weighted by how long each one has held.</p></div>
<div class="card"><div class="n">03 · SELL = RESET</div><b>Paper hands forfeit</b><p>Sell and your clock resets. Your unclaimed rewards go to the holders who stayed.</p></div>
<div class="card"><div class="n">04 · WATCH IT PAY</div><b>Payouts in the open</b><p>Every coin has a live holder leaderboard and a public payout log. No trust me bro.</p></div></div>
<p class="note">Fees go to holders weighted by hold time; the platform takes a small cut to run the pad.</p>`;

function home(){app.innerHTML=`<section class="hero"><div><span class="tag">Solana launchpad</span><h1>Hold longer.<br><em>Earn more.</em></h1>
<p>Launch a coin where every trade pays the people holding it. The longer you hold, the bigger your share. Sell early, and your unclaimed rewards go to everyone who stayed.</p>
<div class="row" style="margin-top:20px"><a class="btn pri" href="#/create">Launch a coin</a><a class="btn ghost" href="#/how">How it works</a></div></div>
<div class="card feat"><h3>Featured</h3><div id="feat"><div class="empty" style="padding:30px 14px;position:relative;z-index:1"><b>No coins launched yet</b>The first coin launched on ${CONFIG.NAME} shows up here.</div></div></div></section>
<div class="bar"><input class="search" id="q" placeholder="Search coins by name, ticker or CA"><div class="tabs" id="tabs"><button class="on">Trending</button><button>New</button><button>Almost graduated</button></div></div>
<div id="board"><div class="empty">Loading launches from chain…</div></div><h2>How it works</h2>${steps}`;
 let list=[],tab='Trending';const draw=()=>{const q=$('#q').value.trim().toLowerCase();let v=list.filter(c=>!q||[c.mintA,c.meta?.name,c.meta?.symbol].some(x=>String(x||'').toLowerCase().includes(q)));
  v=[...v].sort(tab==='New'?(a,b)=>+b.epoch-+a.epoch:tab==='Almost graduated'?(a,b)=>pct(b)-pct(a):(a,b)=>b.mcap-a.mcap);
  board.innerHTML=v.length?`<div class="grid">${v.map(card).join('')}</div>`:`<div class="empty"><b>No coins launched yet</b>${CONFIG.PLATFORM_ID?'Coins launched on '+CONFIG.NAME+' appear here straight from chain.':'Launching opens once the '+CONFIG.NAME+' platform is live on Raydium LaunchLab.'} <div style="margin-top:14px"><a class="btn pri" href="#/create">Be the first</a></div></div>`};
 tabs.querySelectorAll('button').forEach(b=>b.onclick=()=>{tabs.querySelector('.on').classList.remove('on');b.classList.add('on');tab=b.textContent;draw()});$('#q').oninput=draw;
 coins().then(v=>{list=v;draw();if(v.length)feat.innerHTML=card([...v].sort((a,b)=>b.mcap-a.mcap)[0])}).catch(e=>board.innerHTML=`<div class="empty err">Couldn't read launches: ${esc(e.message)}</div>`)}
async function coin(mint){app.innerHTML=`<div class="empty" style="margin-top:30px">Loading coin…</div>`;
 const c=(await coins().catch(()=>[])).find(x=>x.mintA===mint);if(!c){app.innerHTML=`<div class="empty" style="margin-top:30px"><b>Coin not found on ${CONFIG.NAME}</b>Only coins launched on the ${CONFIG.NAME} platform are listed.</div>`;return}
 const m=c.meta||{};app.innerHTML=`<div class="row" style="padding-top:24px"><div class="coin" style="padding:0;min-height:0"><div class="img" style="width:52px;height:52px">${m.image?`<img src="${esc(m.image)}" alt="">`:'?'}</div></div>
<div><div class="mono" style="color:var(--acc)">$${esc(m.symbol)}</div><div style="font-size:22px;font-weight:600">${esc(m.name)}</div><div class="dim mono" style="font-size:12px">${esc(mint)}</div></div><div class="sp"></div>
<a class="btn ghost" target="_blank" rel="noopener" href="https://raydium.io/launchpad/token/?mint=${mint}">Trade on Raydium</a></div>
<div class="detail"><div><div class="card pad"><h3>Bonding curve</h3><div class="dim">${SOL(c).toFixed(3)} / ${(+c.target/10**c.decB).toFixed(0)} SOL raised · ${pct(c).toFixed(2)}% · mcap ${usd(c.mcap)} · ${c.status?'graduated':'on curve'}</div><p class="dim">${esc(m.description)}</p></div>
<div class="card pad" style="margin-top:16px"><h3>Holder leaderboard</h3><table id="hl"><tr><td><div class="empty" style="padding:20px">Loading holders…</div></td></tr></table><p class="note">Live balances from chain. Hold-time weights and accrued rewards come from the payout keeper once it's running.</p></div>
<div class="card pad" style="margin-top:16px"><h3>Payout log</h3><div class="empty" style="padding:26px"><b>No payouts yet</b>Every fee distribution will be logged here with a transaction link.</div></div></div>
<div><div class="card pad"><h3>Reward rules</h3><div class="note" style="margin:0">Each curve trade pays ${CONFIG.FEES.platform}% to the ${CONFIG.NAME} treasury, which is paid out to this coin's holders weighted by hold time.<br>Sell → clock resets.</div>
<div class="dim mono" style="font-size:12px;margin-top:10px">Platform fees accrued: ${(+c.platformFee/10**c.decB).toFixed(4)} SOL</div></div></div></div>`;
 L.holders(CONFIG,mint).then(h=>{hl.innerHTML=`<tr><th>#</th><th>Holder</th><th>Balance</th><th>% supply</th></tr>`+h.slice(0,50).map((x,i)=>`<tr><td>${i+1}</td><td class="mono">${short(x.owner)}</td><td>${fmt(x.ui)}</td><td>${(x.ui/1e7).toFixed(2)}%</td></tr>`).join('')}).catch(e=>hl.innerHTML=`<tr><td class="err">${esc(e.message)}</td></tr>`)}
function create(){const why=!CONFIG.PLATFORM_ID?`The ${CONFIG.NAME} platform isn't created on LaunchLab yet.`:!CONFIG.IPFS_ENDPOINT?'The metadata upload service isn\'t connected yet.':'';
app.innerHTML=`<div class="form"><span class="tag">New coin</span><h2 style="margin-top:12px">Launch a coin on ${CONFIG.NAME}</h2><p class="dim">Raydium LaunchLab bonding curve, paired with SOL, graduates at ${CONFIG.PAIR.raise} SOL. Trade fee ${CONFIG.FEES.raydium+CONFIG.FEES.platform}% (${CONFIG.FEES.platform}% to holders via ${CONFIG.NAME}).</p>
<form class="card pad" id="f"><div class="two"><div><label>Name</label><input name="name" required maxlength="32" placeholder="Diamond Hands"></div><div><label>Ticker</label><input name="symbol" required maxlength="10" placeholder="DIAMOND"></div></div>
<label>Image</label><input type="file" name="file" required accept="image/png,image/jpeg,image/gif,image/webp"><label>Description</label><textarea name="description" rows="4" maxlength="500" placeholder="What's the coin about?"></textarea>
<div class="two"><div><label>X / Twitter</label><input name="twitter" placeholder="https://x.com/…"></div><div><label>Telegram</label><input name="telegram" placeholder="https://t.me/…"></div></div><label>Website</label><input name="website" placeholder="https://…">
<label>First buy (SOL, optional)</label><input name="buy" type="number" min="0" step="0.01" value="0">
<button class="btn pri" style="width:100%;margin-top:18px" ${LIVE?'':'disabled'}>${LIVE?'Launch coin':'Launching opens soon'}</button><p class="note" id="st">${LIVE?'You sign one transaction in Phantom. Nothing is sent until you approve it.':why+' Nothing is submitted from this page yet.'}</p></form></div>`;
 $('#f').onsubmit=async e=>{e.preventDefault();const st=$('#st'),b=e.target.querySelector('button'),fd=new FormData(e.target);b.disabled=true
  try{if(!L.pubkey()){st.textContent='Connecting Phantom…';wbtn.textContent=short(await L.connect('phantom'))}
   st.textContent='Uploading image + metadata…';fd.delete('buy');fd.set('symbol',String(fd.get('symbol')).toUpperCase())
   const r=await fetch(CONFIG.IPFS_ENDPOINT,{method:'POST',body:fd});const j=await r.json();if(!r.ok)throw new Error(j.error||'upload failed')
   st.textContent='Approve the launch in Phantom…';const out=await L.launch({...CONFIG,PLATFORM_ID:CONFIG.PLATFORM_ID},{name:fd.get('name'),symbol:fd.get('symbol'),uri:j.uri,pair:CONFIG.PAIR,buyUi:+e.target.buy.value||0})
   CACHE=null;st.innerHTML=`<span class="ok">Launched!</span> <a href="#/coin/${out.mintA}">View coin</a> · <a target="_blank" href="https://solscan.io/tx/${out.sig}">tx</a>`}
  catch(x){st.innerHTML=`<span class="err">${esc(x.message)}</span>`;b.disabled=false}}}
function how(){app.innerHTML=`<h2 style="margin-top:34px">How ${CONFIG.NAME} works</h2><p class="dim" style="max-width:640px;line-height:1.6">${CONFIG.TAGLINE} Most launchpads reward the fastest flippers. Here the longest holders get paid, and the payouts are on display.</p>${steps}`}

let AT=null;const API=()=>(CONFIG.IPFS_ENDPOINT||'').replace(/\/?$/,'/')+'analytics',ago=t=>{const s=Date.now()/1e3-t;return s<60?Math.floor(s)+'s':s<3600?Math.floor(s/60)+'m':s<86400?Math.floor(s/3600)+'h':Math.floor(s/86400)+'d'},sol=n=>(+n).toFixed(n&&n<1?4:2)+' SOL';
function bars(d){if(!d.length)return `<div class="empty" style="padding:34px">No launches yet. This chart fills in as coins launch.</div>`;const days=[],m=Object.fromEntries(d.map(x=>[x.day,x.n]));for(let t=new Date(d[0].day);t<=new Date(d[d.length-1].day);t.setUTCDate(t.getUTCDate()+1))days.push(t.toISOString().slice(0,10));const mx=Math.max(...d.map(x=>x.n)),W=720,H=160,bw=W/days.length;
 return `<svg viewBox="0 0 ${W} ${H+20}" width="100%" style="display:block">${days.map((k,i)=>{const n=m[k]||0,h=n/mx*H;return `<rect x="${i*bw+bw*.15}" y="${H-h}" width="${bw*.7}" height="${h}" rx="3" fill="var(--acc)"><title>${k}: ${n}</title></rect>`}).join('')}<text x="0" y="${H+16}" fill="#7a7a7a" font-size="11">${days[0]}</text><text x="${W}" y="${H+16}" fill="#7a7a7a" font-size="11" text-anchor="end">${days[days.length-1]}</text></svg>`}
async function analytics(){clearInterval(AT);app.innerHTML=`<h2 style="margin-top:34px">Analytics</h2><div id="an"><div class="empty">Reading ${esc(CONFIG.NAME)} stats from chain…</div></div>`;
 const draw=async()=>{const el=$('#an');if(!el)return clearInterval(AT);try{const r=await fetch(API());if(!r.ok)throw new Error('HTTP '+r.status);const a=await r.json();let md={};try{(await coins()).forEach(c=>md[c.mintA]=c.meta)}catch{}
  const nm=m=>md[m]?.symbol?'$'+esc(md[m].symbol):short(m),stat=(k,v,s='')=>`<div class="card stat"><div class="k">${k}</div><div class="v">${v}</div>${s?`<div class="s">${s}</div>`:''}</div>`
  const tbl=(rows,col,f)=>rows.length?`<table><tr><th>#</th><th>Coin</th><th style="text-align:right">${col}</th></tr>${rows.map((p,i)=>`<tr><td class="dim">${i+1}</td><td><a href="#/coin/${p.mint}">${nm(p.mint)}</a></td><td class="mono" style="text-align:right">${f(p)}</td></tr>`).join('')}</table>`:`<div class="empty">No coins yet</div>`
  el.innerHTML=`<div class="stats">${stat('Coins launched',a.coins)}${stat('Graduated',a.graduated,a.coins?Math.round(a.graduated/a.coins*100)+'% of launches':'')}${stat('Trading volume',sol(a.volumeSol),'from on-chain fees at '+(a.platformFeeRate*100).toFixed(2)+'%')}${stat('Platform fees',sol(a.feesAccruedSol+a.feesClaimedSol),sol(a.feesAccruedSol)+' claimable · '+sol(a.feesClaimedSol)+' claimed')}${stat('Treasury balance',sol(a.treasurySol),`<a class="mono" target="_blank" href="https://solscan.io/account/${a.treasury}">${short(a.treasury)} ↗</a>`)}${stat('SOL raised on curves',sol(a.raisedSol))}${stat('Trades',a.trades)}${stat('Unique holders',a.uniqueHolders)}</div>
  <div class="card" style="padding:18px;margin-top:14px"><div class="k" style="margin-bottom:12px">Launches per day (UTC)</div>${bars(a.launchesByDay)}</div>
  <div class="duo"><div class="card" style="padding:18px"><div class="k">Top coins by volume</div>${tbl(a.topByVolume,'Volume',p=>sol(p.volumeSol))}</div><div class="card" style="padding:18px"><div class="k">Top coins by holders</div>${tbl(a.topByHolders,'Holders',p=>p.holders)}</div></div>
  <div class="card" style="padding:18px;margin-top:14px"><div class="k">Recent activity</div>${a.activity.length?`<table>${a.activity.map(x=>`<tr><td><span class="tag${x.type==='sell'?' amb':''}">${x.type}</span></td><td><a href="#/coin/${x.mint}">${nm(x.mint)}</a></td><td class="mono">${x.sol?sol(x.sol):''}</td><td class="dim mono">${x.trader?short(x.trader):''}</td><td style="text-align:right"><a class="dim" target="_blank" href="https://solscan.io/tx/${x.sig}">${ago(x.t)} ago ↗</a></td></tr>`).join('')}</table>`:`<div class="empty">No launches or trades yet. Activity shows up here live.</div>`}</div>
  <p class="dim" style="font-size:12px;margin-top:14px">Live from Solana · platform <a class="mono" target="_blank" href="https://solscan.io/account/${a.platform}">${short(a.platform)}</a> · updated ${new Date(a.updated).toLocaleTimeString()} · refreshes every 60s</p>`}catch(e){el.innerHTML=`<div class="empty err">Couldn't load analytics: ${esc(e.message)}</div>`}}
 await draw();AT=setInterval(draw,60000)}
function route(){const r=location.hash.replace('#/','');const [p,a]=r.split('/');document.querySelectorAll('.nav a').forEach(x=>x.classList.toggle('on',x.getAttribute('href')==='#/'+r));
 p==='coin'&&a?coin(a):({create,how,analytics}[p]||home)();scrollTo(0,0)}
addEventListener('hashchange',route);route();
