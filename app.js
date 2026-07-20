const VERSION="0.8";
const BUILD="20260720";
const $=id=>document.getElementById(id);
const LS={foods:"hc07.foods",seasonings:"hc07.seasonings",fridge:"hc07.fridge",records:"hc07.records",autoUpdate:"hc07.autoUpdate"};
const state={
 foods:JSON.parse(localStorage.getItem(LS.foods)||"[]"),
 seasonings:JSON.parse(localStorage.getItem(LS.seasonings)||"[]"),
 fridge:JSON.parse(localStorage.getItem(LS.fridge)||"[]"),
 records:JSON.parse(localStorage.getItem(LS.records)||"[]"),
 generated:[]
};
const foodData={
"肉類":[["鶏むね肉","good","good","good","高たんぱく・低脂質。皮を外すとさらに良い。"],["鶏もも肉","good","warn","good","皮に脂質が多い。"],["豚ロース","good","warn","good","脂身を避ける。"],["豚こま","good","warn","good","赤身中心を選ぶ。"],["豚バラ","good","bad","good","脂質が多い。"],["牛赤身","good","warn","warn","量を控えめに。"],["レバー","good","warn","bad","プリン体が非常に多い。"]],
"魚介":[["鮭","good","good","good","焼く・蒸す調理が向く。"],["サバ","good","good","warn","EPA・DHAは有益。食べ過ぎ注意。"],["アジ","good","good","warn","塩焼き向き。"],["ブリ","good","warn","warn","脂と甘い味付けに注意。"],["タラ","good","good","good","低脂質。"],["マグロ赤身","good","good","warn","大量摂取は控える。"],["イカ","good","good","warn","プリン体はやや多め。"],["エビ","good","good","warn","量を控えめに。"]],
"野菜":[["キャベツ","good","good","good","かさ増しに便利。"],["玉ねぎ","good","good","good","通常量なら問題なし。"],["人参","good","good","good","副菜向き。"],["大根","good","good","good","煮物の砂糖量に注意。"],["ブロッコリー","good","good","good","食物繊維を補いやすい。"],["小松菜","good","good","good","副菜・汁物向き。"],["ほうれん草","good","good","good","つゆの量に注意。"],["ピーマン","good","good","good","油を使いすぎない。"],["きのこ","good","good","good","低エネルギー。"],["もやし","good","good","good","かさ増し向き。"],["トマト","good","good","good","加工品は糖類添加に注意。"],["なす","good","good","good","油を吸いやすい。"]],
"その他":[["卵","good","good","good","油を多用しない。"],["豆腐","good","good","good","主菜・副菜向き。"],["納豆","good","good","warn","1日1パック程度。"],["チーズ","good","warn","good","脂質・塩分に注意。"],["無糖ヨーグルト","good","good","good","加糖タイプは避ける。"],["こんにゃく","good","good","good","かさ増しに便利。"]]
};
const seasoningData=window.SEASONING_DB||[];
const recipes=[
{name:"鶏むね肉とキャベツの蒸し焼き",need:["鶏むね肉","キャベツ"],opt:["玉ねぎ","きのこ"],time:20,b:5,l:5,u:5,sea:["濃口しょうゆ"],steps:"薄切り → 蒸し焼き → しょうゆ少量"},
{name:"鮭ときのこのホイル焼き",need:["鮭","きのこ"],opt:["玉ねぎ","ピーマン"],time:25,b:5,l:5,u:5,sea:["濃口しょうゆ"],steps:"包む → 蒸す → 薄味"},
{name:"タラと豆腐の鍋",need:["タラ","豆腐"],opt:["キャベツ","大根","きのこ"],time:25,b:5,l:5,u:5,sea:["ポン酢"],steps:"だし → 具材を煮る → ポン酢少量"},
{name:"鶏むね肉の親子煮",need:["鶏むね肉","卵","玉ねぎ"],opt:[],time:20,b:4,l:5,u:5,sea:["キッコーマン 本つゆ 濃縮4倍"],steps:"鶏肉と玉ねぎ → つゆを薄める → 卵"},
{name:"サバと大根のさっぱり煮",need:["サバ","大根"],opt:[],time:30,b:4,l:5,u:3,sea:["濃口しょうゆ","本みりん"],steps:"湯通し → 煮る → 甘味控えめ"},
{name:"豚ロースと小松菜の炒め物",need:["豚ロース","小松菜"],opt:["もやし","きのこ"],time:15,b:5,l:4,u:5,sea:["濃口しょうゆ"],steps:"油少量 → 肉 → 野菜"},
{name:"豆腐と卵のスープ",need:["豆腐","卵"],opt:["小松菜","きのこ"],time:15,b:5,l:5,u:5,sea:["濃口しょうゆ"],steps:"だし → 豆腐 → 卵"},
{name:"ブリの照り焼き 甘味控えめ",need:["ブリ"],opt:["大根","小松菜"],time:25,b:3,l:3,u:3,sea:["濃口しょうゆ","本みりん"],steps:"脂を拭く → みりん少量"},
{name:"エビとブロッコリーの塩炒め",need:["エビ","ブロッコリー"],opt:["玉ねぎ"],time:15,b:5,l:5,u:3,sea:["料理酒"],steps:"下処理 → 少量の油 → 薄味"},
{name:"納豆・豆腐・野菜の和定食",need:["納豆","豆腐"],opt:["小松菜","大根"],time:10,b:5,l:5,u:4,sea:["濃口しょうゆ"],steps:"冷奴 → 納豆 → 野菜副菜"}
];
const allFoods=()=>Object.values(foodData).flat().map(x=>x[0]);
const foodObj=n=>Object.values(foodData).flat().find(x=>x[0]===n);
const seaObj=n=>seasoningData.find(x=>x.name===n);
const badge=v=>v==="good"?["◎","good"]:v==="warn"?["△","warn"]:["×","bad"];
const save=()=>{localStorage.setItem(LS.foods,JSON.stringify(state.foods));localStorage.setItem(LS.seasonings,JSON.stringify(state.seasonings));localStorage.setItem(LS.fridge,JSON.stringify(state.fridge));localStorage.setItem(LS.records,JSON.stringify(state.records));};
function switchView(id){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view===id));window.scrollTo({top:0,behavior:"smooth"});}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>switchView(b.dataset.view));
document.querySelectorAll(".jump").forEach(b=>b.onclick=()=>switchView(b.dataset.target));

function renderFoods(filter=""){
 const root=$("foodGroups");root.innerHTML="";
 for(const [group,items] of Object.entries(foodData)){
  const list=items.filter(x=>x[0].includes(filter));if(!list.length)continue;
  root.insertAdjacentHTML("beforeend",`<section class="group"><h3>${group}</h3><div class="check-grid">${list.map(x=>`<label class="check-item"><input type="checkbox" data-food="${x[0]}" ${state.foods.includes(x[0])?"checked":""}>${x[0]}</label>`).join("")}</div></section>`);
 }
 document.querySelectorAll("[data-food]").forEach(c=>c.onchange=()=>{state.foods=c.checked?[...new Set([...state.foods,c.dataset.food])]:state.foods.filter(x=>x!==c.dataset.food);save();renderFoodAdvice();renderSelected();});
 renderFoodAdvice();renderSelected();
}
function renderFoodAdvice(){
 if(!state.foods.length){$("foodAdvice").textContent="食材を選ぶと注意を表示します。";return}
 $("foodAdvice").innerHTML=state.foods.map(n=>{const x=foodObj(n),b=badge(x[1]),l=badge(x[2]),u=badge(x[3]);return `<article class="card"><h3>${n}</h3><p><span class="badge ${b[1]}">血糖 ${b[0]}</span><span class="badge ${l[1]}">肝臓 ${l[0]}</span><span class="badge ${u[1]}">尿酸 ${u[0]}</span></p><p>${x[4]}</p></article>`}).join("");
}
$("foodSearch").oninput=e=>renderFoods(e.target.value.trim());
$("clearFoods").onclick=()=>{state.foods=[];save();renderFoods($("foodSearch").value.trim());};

function renderSeasonings(filter=""){
 const q=filter.toLowerCase();
 const matched=seasoningData.filter(x=>!q||`${x.name} ${x.category}`.toLowerCase().includes(q));
 $("seasoningCount").textContent=`${matched.length.toLocaleString("ja-JP")}件`;
 const groups={};matched.forEach(x=>(groups[x.category]??=[]).push(x));
 $("seasoningList").innerHTML=Object.entries(groups).map(([category,items])=>`<details class="seasoning-category" ${q?"open":""}><summary><span>${category}</span><strong>${items.length}件</strong></summary><div class="check-grid">${items.slice(0,q?100:50).map(x=>`<label class="check-item"><input type="checkbox" data-sea="${x.name}" ${state.seasonings.includes(x.name)?"checked":""}>${x.name}</label>`).join("")}</div>${items.length>(q?100:50)?`<p class="fine">検索条件を追加すると残り${items.length-(q?100:50)}件も絞り込めます。</p>`:""}</details>`).join("")||'<div class="box">該当する調味料がありません。</div>';
 document.querySelectorAll("[data-sea]").forEach(c=>c.onchange=()=>{state.seasonings=c.checked?[...new Set([...state.seasonings,c.dataset.sea])]:state.seasonings.filter(x=>x!==c.dataset.sea);save();renderSeasoningAdvice();});
 renderSeasoningAdvice();
}
function renderSeasoningAdvice(){
 if(!state.seasonings.length){$("seasoningAdvice").textContent="調味料を選ぶと注意を表示します。";return}
 $("seasoningAdvice").innerHTML=state.seasonings.map(n=>{const x=seaObj(n);if(!x)return `<article class="card"><h3>${n}</h3><p>旧バージョンの登録データです。再選択してください。</p></article>`;const b=badge(x.blood),l=badge(x.liver),u=badge(x.uric);return `<article class="card"><h3>${n}</h3><p><span class="badge ${b[1]}">血糖 ${b[0]}</span><span class="badge ${l[1]}">肝臓 ${l[0]}</span><span class="badge ${u[1]}">尿酸 ${u[0]}</span></p><p><strong>注意：</strong>${x.risk}</p><p>${x.advice}</p><p class="fine">${x.category}／${x.source}</p></article>`}).join("");
}
$("seasoningSearch").oninput=e=>renderSeasonings(e.target.value.trim());

function renderSelected(){const merged=[...new Set([...state.foods,...state.fridge.map(x=>x.name)])];$("selectedSummary").textContent=merged.length?merged.join("、"):"未選択";}
function daysTo(d){if(!d)return 999;const now=new Date();now.setHours(0,0,0,0);return Math.ceil((new Date(d+"T00:00:00")-now)/86400000);}
function generateMeals(){
 const selected=[...new Set([...state.foods,...state.fridge.map(x=>x.name)])],t=Number($("timeLimit").value),purpose=$("purpose").value,expiring=state.fridge.filter(x=>daysTo(x.expiry)<=2).map(x=>x.name);
 let ranked=recipes.map(r=>{const matched=r.need.filter(x=>selected.includes(x)).length,missing=r.need.filter(x=>!selected.includes(x)),opt=r.opt.filter(x=>selected.includes(x)).length;let score=matched*5+opt*1.5-missing.length*2+(r.time<=t?2:-3);if(purpose==="tired"&&r.time<=15)score+=3;if(purpose==="sake"&&/鮭|タラ|サバ|豆腐|ブリ/.test(r.name))score+=2;if(purpose==="light"&&r.l>=5)score+=2;if(purpose==="useup"&&r.need.some(x=>expiring.includes(x)))score+=4;return {...r,score,missing};}).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).slice(0,6);
 state.generated=ranked;
 $("mealResults").innerHTML=ranked.length?ranked.map((r,i)=>{const ws=r.sea.map(seaObj).filter(Boolean).filter(x=>x.blood!=="good"||x.liver!=="good"||x.uric!=="good");return `<article class="card"><h3>${i+1}. ${r.name}</h3><p><span class="badge ${r.b>=4?"good":"warn"}">血糖 ${r.b}/5</span><span class="badge ${r.l>=4?"good":"warn"}">肝臓 ${r.l}/5</span><span class="badge ${r.u>=4?"good":"warn"}">尿酸 ${r.u}/5</span></p><p><strong>${r.time}分</strong>　${r.steps}</p><p><strong>調味料：</strong>${r.sea.join("、")}</p>${ws.length?`<p><strong>調味料注意：</strong>${ws.map(x=>`${x.name}：${x.advice}`).join(" / ")}</p>`:""}${r.missing.length?`<p><strong>不足：</strong>${r.missing.join("、")}</p>`:""}<button class="secondary pick-meal" data-i="${i}">記録候補にする</button></article>`}).join(""):"<article class='card'>食材を2つ以上選んでください。</article>";
 document.querySelectorAll(".pick-meal").forEach(b=>b.onclick=()=>{updateMealSelect(ranked[Number(b.dataset.i)].name);switchView("record");});
 updateMealSelect();
}
$("generateMeals").onclick=generateMeals;

function renderFridge(){
 $("fridgeFood").innerHTML=allFoods().map(n=>`<option>${n}</option>`).join("");
 if(!state.fridge.length){$("fridgeList").textContent="まだ登録がありません。";renderSelected();return}
 const sorted=[...state.fridge].sort((a,b)=>a.expiry.localeCompare(b.expiry));
 $("fridgeList").innerHTML=sorted.map(x=>{const d=daysTo(x.expiry),cls=d<0?"expired":d<=2?"soon":"";return `<div class="fridge-item"><strong>${x.name}</strong>　<span class="${cls}">${d<0?`${Math.abs(d)}日超過`:d===0?"今日まで":`あと${d}日`}</span><br><small>${x.expiry}</small> <button class="secondary small del-fridge" data-name="${x.name}" data-expiry="${x.expiry}">削除</button></div>`}).join("");
 document.querySelectorAll(".del-fridge").forEach(b=>b.onclick=()=>{const idx=state.fridge.findIndex(x=>x.name===b.dataset.name&&x.expiry===b.dataset.expiry);if(idx>=0)state.fridge.splice(idx,1);save();renderFridge();});
 renderSelected();
}
$("addFridge").onclick=()=>{if(!$("fridgeExpiry").value)return alert("期限を入力してください。");state.fridge.push({name:$("fridgeFood").value,expiry:$("fridgeExpiry").value});save();renderFridge();};
$("clearFridge").onclick=()=>{if(confirm("冷蔵庫登録を削除しますか？")){state.fridge=[];save();renderFridge();}};

function updateMealSelect(selected=""){const names=[...new Set([...state.generated.map(x=>x.name),...recipes.map(x=>x.name)])];$("mealSelect").innerHTML='<option value="">選択してください</option>'+names.map(n=>`<option ${n===selected?"selected":""}>${n}</option>`).join("");}
$("saveRecord").onclick=()=>{const name=$("mealSelect").value;if(!name)return alert("献立を選択してください。");const r=recipes.find(x=>x.name===name)||state.generated.find(x=>x.name===name);state.records.unshift({date:new Date().toISOString(),meal:name,b:r?.b||3,l:r?.l||3,u:r?.u||3,water:$("water").checked,walk:$("walk").checked,sweat:$("sweat").checked,alcohol:$("alcohol").checked});save();renderRecords();renderPrediction();};
$("clearRecords").onclick=()=>{if(confirm("履歴を削除しますか？")){state.records=[];save();renderRecords();renderPrediction();}};
function calcPrediction(){const base={h:Number($("baseHb").value||6),a:Number($("baseAlt").value||45),u:Number($("baseUa").value||6.9)},recent=state.records.slice(0,14);if(!recent.length)return {base,none:true};let sb=0,sl=0,su=0;for(const r of recent){sb+=(r.b-3)*.06+(r.walk?.04:0)+(r.alcohol?-.02:0);sl+=(r.l-3)*.7+(r.walk?.3:0)+(r.alcohol?-1.4:0);su+=(r.u-3)*.04+(r.water?.05:0)+(r.sweat&&!r.water?-.04:0)+(r.alcohol?-.08:0);}const n=recent.length,hd=Math.max(-.3,Math.min(.3,-sb/n)),ad=Math.max(-8,Math.min(8,-sl/n)),ud=Math.max(-.6,Math.min(.6,-su/n));return {base,h:[base.h+hd-.1,base.h+hd+.1],a:[Math.max(1,base.a+ad-3),base.a+ad+3],u:[Math.max(1,base.u+ud-.2),base.u+ud+.2],count:n};}
function renderPrediction(){const p=calcPrediction();$("homeHb").textContent=p.base.h.toFixed(1);$("homeAlt").textContent=Math.round(p.base.a);$("homeUa").textContent=p.base.u.toFixed(1);if(p.none){$("prediction").innerHTML="<article class='prediction'>記録後に表示します。</article>";$("homeTrend").textContent="まだ記録がありません。";return}$("prediction").innerHTML=`<article class="prediction"><span>HbA1c参考</span><strong>${p.h[0].toFixed(1)}〜${p.h[1].toFixed(1)}</strong></article><article class="prediction"><span>ALT参考</span><strong>${Math.round(p.a[0])}〜${Math.round(p.a[1])}</strong></article><article class="prediction"><span>尿酸参考</span><strong>${p.u[0].toFixed(1)}〜${p.u[1].toFixed(1)}</strong></article>`;$("homeTrend").textContent=`直近${p.count}件からの参考傾向：HbA1c ${p.h[0].toFixed(1)}〜${p.h[1].toFixed(1)}、ALT ${Math.round(p.a[0])}〜${Math.round(p.a[1])}、尿酸 ${p.u[0].toFixed(1)}〜${p.u[1].toFixed(1)}`;}
["baseHb","baseAlt","baseUa"].forEach(id=>$(id).oninput=renderPrediction);
function renderRecords(){$("recordHistory").innerHTML=state.records.length?state.records.map(r=>`<div class="history"><strong>${new Date(r.date).toLocaleString("ja-JP")}</strong><br>${r.meal}<br><small>水分:${r.water?"○":"－"} 歩行:${r.walk?"○":"－"} 発汗:${r.sweat?"○":"－"} 飲酒:${r.alcohol?"○":"－"}</small></div>`).join(""):"まだ記録がありません。";}

let barcodeControls=null,scanTimer=null,currentPhoto=null;
function setState(id,text,kind){const e=$(id);e.textContent=text;e.className=`state ${kind}`;}
async function startBarcode(){stopBarcode(false);setState("barcodeState","読込中","working");$("barcodeMessage").textContent="バーコードを枠内へ合わせてください。";try{if(!window.ZXingBrowser)throw new Error();const reader=new ZXingBrowser.BrowserMultiFormatReader(),devices=await ZXingBrowser.BrowserCodeReader.listVideoInputDevices(),rear=devices.find(d=>/back|rear|environment/i.test(d.label))||devices.at(-1);barcodeControls=await reader.decodeFromVideoDevice(rear?.deviceId,$("barcodeVideo"),result=>{if(result){$("barcodeResult").innerHTML=`<strong>読込完了</strong><br>${result.getText()}`;$("barcodeMessage").textContent="バーコードを読み取りました。";setState("barcodeState","読込完了","success");stopBarcode(false);}});scanTimer=setTimeout(()=>{if($("barcodeState").textContent==="読込中"){$("barcodeMessage").textContent="15秒以内に読み取れませんでした。明るさ・反射・距離を確認してください。";setState("barcodeState","読込失敗","failure");stopBarcode(false);}},15000);}catch{$("barcodeMessage").textContent="カメラまたはライブラリを利用できません。";setState("barcodeState","読込失敗","failure");}}
function stopBarcode(reset=true){if(scanTimer)clearTimeout(scanTimer);try{barcodeControls?.stop()}catch{}const s=$("barcodeVideo").srcObject;if(s)s.getTracks().forEach(t=>t.stop());$("barcodeVideo").srcObject=null;if(reset)setState("barcodeState","停止","idle");}
$("startScan").onclick=startBarcode;$("stopScan").onclick=()=>stopBarcode(true);
$("photoInput").onchange=e=>{currentPhoto=e.target.files?.[0];if(!currentPhoto)return;$("preview").src=URL.createObjectURL(currentPhoto);$("preview").hidden=false;$("ocrMessage").textContent="画像を受け取りました。";setState("ocrState","画像確認","working");};
function preprocess(file){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{const max=1800,s=Math.min(1,max/Math.max(img.width,img.height)),c=$("workCanvas");c.width=img.width*s;c.height=img.height*s;c.getContext("2d").drawImage(img,0,0,c.width,c.height);c.toBlob(resolve,"image/jpeg",.94)};img.onerror=reject;img.src=URL.createObjectURL(file);});}
$("runOcr").onclick=async()=>{if(!currentPhoto)return alert("画像を選択してください。");if(!window.Tesseract){setState("ocrState","読込失敗","failure");return}setState("ocrState","OCR処理中","working");$("ocrProgressWrap").hidden=false;try{const img=await preprocess(currentPhoto),r=await Tesseract.recognize(img,"jpn+eng",{logger:m=>{if(m.status==="recognizing text"){$("ocrProgressBar").style.width=Math.round(m.progress*100)+"%";$("ocrMessage").textContent=`文字認識中 ${Math.round(m.progress*100)}%`;}}});$("ocrText").value=(r.data.text||"").trim();setState("ocrState",$("ocrText").value.length>10?"読込完了":"読込失敗",$("ocrText").value.length>10?"success":"failure");}catch{setState("ocrState","読込失敗","failure");}};
$("judgeOcr").onclick=()=>{const t=$("ocrText").value.replace(/\s/g,""),risks=["ぶどう糖果糖液糖","果糖ぶどう糖液糖","高果糖液糖","異性化糖","砂糖","水あめ","酒精","アルコール","植物油脂","ショートニング","酵母エキス"],f=risks.filter(x=>t.includes(x));$("ocrResult").innerHTML=f.length?`<strong>注意原材料を検出</strong><br>${f.join("、")}<br><small>使用量と栄養成分も確認してください。</small>`:"注意対象は検出されませんでした。誤認識がないか確認してください。";};

// ----- 自動更新 -----
let swRegistration=null;
let updateInProgress=false;
const autoUpdateEnabled=()=>localStorage.getItem(LS.autoUpdate)!=="false";
$("autoUpdate").checked=autoUpdateEnabled();
$("autoUpdate").onchange=e=>localStorage.setItem(LS.autoUpdate,String(e.target.checked));

function compareVersion(a,b){
 const pa=String(a).split(".").map(Number),pb=String(b).split(".").map(Number);
 for(let i=0;i<Math.max(pa.length,pb.length);i++){const x=pa[i]||0,y=pb[i]||0;if(x>y)return 1;if(x<y)return -1}
 return 0;
}
async function fetchRemoteVersion(){
 const url=`./version.json?ts=${Date.now()}`;
 const response=await fetch(url,{cache:"no-store",headers:{"Cache-Control":"no-cache"}});
 if(!response.ok)throw new Error(`version.json ${response.status}`);
 return response.json();
}
function showUpdateBanner(info){
 $("updateTitle").textContent=`Ver${info.version}へ更新できます`;
 $("updateText").textContent=(info.changes||[]).join("・")||"最新版を取得します。";
 $("updateBanner").hidden=false;
 $("updateNow").onclick=()=>applyUpdate(info);
 $("updateLater").onclick=()=>$("updateBanner").hidden=true;
}
async function clearAppCaches(){
 const keys=await caches.keys();
 await Promise.all(keys.filter(k=>k.startsWith("healthtools-")).map(k=>caches.delete(k)));
}
async function applyUpdate(info){
 if(updateInProgress)return;
 updateInProgress=true;
 $("updateBanner").hidden=true;
 $("updateOverlay").hidden=false;
 $("updateProgress").textContent=`Ver${info.version}を取得しています。`;
 try{
  if(swRegistration){
   await swRegistration.update();
   if(swRegistration.waiting)swRegistration.waiting.postMessage({type:"SKIP_WAITING"});
  }
  await clearAppCaches();
  $("updateProgress").textContent="更新完了。再起動します。";
  localStorage.setItem("hc.lastUpdatedVersion",info.version);
  setTimeout(()=>location.replace(`${location.pathname}?v=${encodeURIComponent(info.version)}&t=${Date.now()}`),700);
 }catch(error){
  $("updateOverlay").hidden=true;
  updateInProgress=false;
  $("updateStatus").textContent=`更新失敗：${error.message}`;
  alert("更新に失敗しました。通信状態を確認して再度お試しください。");
 }
}
async function checkForUpdate(manual=false){
 try{
  if(manual)$("updateStatus").textContent="最新版を確認しています。";
  const info=await fetchRemoteVersion();
  if(compareVersion(info.version,VERSION)>0){
   $("updateStatus").textContent=`新しいVer${info.version}があります。`;
   if(autoUpdateEnabled()&&!manual){
    showUpdateBanner(info);
    setTimeout(()=>{if(!$("updateBanner").hidden&&autoUpdateEnabled())applyUpdate(info)},3500);
   }else showUpdateBanner(info);
  }else{
   $("updateStatus").textContent=`現在 Ver${VERSION}（最新版）`;
  }
 }catch(error){
  $("updateStatus").textContent=`更新確認できません：${error.message}`;
 }
}
$("manualUpdateCheck").onclick=()=>checkForUpdate(true);
window.addEventListener("online",()=>checkForUpdate(false));
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")checkForUpdate(false)});

async function registerServiceWorker(){
 if(!("serviceWorker" in navigator))return;
 try{
  swRegistration=await navigator.serviceWorker.register(`./service-worker.js?v=${VERSION}`,{updateViaCache:"none"});
  await swRegistration.update();
  navigator.serviceWorker.addEventListener("controllerchange",()=>{if(updateInProgress)return;location.reload()});
 }catch(error){
  console.warn("Service Worker registration failed",error);
 }
}

renderFoods();renderSeasonings();renderFridge();renderSelected();updateMealSelect();renderRecords();renderPrediction();
registerServiceWorker().finally(()=>setTimeout(()=>checkForUpdate(false),800));
