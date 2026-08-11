const VERSION="1.0.1";
const BUILD="20260810-1000";
const $=id=>document.getElementById(id);
const LS={foods:"hc07.foods",seasonings:"hc07.seasonings",fridge:"hc07.fridge",records:"hc07.records",autoUpdate:"hc07.autoUpdate",favorites:"hc08.seasoningFavorites",recent:"hc08.seasoningRecent",foodHistory:"hc08.foodSearchHistory",aiHistory:"hc09.aiSearchHistory"};
const state={
 foods:JSON.parse(localStorage.getItem(LS.foods)||"[]"),
 seasonings:JSON.parse(localStorage.getItem(LS.seasonings)||"[]"),
 fridge:JSON.parse(localStorage.getItem(LS.fridge)||"[]"),
 records:JSON.parse(localStorage.getItem(LS.records)||"[]"),
 favorites:JSON.parse(localStorage.getItem(LS.favorites)||"[]"),
 recent:JSON.parse(localStorage.getItem(LS.recent)||"[]"),
 seasoningMode:"all",
 foodHistory:JSON.parse(localStorage.getItem(LS.foodHistory)||"[]"),
 aiHistory:JSON.parse(localStorage.getItem(LS.aiHistory)||"[]"),
 lastLookup:null,
 generated:[],
 editingRecordIndex:null
};
const foodData={
"肉類":[["鶏むね肉","good","good","good","高たんぱく・低脂質。皮を外すとさらに良い。"],["鶏もも肉","good","warn","good","皮に脂質が多い。"],["豚ロース","good","warn","good","脂身を避ける。"],["豚こま","good","warn","good","赤身中心を選ぶ。"],["豚バラ","good","bad","good","脂質が多い。"],["牛赤身","good","warn","warn","量を控えめに。"],["レバー","good","warn","bad","プリン体が非常に多い。"]],
"魚介":[["鮭","good","good","good","焼く・蒸す調理が向く。"],["サバ","good","good","warn","EPA・DHAは有益。食べ過ぎ注意。"],["アジ","good","good","warn","塩焼き向き。"],["ブリ","good","warn","warn","脂と甘い味付けに注意。"],["タラ","good","good","good","低脂質。"],["マグロ赤身","good","good","warn","大量摂取は控える。"],["イカ","good","good","warn","プリン体はやや多め。"],["エビ","good","good","warn","量を控えめに。"]],
"野菜":[["キャベツ","good","good","good","かさ増しに便利。"],["玉ねぎ","good","good","good","通常量なら問題なし。"],["人参","good","good","good","副菜向き。"],["大根","good","good","good","煮物の砂糖量に注意。"],["ブロッコリー","good","good","good","食物繊維を補いやすい。"],["小松菜","good","good","good","副菜・汁物向き。"],["ほうれん草","good","good","good","つゆの量に注意。"],["ピーマン","good","good","good","油を使いすぎない。"],["きのこ","good","good","good","低エネルギー。"],["もやし","good","good","good","かさ増し向き。"],["トマト","good","good","good","加工品は糖類添加に注意。"],["なす","good","good","good","油を吸いやすい。"],["ジャガイモ","warn","good","good","主食に近い糖質量。ご飯と重ねず、1食80〜100g程度を目安に。"],["長芋","warn","good","good","糖質を含むため、ご飯に多量にかける食べ方は控えめに。1食50〜100g程度が目安。"]],
"その他":[["卵","good","good","good","油を多用しない。"],["豆腐","good","good","good","主菜・副菜向き。"],["納豆","good","good","warn","1日1パック程度。"],["チーズ","good","warn","good","脂質・塩分に注意。"],["無糖ヨーグルト","good","good","good","加糖タイプは避ける。"],["こんにゃく","good","good","good","かさ増しに便利。"]]
};

const extraFoodData={
 "れんこん":{category:"野菜・根菜",blood:"warn",liver:"good",uric:"good",portion:"50〜80g",note:"でんぷん質を含みます。きんぴらや煮物では砂糖・みりんの量にも注意。",pairs:["鶏むね肉","豆腐","きのこ"]},
 "ごぼう":{category:"野菜・根菜",blood:"good",liver:"good",uric:"good",portion:"50〜80g",note:"食物繊維を取りやすい食材です。甘辛い味付けと油の使い過ぎに注意。",pairs:["鶏むね肉","こんにゃく","きのこ"]},
 "アボカド":{category:"果実・野菜",blood:"good",liver:"warn",uric:"good",portion:"1/4〜1/2個",note:"糖質は少なめですが脂質とエネルギーは高めです。適量を意識してください。",pairs:["豆腐","トマト","鶏むね肉"]},
 "かぼちゃ":{category:"野菜",blood:"warn",liver:"good",uric:"good",portion:"50〜80g",note:"野菜の中では糖質が多めです。主食と重ね過ぎず、甘い煮付けは控えめに。",pairs:["鶏むね肉","きのこ","小松菜"]},
 "さつまいも":{category:"いも類",blood:"warn",liver:"good",uric:"good",portion:"70〜100g",note:"食物繊維はありますが糖質量も多めです。間食では量を決めて食べましょう。",pairs:["無糖ヨーグルト","卵","小松菜"]},
 "里芋":{category:"いも類",blood:"warn",liver:"good",uric:"good",portion:"80〜100g",note:"いも類として糖質を含みます。煮物の砂糖量と主食との重複に注意。",pairs:["鶏むね肉","こんにゃく","大根"]},
 "オクラ":{category:"野菜",blood:"good",liver:"good",uric:"good",portion:"5〜8本",note:"食物繊維を取りやすく、副菜に使いやすい食材です。たれやドレッシングの塩分に注意。",pairs:["豆腐","納豆","卵"]},
 "ズッキーニ":{category:"野菜",blood:"good",liver:"good",uric:"good",portion:"100〜150g",note:"低糖質で使いやすい食材です。油を吸いやすいので炒め油は控えめに。",pairs:["鶏むね肉","トマト","きのこ"]},
 "自然薯":{category:"いも類",blood:"warn",liver:"good",uric:"good",portion:"50〜80g",note:"長芋と同様に糖質を含みます。とろろをご飯へ多量にかける食べ方は控えめに。",pairs:["卵","豆腐","海藻"]},
 "山芋":{category:"いも類",blood:"warn",liver:"good",uric:"good",portion:"50〜100g",note:"山芋類は糖質を含みます。主食との合計量を考えて使ってください。",pairs:["卵","豆腐","鶏むね肉"]}
};
const foodAliases={"じゃがいも":"ジャガイモ","馬鈴薯":"ジャガイモ","ばれいしょ":"ジャガイモ","ながいも":"長芋","山いも":"山芋","レンコン":"れんこん","蓮根":"れんこん","サツマイモ":"さつまいも","さといも":"里芋","南瓜":"かぼちゃ"};

const seasoningData=window.SEASONING_DB||[];
const recipes=[
{name:"鶏むね肉とキャベツの蒸し焼き",need:["鶏むね肉","キャベツ"],opt:["玉ねぎ","きのこ"],time:20,b:5,l:5,u:4,sea:["濃口しょうゆ"],steps:"薄切り → 蒸し焼き → しょうゆ少量"},
{name:"鮭ときのこのホイル焼き",need:["鮭","きのこ"],opt:["玉ねぎ","ピーマン"],time:25,b:5,l:5,u:4,sea:["濃口しょうゆ"],steps:"包む → 蒸す → 薄味"},
{name:"タラと豆腐の鍋",need:["タラ","豆腐"],opt:["キャベツ","大根","きのこ"],time:25,b:5,l:5,u:4,sea:["ポン酢"],steps:"だし → 具材を煮る → ポン酢少量"},
{name:"鶏むね肉の親子煮",need:["鶏むね肉","卵","玉ねぎ"],opt:[],time:20,b:4,l:5,u:4,sea:["キッコーマン 本つゆ 濃縮4倍"],steps:"鶏肉と玉ねぎ → つゆを薄める → 卵"},
{name:"サバと大根のさっぱり煮",need:["サバ","大根"],opt:[],time:30,b:4,l:5,u:3,sea:["濃口しょうゆ","本みりん"],steps:"湯通し → 煮る → 甘味控えめ"},
{name:"豚ロースと小松菜の炒め物",need:["豚ロース","小松菜"],opt:["もやし","きのこ"],time:15,b:5,l:4,u:4,sea:["濃口しょうゆ"],steps:"油少量 → 肉 → 野菜"},
{name:"豆腐と卵のスープ",need:["豆腐","卵"],opt:["小松菜","きのこ"],time:15,b:5,l:5,u:4,sea:["濃口しょうゆ"],steps:"だし → 豆腐 → 卵"},
{name:"ブリの照り焼き 甘味控えめ",need:["ブリ"],opt:["大根","小松菜"],time:25,b:3,l:3,u:3,sea:["濃口しょうゆ","本みりん"],steps:"脂を拭く → みりん少量"},
{name:"エビとブロッコリーの塩炒め",need:["エビ","ブロッコリー"],opt:["玉ねぎ"],time:15,b:5,l:5,u:3,sea:["料理酒"],steps:"下処理 → 少量の油 → 薄味"},
{name:"納豆・豆腐・野菜の和定食",need:["納豆","豆腐"],opt:["小松菜","大根"],time:10,b:5,l:5,u:4,sea:["濃口しょうゆ"],steps:"冷奴 → 納豆 → 野菜副菜"}
];
const allFoods=()=>Object.values(foodData).flat().map(x=>x[0]);
const foodObj=n=>Object.values(foodData).flat().find(x=>x[0]===n);
const normalizeFoodName=n=>{const clean=String(n||"").trim().replace(/[<>"'`]/g,"").slice(0,40);return foodAliases[clean]||clean;};
function lookupFood(name){
 const n=normalizeFoodName(name),base=foodObj(n);
 if(base)return {name:n,category:Object.entries(foodData).find(([,items])=>items.some(x=>x[0]===n))?.[0]||"食材",blood:base[1],liver:base[2],uric:base[3],portion:"適量",note:base[4],pairs:["野菜","たんぱく質食材","薄味の調味料"],registered:true};
 if(extraFoodData[n])return {name:n,...extraFoodData[n],registered:true};
 return {name:n,category:"未登録食材",blood:"warn",liver:"warn",uric:"warn",portion:"食品表示や公的な食品成分情報を確認",note:"詳細データが未登録のため、一般的な食材として簡易判定しています。種類・量・調理法により評価は変わります。",pairs:["野菜","豆腐","鶏むね肉"],registered:false};
}
const seaObj=n=>seasoningData.find(x=>x.name===n);
const badge=v=>v==="good"?["◎","good"]:v==="warn"?["△","warn"]:["×","bad"];
const save=()=>{localStorage.setItem(LS.foods,JSON.stringify(state.foods));localStorage.setItem(LS.seasonings,JSON.stringify(state.seasonings));localStorage.setItem(LS.fridge,JSON.stringify(state.fridge));localStorage.setItem(LS.records,JSON.stringify(state.records));localStorage.setItem(LS.favorites,JSON.stringify(state.favorites));localStorage.setItem(LS.recent,JSON.stringify(state.recent));localStorage.setItem(LS.foodHistory,JSON.stringify(state.foodHistory));localStorage.setItem(LS.aiHistory,JSON.stringify(state.aiHistory));};
function switchView(id){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view===id));window.scrollTo({top:0,behavior:"smooth"});}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>switchView(b.dataset.view));
document.querySelectorAll(".jump").forEach(b=>b.onclick=()=>switchView(b.dataset.target));


const aiProductHints=[
 {keys:["オイコス","oikos"],name:"オイコス（高たんぱくヨーグルト）",category:"乳製品",blood:"good",liver:"good",uric:"good",portion:"1個",note:"無糖・低糖タイプは高たんぱくで取り入れやすいです。フレーバー品は糖質表示を確認してください。"},
 {keys:["パルテノ"],name:"パルテノ（ギリシャヨーグルト）",category:"乳製品",blood:"good",liver:"good",uric:"good",portion:"1個",note:"無糖タイプを優先し、はちみつやソースの追加量に注意してください。"},
 {keys:["ミックスナッツ","ナッツ","アーモンド","くるみ","カシューナッツ"],name:"ミックスナッツ",category:"種実類",blood:"good",liver:"warn",uric:"good",portion:"20〜25g",note:"糖質は比較的少なめですが脂質とエネルギーは高めです。無塩タイプを少量に。"},
 {keys:["しょうゆ","醤油"],name:"しょうゆ",category:"調味料",blood:"good",liver:"good",uric:"good",portion:"小さじ1〜2",note:"主な注意点は塩分です。かけるより小皿で少量使う方が調整しやすいです。"},
 {keys:["ビール"],name:"ビール",category:"酒類",blood:"warn",liver:"bad",uric:"bad",portion:"できれば控える／飲むなら少量",note:"アルコールとプリン体の両面で肝臓・尿酸に注意が必要です。"},
 {keys:["日本酒","清酒"],name:"日本酒",category:"酒類",blood:"warn",liver:"bad",uric:"warn",portion:"1合以下を目安に休肝日を設定",note:"糖質とアルコールを含みます。飲酒量と頻度を記録してください。"},
 {keys:["ラーメン"],name:"ラーメン",category:"麺類",blood:"bad",liver:"warn",uric:"warn",portion:"麺少なめ・スープを残す",note:"糖質・脂質・塩分が重なりやすい食品です。野菜や卵を足し、スープは控えめに。"},
 {keys:["カレー"],name:"カレーライス",category:"主食・料理",blood:"bad",liver:"warn",uric:"good",portion:"ご飯120〜150g、ルー少なめ",note:"ご飯とルーで糖質・脂質が増えやすいです。野菜と赤身肉を増やしてください。"}
];
function analyzeFreeText(raw){
 const text=String(raw||"").trim();
 let found=aiProductHints.find(x=>x.keys.some(k=>text.toLowerCase().includes(k.toLowerCase())));
 if(!found){const food=lookupFood(text.replace(/[0-9０-９]+\s*(g|ｇ|グラム|個|枚|本|ml|mL|合).*/i,"").trim());found={...food};}
 let bs=found.blood==="bad"?2:found.blood==="warn"?1:0, ls=found.liver==="bad"?2:found.liver==="warn"?1:0, us=found.uric==="bad"?2:found.uric==="warn"?1:0;
 if(/大盛|特盛|食べ放題|満腹/.test(text)){bs++;ls++;}
 if(/揚げ|フライ|唐揚げ|天ぷら|脂身|マヨネーズ/.test(text))ls++;
 if(/砂糖|ジュース|コーラ|菓子|ケーキ|アイス/.test(text))bs++;
 if(/レバー|白子|あん肝|煮干し|干物|いわし|かつお|ホルモン/.test(text))us+=2;
 if(/日本酒|ビール|焼酎|ワイン|アルコール|飲酒/.test(text)){ls+=2;us++;bs+=.5;}
 const level=s=>s>=2?["× 注意","bad"]:s>=1?["△ やや注意","warn"]:["◎ 良好","good"];
 const b=level(bs),l=level(ls),u=level(us);
 const hb=bs>=2?"+0.1〜+0.2":bs>=1?"±0〜+0.1":"-0.1〜±0";
 const alt=ls>=2?"+3〜+8 U/L":ls>=1?"±0〜+3 U/L":"-3〜±0 U/L";
 const ua=us>=2?"+0.2〜+0.5 mg/dL":us>=1?"±0〜+0.2 mg/dL":"-0.2〜±0 mg/dL";
 return {...found,input:text,b,l,u,hb,alt,ua};
}
function renderAiHistory(){const e=$("aiSearchHistory");if(!e)return;e.innerHTML=state.aiHistory.length?`<span class="history-label">最近：</span>${state.aiHistory.map(x=>`<button class="food-chip" data-ai-history="${x.replace(/"/g,"&quot;")}">${x}</button>`).join("")}`:"";document.querySelectorAll("[data-ai-history]").forEach(b=>b.onclick=()=>{$("aiSearchInput").value=b.dataset.aiHistory;runAiSearchV10();});}
function runAiSearch(){const q=$("aiSearchInput").value.trim();if(!q)return alert("食品名や食べた内容を入力してください。");const r=analyzeFreeText(q);state.aiHistory=[q,...state.aiHistory.filter(x=>x!==q)].slice(0,8);save();renderAiHistory();$("aiSearchResult").innerHTML=`<article class="lookup-card"><small>${r.category||"AI簡易判定"}</small><h3>${r.name||q}</h3><p><span class="badge ${r.b[1]}">血糖 ${r.b[0]}</span><span class="badge ${r.l[1]}">肝臓 ${r.l[0]}</span><span class="badge ${r.u[1]}">尿酸 ${r.u[0]}</span></p><p><strong>目安：</strong>${r.portion||"量を決めて食べる"}</p><p>${r.note||"入力内容から一般的な特徴を簡易判定しました。"}</p><section class="ai-answer"><h4>🤖 AI参考回答</h4><p>現在の登録値（HbA1c ${Number($("baseHb").value||6).toFixed(1)}、ALT ${Math.round(Number($("baseAlt").value||45))}、尿酸 ${Number($("baseUa").value||6.9).toFixed(1)}）を踏まえると、食べる量・調理法・飲酒の有無を合わせて判断する必要があります。${r.note||""}</p></section><div class="prediction-grid"><article><span>HbA1c傾向</span><strong>${r.hb}</strong></article><article><span>ALT傾向</span><strong>${r.alt}</strong></article><article><span>尿酸傾向</span><strong>${r.ua}</strong></article></div><p class="fine">※端末内の登録データと入力語句による参考判定です。商品ごとの正確な栄養成分は商品表示を確認してください。</p><div class="lookup-actions"><button id="aiToRecord" class="primary">この内容を食事記録へ</button></div></article>`;$("aiToRecord").onclick=()=>{$("mealNameInput").value=r.name||q;$("mealFoodsInput").value=q;switchView("record");setTimeout(renderMealTextAnalysis,100);};}
$("aiSearchButton").onclick=runAiSearch;$("aiSearchInput").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();runAiSearch();}});document.querySelectorAll(".focus-ai-search").forEach(b=>b.addEventListener("click",()=>setTimeout(()=>$("aiSearchInput").focus(),200)));

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
 $("foodAdvice").innerHTML=state.foods.map(n=>{const x=lookupFood(n),b=badge(x.blood),l=badge(x.liver),u=badge(x.uric);return `<article class="card"><h3>${x.name}</h3><p><span class="badge ${b[1]}">血糖 ${b[0]}</span><span class="badge ${l[1]}">肝臓 ${l[0]}</span><span class="badge ${u[1]}">尿酸 ${u[0]}</span></p><p>${x.note}</p>${x.registered?"":"<p class=\"fine\">未登録食材の簡易判定</p>"}</article>`}).join("");
}
$("foodFilter").oninput=e=>renderFoods(e.target.value.trim());
$("clearFoods").onclick=()=>{state.foods=[];save();renderFoods($("foodFilter").value.trim());};

function aiFoodAnswer(info){
 const hb=Number($("baseHb")?.value||6),alt=Number($("baseAlt")?.value||45),ua=Number($("baseUa")?.value||6.9);
 const blood=info.blood==="good"?"血糖面では比較的取り入れやすい":info.blood==="warn"?"糖質量や食べる量を意識したい":"血糖面で注意が必要";
 const liver=info.liver==="good"?"肝臓面では大きな懸念は少ない":info.liver==="warn"?"脂質や調理油を控えめにしたい":"肝臓への負担に注意したい";
 const uric=info.uric==="good"?"尿酸面では比較的使いやすい":info.uric==="warn"?"食べ過ぎと水分不足に注意したい":"プリン体等に注意したい";
 return `${info.name}は、現在の登録値（HbA1c ${hb.toFixed(1)}、ALT ${Math.round(alt)}、尿酸 ${ua.toFixed(1)}）を踏まえると、${blood}食材です。${liver}一方、${uric}と考えられます。目安量は${info.portion}。${info.pairs.join("・")}などと組み合わせ、甘い味付けや油を増やし過ぎない調理がおすすめです。`;
}
function renderFoodHistory(){
 $("foodLookupHistory").innerHTML=state.foodHistory.length?`<span class="history-label">最近：</span>${state.foodHistory.map(n=>`<button type="button" class="food-chip" data-history-food="${n}">${n}</button>`).join("")}`:"";
 document.querySelectorAll("[data-history-food]").forEach(b=>b.onclick=()=>{$("foodLookupInput").value=b.dataset.historyFood;runFoodLookup();});
}
function runFoodLookup(){
 const raw=$("foodLookupInput").value.trim();if(!raw)return alert("食材名を入力してください。");
 const info=lookupFood(raw);state.lastLookup=info;state.foodHistory=[info.name,...state.foodHistory.filter(x=>x!==info.name)].slice(0,8);save();renderFoodHistory();
 const b=badge(info.blood),l=badge(info.liver),u=badge(info.uric);
 $("foodLookupResult").className="food-lookup-result";
 $("foodLookupResult").innerHTML=`<article class="lookup-card"><div class="lookup-title"><div><small>${info.category}${info.registered?"":"／簡易判定"}</small><h3>${info.name}</h3></div></div><p><span class="badge ${b[1]}">血糖 ${b[0]}</span><span class="badge ${l[1]}">肝臓 ${l[0]}</span><span class="badge ${u[1]}">尿酸 ${u[0]}</span></p><p><strong>1食の目安：</strong>${info.portion}</p><p><strong>食材注意：</strong>${info.note}</p><section class="ai-answer"><h4>🤖 AIからの参考回答</h4><p>${aiFoodAnswer(info)}</p></section><p class="fine">※AIによる参考情報です。診断・治療判断ではありません。未登録食材は簡易判定です。</p><div class="lookup-actions"><button id="addLookupFood" class="secondary">選択食材に追加</button><button id="lookupToChef" class="primary">この食材でAI献立</button></div></article>`;
 $("addLookupFood").onclick=()=>addLookupFood(info,false);$("lookupToChef").onclick=()=>addLookupFood(info,true);
}
function addLookupFood(info,toChef){state.foods=[...new Set([...state.foods,info.name])];save();renderFoods($("foodFilter").value.trim());renderFoodAdvice();renderSelected();if(toChef){state.generated=makeLookupMeals(info);renderGeneratedMeals(state.generated);switchView("chef");}}
function makeLookupMeals(info){const pair=info.pairs||["豆腐","野菜","卵"];return [
 {name:`${info.name}と${pair[0]}の薄味炒め`,need:[info.name],opt:[pair[0]],time:20,b:info.blood==="good"?5:4,l:info.liver==="good"?5:4,u:info.uric==="good"?5:4,sea:["濃口しょうゆ"],steps:`${info.name}を食べやすく切る → 油少量で加熱 → 薄味で仕上げる`,score:10,missing:[]},
 {name:`${info.name}と${pair[1]}のだし煮`,need:[info.name],opt:[pair[1]],time:25,b:4,l:5,u:5,sea:["白だし"],steps:`だしを薄める → ${info.name}と具材を煮る → 汁は飲み過ぎない`,score:9,missing:[]},
 {name:`${info.name}入り卵料理`,need:[info.name,"卵"],opt:[pair[2]],time:15,b:4,l:5,u:5,sea:["濃口しょうゆ"],steps:`${info.name}を下ごしらえ → 卵と合わせる → 油と調味料は控えめ`,score:8,missing:state.foods.includes("卵")?[]:["卵"]}
 ];}
$("foodLookupButton").onclick=runFoodLookup;$("foodLookupInput").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();runFoodLookup();}});
document.querySelectorAll(".focus-food-search").forEach(b=>b.addEventListener("click",()=>setTimeout(()=>$("foodLookupInput").focus(),250)));
renderFoodHistory();

function renderSeasonings(filter=""){
 const q=filter.toLowerCase();
 let matched=seasoningData.filter(x=>!q||`${x.name} ${x.category}`.toLowerCase().includes(q));
 if(state.seasoningMode==="favorites")matched=matched.filter(x=>state.favorites.includes(x.name));
 if(state.seasoningMode==="recent")matched=state.recent.map(n=>matched.find(x=>x.name===n)).filter(Boolean);
 $("seasoningCount").textContent=`${matched.length.toLocaleString("ja-JP")}件`;
 const groups={};matched.forEach(x=>(groups[x.category]??=[]).push(x));
 $("seasoningList").innerHTML=Object.entries(groups).map(([category,items])=>`<details class="seasoning-category" ${q||state.seasoningMode!=="all"?"open":""}><summary><span>${category}</span><strong>${items.length}件</strong></summary><div class="check-grid">${items.map(x=>`<label class="check-item seasoning-item"><input type="checkbox" data-sea="${x.name}" ${state.seasonings.includes(x.name)?"checked":""}><span>${x.name}</span><button type="button" class="favorite-btn ${state.favorites.includes(x.name)?"active":""}" data-fav="${x.name}" aria-label="お気に入り">★</button></label>`).join("")}</div></details>`).join("")||'<div class="box">該当する調味料がありません。</div>';
 document.querySelectorAll("[data-sea]").forEach(c=>c.onchange=()=>{state.seasonings=c.checked?[...new Set([...state.seasonings,c.dataset.sea])]:state.seasonings.filter(x=>x!==c.dataset.sea);if(c.checked)state.recent=[c.dataset.sea,...state.recent.filter(x=>x!==c.dataset.sea)].slice(0,12);save();renderSeasoningAdvice();});
 document.querySelectorAll("[data-fav]").forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();const n=b.dataset.fav;state.favorites=state.favorites.includes(n)?state.favorites.filter(x=>x!==n):[...state.favorites,n];save();renderSeasonings($("seasoningSearch").value.trim());});
 renderSeasoningAdvice();
}
function renderSeasoningAdvice(){
 if(!state.seasonings.length){$("seasoningAdvice").textContent="調味料を選ぶと注意を表示します。";return}
 $("seasoningAdvice").innerHTML=state.seasonings.map(n=>{const x=seaObj(n);if(!x)return `<article class="card"><h3>${n}</h3><p>旧バージョンの登録データです。再選択してください。</p></article>`;const b=badge(x.blood),l=badge(x.liver),u=badge(x.uric);return `<article class="card"><h3>${n}</h3><p><span class="badge ${b[1]}">血糖 ${b[0]}</span><span class="badge ${l[1]}">肝臓 ${l[0]}</span><span class="badge ${u[1]}">尿酸 ${u[0]}</span></p><p><strong>注意：</strong>${x.risk}</p><p>${x.advice}</p><p class="fine">${x.category}／${x.source}</p></article>`}).join("");
}
$("seasoningSearch").oninput=e=>{state.seasoningMode="all";renderSeasonings(e.target.value.trim());};
$("showFavorites").onclick=()=>{state.seasoningMode=state.seasoningMode==="favorites"?"all":"favorites";renderSeasonings($("seasoningSearch").value.trim());};
$("showRecent").onclick=()=>{state.seasoningMode=state.seasoningMode==="recent"?"all":"recent";renderSeasonings($("seasoningSearch").value.trim());};

function renderSelected(){const merged=[...new Set([...state.foods,...state.fridge.map(x=>x.name)])];$("selectedSummary").textContent=merged.length?merged.join("、"):"未選択";}
function daysTo(d){if(!d)return 999;const now=new Date();now.setHours(0,0,0,0);return Math.ceil((new Date(d+"T00:00:00")-now)/86400000);}
function generateMeals(){
 const selected=[...new Set([...state.foods,...state.fridge.map(x=>x.name)])],t=Number($("timeLimit").value),purpose=$("purpose").value,expiring=state.fridge.filter(x=>daysTo(x.expiry)<=2).map(x=>x.name);
 let ranked=recipes.map(r=>{const matched=r.need.filter(x=>selected.includes(x)).length,missing=r.need.filter(x=>!selected.includes(x)),opt=r.opt.filter(x=>selected.includes(x)).length;let score=matched*5+opt*1.5-missing.length*2+(r.time<=t?2:-3);if(purpose==="tired"&&r.time<=15)score+=3;if(purpose==="sake"&&/鮭|タラ|サバ|豆腐|ブリ/.test(r.name))score+=2;if(purpose==="light"&&r.l>=5)score+=2;if(purpose==="useup"&&r.need.some(x=>expiring.includes(x)))score+=4;return {...r,score,missing};}).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).slice(0,6);
 state.generated=ranked;
 renderGeneratedMeals(ranked);
}
function mealConsiderationLabel(score){return score>=5?["◎ とても配慮","good"]:score>=4?["○ 配慮","good"]:score>=3?["△ 要調整","warn"]:["！注意","bad"];}
function mealReason(type,r){
 const fish=/鮭|タラ|サバ|ブリ|エビ/.test(r.name),fried=/炒め|照り焼き/.test(r.name),soup=/鍋|スープ|煮/.test(r.name);
 if(type==="blood")return r.b>=5?"主食・砂糖が中心ではなく、糖質負荷を抑えやすい構成です。":r.b>=4?"比較的調整しやすいですが、つゆ・みりん・主食量を含めて考えます。":"甘い味付けや主食量を控えめにすると調整しやすくなります。";
 if(type==="liver")return r.l>=5?(fried?"油を少量にすれば脂質を抑えやすい構成です。":"揚げ物ではなく、総エネルギーと脂質を抑えやすい調理です。"):r.l>=4?"脂質・調理油・飲酒を重ねないことを前提に配慮しやすい献立です。":"脂質や甘い味付け、飲酒との重なりに注意が必要です。";
 return r.u>=5?"尿酸面で大きな注意食材が少ない構成です。":r.u>=4?(fish?"魚介を含むため満点扱いにはせず、量・飲酒・水分も合わせて評価します。":"食べ過ぎ・飲酒・水分不足を避ければ比較的調整しやすい構成です。"):(fish?"魚介の種類と量を考慮し、飲酒を重ねない方が安全側です。":"プリン体だけでなく飲酒・過食・脱水にも注意します。");
}
function renderGeneratedMeals(ranked){
 $("mealResults").innerHTML=ranked.length?ranked.map((r,i)=>{const ws=r.sea.map(seaObj).filter(Boolean).filter(x=>x.blood!=="good"||x.liver!=="good"||x.uric!=="good"),bl=mealConsiderationLabel(r.b),ll=mealConsiderationLabel(r.l),ul=mealConsiderationLabel(r.u);return `<article class="card"><h3>${i+1}. ${r.name}</h3><p class="fine"><strong>健康配慮度</strong>（5段階・高いほど配慮しやすい献立）</p><p><span class="badge ${bl[1]}">血糖への配慮 ${bl[0]} ${r.b}/5</span><span class="badge ${ll[1]}">肝臓への配慮 ${ll[0]} ${r.l}/5</span><span class="badge ${ul[1]}">尿酸への配慮 ${ul[0]} ${r.u}/5</span></p><details class="meal-score-detail"><summary>評価理由を見る</summary><p><strong>血糖：</strong>${mealReason("blood",r)}</p><p><strong>肝臓：</strong>${mealReason("liver",r)}</p><p><strong>尿酸：</strong>${mealReason("uric",r)}</p><p class="fine">※この点数は検査値や病状の重症度ではなく、献立を選ぶための参考配慮度です。食事量・調味料・飲酒で評価は変わります。</p></details><p><strong>${r.time}分</strong>　${r.steps}</p><p><strong>調味料：</strong>${r.sea.join("、")}</p>${ws.length?`<p><strong>調味料注意：</strong>${ws.map(x=>`${x.name}：${x.advice}`).join(" / ")}</p>`:""}${r.missing.length?`<p><strong>不足：</strong>${r.missing.join("、")}</p>`:""}<button class="secondary pick-meal" data-i="${i}">記録候補にする</button></article>`}).join(""):"<article class='card'>食材を2つ以上選んでください。</article>";
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


function renderMealTextAnalysis(){const text=[$("mealNameInput").value,$("mealFoodsInput").value,$("mealExtrasInput").value,$("mealMemoInput").value].join(" ").trim();if(!text){$("mealTextAnalysis").textContent="献立名・食材・調味料などを入力してください。";return null;}const r=analyzeFreeText(text);if($("mealAmountInput").value==="large"){r.b=["× 注意","bad"];r.l=["△ やや注意","warn"];}if($("fullnessInput").value==="full")r.b=["× 注意","bad"];$("mealTextAnalysis").innerHTML=`<p><span class="badge ${r.b[1]}">血糖 ${r.b[0]}</span><span class="badge ${r.l[1]}">肝臓 ${r.l[0]}</span><span class="badge ${r.u[1]}">尿酸 ${r.u[0]}</span></p><p>HbA1c ${r.hb}／ALT ${r.alt}／尿酸 ${r.ua}</p><p class="fine">入力内容からの簡易予測です。実測値を保証しません。</p>`;return r;}
$("analyzeMealText").onclick=renderMealTextAnalysis;

function updateMealSelect(selected=""){const names=[...new Set([...state.generated.map(x=>x.name),...recipes.map(x=>x.name)])];$("mealSelect").innerHTML='<option value="">選択してください</option>'+names.map(n=>`<option ${n===selected?"selected":""}>${n}</option>`).join("");}
const recordFieldIds=["mealNameInput","mealFoodsInput","mealExtrasInput","mealMemoInput"];
const selectFieldIds=["mealAmountInput","mealTimeInput","fullnessInput"];
const checkFieldIds=["water","walk","sweat","alcohol"];
function resetRecordForm(){
 state.editingRecordIndex=null;
 recordFieldIds.forEach(id=>$(id).value="");
 $("mealSelect").value="";
 $("mealAmountInput").value="normal";$("mealTimeInput").value="dinner";$("fullnessInput").value="normal";
 checkFieldIds.forEach(id=>$(id).checked=false);
 $("mealTextAnalysis").textContent="入力すると血糖・肝臓・尿酸への参考影響を表示します。";
 $("saveRecord").textContent="記録へ追加";$("cancelRecordEdit").hidden=true;$("recordEditNotice").hidden=true;
}
function startRecordEdit(index){
 const r=state.records[index];if(!r)return;
 state.editingRecordIndex=index;
 $("mealSelect").value=Array.from($("mealSelect").options).some(o=>o.value===r.meal)?r.meal:"";
 $("mealNameInput").value=r.meal||"";$("mealFoodsInput").value=r.foods||"";$("mealExtrasInput").value=r.extras||"";$("mealMemoInput").value=r.memo||"";
 $("mealAmountInput").value=r.amount||"normal";$("mealTimeInput").value=r.mealTime||"dinner";$("fullnessInput").value=r.fullness||"normal";
 checkFieldIds.forEach(id=>$(id).checked=Boolean(r[id]));
 $("saveRecord").textContent="更新してAI再判定";$("cancelRecordEdit").hidden=false;$("recordEditNotice").hidden=false;
 renderMealTextAnalysis();switchView("record");window.scrollTo({top:0,behavior:"smooth"});
}
$("cancelRecordEdit").onclick=resetRecordForm;
$("saveRecord").onclick=()=>{
 const selected=$("mealSelect").value,name=$("mealNameInput").value.trim()||selected,foods=$("mealFoodsInput").value.trim(),extras=$("mealExtrasInput").value.trim(),memo=$("mealMemoInput").value.trim();
 if(!name&&!foods)return alert("献立名または食材を入力してください。");
 const a=renderMealTextAnalysis()||analyzeFreeText(name||foods),score=v=>v[1]==="good"?5:v[1]==="warn"?3:1;
 const previous=state.editingRecordIndex===null?null:state.records[state.editingRecordIndex];
 const record={date:previous?.date||new Date().toISOString(),updatedAt:previous?new Date().toISOString():undefined,meal:name||"食事記録",foods,extras,memo,amount:$("mealAmountInput").value,mealTime:$("mealTimeInput").value,fullness:$("fullnessInput").value,b:score(a.b),l:score(a.l),u:score(a.u),trend:{hb:a.hb,alt:a.alt,ua:a.ua},water:$("water").checked,walk:$("walk").checked,sweat:$("sweat").checked,alcohol:$("alcohol").checked};
 if(state.editingRecordIndex===null)state.records.unshift(record);else state.records[state.editingRecordIndex]=record;
 save();renderRecords();renderPrediction();resetRecordForm();
};
$("clearRecords").onclick=()=>{if(confirm("すべての履歴を削除しますか？この操作は元に戻せません。")){state.records=[];save();renderRecords();renderPrediction();resetRecordForm();}};
const finiteNumber=(value,fallback)=>{const n=Number(value);return Number.isFinite(n)?n:fallback;};
const finiteScore=(value)=>{const n=Number(value);return Number.isFinite(n)?Math.max(1,Math.min(5,n)):3;};
function metricLevel(type,value){
 if(!Number.isFinite(value))return {className:"metric-unknown",label:"判定できません"};
 if(type==="hb")return value<5.7?{className:"metric-good",label:"✓ 参考範囲内"}:value<6.5?{className:"metric-warn",label:"△ 注意域"}:{className:"metric-bad",label:"! 高値域"};
 if(type==="alt")return value<=30?{className:"metric-good",label:"✓ 参考範囲内"}:value<=50?{className:"metric-warn",label:"△ やや高め"}:{className:"metric-bad",label:"! 高値域"};
 return value<=7?{className:"metric-good",label:"✓ 参考範囲内"}:value<9?{className:"metric-warn",label:"△ 注意域"}:{className:"metric-bad",label:"! 高値域"};
}
function applyMetricAlert(id,type,value,statusId){const card=$(id),status=$(statusId),level=metricLevel(type,value);card.classList.remove("metric-good","metric-warn","metric-bad","metric-unknown");card.classList.add(level.className);status.textContent=level.label;}
function calcPrediction(){
 const base={h:finiteNumber($("baseHb").value,6),a:finiteNumber($("baseAlt").value,45),u:finiteNumber($("baseUa").value,6.9)};
 const recent=state.records.slice(0,14);if(!recent.length)return {base,none:true};
 let sb=0,sl=0,su=0;
 for(const r of recent){const b=finiteScore(r.b),l=finiteScore(r.l),u=finiteScore(r.u);sb+=(b-3)*.06+(r.walk?.04:0)+(r.alcohol?-.02:0);sl+=(l-3)*.7+(r.walk?.3:0)+(r.alcohol?-1.4:0);su+=(u-3)*.04+(r.water?.05:0)+(r.sweat&&!r.water?-.04:0)+(r.alcohol?-.08:0);}
 const n=recent.length,hd=Math.max(-.3,Math.min(.3,-sb/n)),ad=Math.max(-8,Math.min(8,-sl/n)),ud=Math.max(-.6,Math.min(.6,-su/n));
 const h=[base.h+hd-.1,base.h+hd+.1],a=[Math.max(1,base.a+ad-3),base.a+ad+3],u=[Math.max(1,base.u+ud-.2),base.u+ud+.2];
 if(![...h,...a,...u].every(Number.isFinite))return {base,none:true,invalid:true};
 return {base,h,a,u,count:n};
}
function renderPrediction(){
 const p=calcPrediction();$("homeHb").textContent=p.base.h.toFixed(1);$("homeAlt").textContent=Math.round(p.base.a);$("homeUa").textContent=p.base.u.toFixed(1);
 applyMetricAlert("metricHb","hb",p.base.h,"homeHbStatus");applyMetricAlert("metricAlt","alt",p.base.a,"homeAltStatus");applyMetricAlert("metricUa","ua",p.base.u,"homeUaStatus");
 if(p.none){const msg=p.invalid?"数値を確認すると予測を表示できます。":"記録を入れると予測レンジが表示されます。";$("prediction").innerHTML=`<article class="prediction prediction-empty"><strong>データが不足しています</strong><span>${msg}</span></article>`;$("homeTrend").textContent=msg;return;}
 $("prediction").innerHTML=`<article class="prediction"><span>HbA1c参考</span><strong>${p.h[0].toFixed(1)}〜${p.h[1].toFixed(1)}</strong></article><article class="prediction"><span>ALT参考</span><strong>${Math.round(p.a[0])}〜${Math.round(p.a[1])}</strong></article><article class="prediction"><span>尿酸参考</span><strong>${p.u[0].toFixed(1)}〜${p.u[1].toFixed(1)}</strong></article>`;
 $("homeTrend").textContent=`直近${p.count}件からの参考傾向：HbA1c ${p.h[0].toFixed(1)}〜${p.h[1].toFixed(1)}、ALT ${Math.round(p.a[0])}〜${Math.round(p.a[1])}、尿酸 ${p.u[0].toFixed(1)}〜${p.u[1].toFixed(1)}`;
}
["baseHb","baseAlt","baseUa"].forEach(id=>$(id).oninput=renderPrediction);
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function renderRecords(){
 $("recordHistory").innerHTML=state.records.length?state.records.map((r,i)=>`<div class="history"><div class="history-head"><strong>${new Date(r.date).toLocaleString("ja-JP")}</strong><div class="history-actions"><button type="button" class="secondary small edit-record" data-index="${i}">編集</button><button type="button" class="danger small delete-record" data-index="${i}">削除</button></div></div>${escapeHtml(r.meal)}${r.foods?`<br><small>食材：${escapeHtml(r.foods)}</small>`:""}${r.extras?`<br><small>調味料・飲み物：${escapeHtml(r.extras)}</small>`:""}${r.trend?`<br><small>予測：HbA1c ${escapeHtml(r.trend.hb)}／ALT ${escapeHtml(r.trend.alt)}／尿酸 ${escapeHtml(r.trend.ua)}</small>`:""}${r.memo?`<br><small>メモ：${escapeHtml(r.memo)}</small>`:""}<br><small>水分:${r.water?"○":"－"} 歩行:${r.walk?"○":"－"} 発汗:${r.sweat?"○":"－"} 飲酒:${r.alcohol?"○":"－"}${r.updatedAt?`　編集済み:${new Date(r.updatedAt).toLocaleString("ja-JP")}`:""}</small></div>`).join(""):"まだ記録がありません。";
 document.querySelectorAll(".edit-record").forEach(b=>b.onclick=()=>startRecordEdit(Number(b.dataset.index)));
 document.querySelectorAll(".delete-record").forEach(b=>b.onclick=()=>{const i=Number(b.dataset.index),r=state.records[i];if(!r)return;if(confirm(`「${r.meal||"食事記録"}」を削除しますか？\nこの操作は元に戻せません。`)){state.records.splice(i,1);if(state.editingRecordIndex===i)resetRecordForm();else if(state.editingRecordIndex!==null&&state.editingRecordIndex>i)state.editingRecordIndex--;save();renderRecords();renderPrediction();}});
}


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

renderAiHistory();renderFoods();renderSeasonings();renderFridge();renderSelected();updateMealSelect();renderRecords();renderPrediction();renderFoodHistory();
registerServiceWorker().finally(()=>setTimeout(()=>checkForUpdate(false),800));

/* Ver1.0.1 AI献立評価表示・採点根拠改善 */
const LS10={products:"hc10.customProducts",consultHistory:"hc10.consultHistory"};
state.customProducts=JSON.parse(localStorage.getItem(LS10.products)||"[]");
state.consultHistory=JSON.parse(localStorage.getItem(LS10.consultHistory)||"[]");
function saveV10(){save();localStorage.setItem(LS10.products,JSON.stringify(state.customProducts));localStorage.setItem(LS10.consultHistory,JSON.stringify(state.consultHistory));}
const productKnowledge=[
 {keys:["創味つゆ","創味のつゆ"],name:"創味つゆ",maker:"創味食品",category:"めんつゆ・つゆ",ingredients:"しょうゆ、砂糖、食塩、削りぶし（かつお・さば）、醗酵調味料、にぼし、調味料（アミノ酸等）、カラメル色素",allergens:"小麦・さば・大豆",nutrition:"100ml当たりの公表値は商品ラベル・メーカー公式情報で確認してください。濃縮タイプのため使用量で摂取量が大きく変わります。",portion:"めんつゆは表示どおり希釈し、かけつゆでは汁を飲み干さない",blood:"warn",liver:"warn",uric:"warn",source:"内蔵参考情報／保存前に現行の商品ラベル・メーカー公式情報を確認",note:"砂糖を含む濃縮つゆです。血糖面では使用量、肝臓面では糖質・総摂取量、尿酸面ではつゆ単体より飲酒や主菜との組み合わせを重視します。"},
 {keys:["オイコス","oikos"],name:"オイコス",maker:"ダノン",category:"高たんぱくヨーグルト",ingredients:"商品・フレーバーにより異なるためラベル確認",allergens:"乳成分（商品により異なる）",nutrition:"無糖・加糖・フレーバーで糖質量が異なります。",portion:"1個",blood:"good",liver:"good",uric:"good",source:"内蔵参考情報／商品ラベル優先",note:"無糖タイプは血糖管理に取り入れやすく、加糖タイプは炭水化物表示を確認してください。"},
 {keys:["ミックスナッツ","アーモンド","くるみ"],name:"ミックスナッツ",maker:"",category:"種実類",ingredients:"アーモンド、くるみ、カシューナッツ等（商品により異なる）",allergens:"くるみ・カシューナッツ・アーモンド等は商品表示を確認",nutrition:"脂質・エネルギーが高いため少量でもカロリーが増えやすい食品です。",portion:"無塩タイプ20〜25g程度",blood:"good",liver:"warn",uric:"good",source:"一般食品参考情報",note:"糖質は比較的少なめですが、脂質と総エネルギーの過剰摂取には注意してください。"}
];
function customProductMatch(text){const t=String(text||"").toLowerCase();return state.customProducts.find(x=>t.includes(String(x.name||"").toLowerCase()));}
function knowledgeMatch(text){const c=customProductMatch(text);if(c)return {...c,source:(c.source||"マイ商品DB")+"／マイ商品DB優先",custom:true};const t=String(text||"").toLowerCase();return productKnowledge.find(x=>(x.keys||[]).some(k=>t.includes(k.toLowerCase())))||null;}
function healthLevel(code){return code==="bad"?"注意":code==="warn"?"やや注意":"比較的良好";}
function baseValues(){const num=(id,d)=>{const n=Number($(id)?.value);return Number.isFinite(n)?n:d};return {hb:num("baseHb",6),alt:num("baseAlt",45),ua:num("baseUa",6.9)};}
function detailedHealthHtml(q,r,k){const v=baseValues();const ing=k?.ingredients||"原材料情報は端末内データにありません。商品ラベルまたはメーカー公式情報を確認してください。";const allerg=k?.allergens||"アレルゲン情報は未登録です。商品表示を確認してください。";const nutr=k?.nutrition||"栄養成分は商品・量で変わるため、ラベルの1食量・100g/100ml表示を確認してください。";const source=k?.source||"端末内一般分類・入力語句による推定";return `<article class="lookup-card"><small>${escapeHtml(k?.category||r.category||"食品・食事")}</small><h3>${escapeHtml(k?.name||r.name||q)}</h3><p><span class="badge ${r.b[1]}">血糖 ${r.b[0]}</span><span class="badge ${r.l[1]}">肝臓 ${r.l[0]}</span><span class="badge ${r.u[1]}">尿酸 ${r.u[0]}</span></p><div class="answer-sections"><section><h4>① 原材料・使用材料</h4><p>${escapeHtml(ing)}</p><p><strong>アレルゲン：</strong>${escapeHtml(allerg)}</p></section><section><h4>② 栄養・使用量の見方</h4><p>${escapeHtml(nutr)}</p><p><strong>1回の目安：</strong>${escapeHtml(k?.portion||r.portion||"量を決めて使用")}</p></section><section><h4>③ 血糖への影響</h4><p><strong>${healthLevel(r.b[1])}。</strong>${r.b[1]==="good"?"糖質量が極端に多くなければ取り入れやすい食品です。":"糖質・主食との重複・食事量を確認してください。"} HbA1c ${v.hb.toFixed(1)}という登録値だけで一食後の血糖値は予測できないため、量と組み合わせを中心に評価します。</p></section><section><h4>④ 肝臓・脂肪肝への影響</h4><p><strong>${healthLevel(r.l[1])}。</strong>ALT ${Math.round(v.alt)}の登録値を踏まえ、アルコール、総エネルギー、脂質、糖質の重なりを確認します。${escapeHtml(k?.note||r.note||"")}</p></section><section><h4>⑤ 尿酸への影響</h4><p><strong>${healthLevel(r.u[1])}。</strong>尿酸 ${v.ua.toFixed(1)}の登録値を踏まえ、プリン体だけでなく飲酒・果糖・脱水・食べ過ぎも合わせて考えます。</p></section><section><h4>⑥ 今回の具体策</h4><p>${escapeHtml(k?.portion||r.portion||"まず1回量を決める")}。野菜・たんぱく質を組み合わせ、甘い味付けや飲酒が重なる場合はどちらかを控えめにしてください。</p></section></div><p class="fine"><strong>情報区分：</strong>${escapeHtml(source)}。商品情報は改定されるため、保存前・使用前に現行ラベルを優先してください。</p><div class="lookup-actions three"><button id="aiToRecord" class="primary">食事記録へ</button><button id="aiRegisterProduct" class="secondary">商品DBへ登録</button><button id="aiAskMore" class="secondary">この内容をAI相談</button></div><div id="aiRegisterEditor"></div></article>`;}
function showProductEditor(containerId,data){const e=$(containerId);if(!e)return;e.innerHTML=`<div class="product-editor"><h4>商品DB登録内容を確認</h4><div class="form-grid"><label>商品名<input id="regName" value="${escapeHtml(data.name||"")}"></label><label>メーカー<input id="regMaker" value="${escapeHtml(data.maker||"")}"></label><label>カテゴリー<input id="regCategory" value="${escapeHtml(data.category||"")}"></label><label>1回の目安<input id="regPortion" value="${escapeHtml(data.portion||"")}"></label></div><label>原材料<textarea id="regIngredients" rows="3">${escapeHtml(data.ingredients||"")}</textarea></label><label>アレルゲン<textarea id="regAllergens" rows="2">${escapeHtml(data.allergens||"")}</textarea></label><label>栄養・補足<textarea id="regNutrition" rows="3">${escapeHtml(data.nutrition||"")}</textarea></label><label>情報元<input id="regSource" value="${escapeHtml(data.source||"AI/端末内参考情報・要ラベル確認")}"></label><div class="record-save-actions"><button id="confirmProductSave" class="primary">確認して登録</button><button id="cancelProductSave" class="secondary">キャンセル</button></div><p class="fine">AI・内蔵情報は誤りや旧情報を含む可能性があります。商品ラベル・メーカー公式情報を確認してから登録してください。</p></div>`;$("cancelProductSave").onclick=()=>e.innerHTML="";$("confirmProductSave").onclick=()=>{const name=$("regName").value.trim();if(!name)return alert("商品名を入力してください。");const item={name,maker:$("regMaker").value.trim(),category:$("regCategory").value.trim(),portion:$("regPortion").value.trim(),ingredients:$("regIngredients").value.trim(),allergens:$("regAllergens").value.trim(),nutrition:$("regNutrition").value.trim(),source:$("regSource").value.trim(),blood:data.blood||"warn",liver:data.liver||"warn",uric:data.uric||"warn",note:data.note||"",savedAt:new Date().toISOString()};const i=state.customProducts.findIndex(x=>x.name===name);if(i>=0)state.customProducts[i]=item;else state.customProducts.unshift(item);saveV10();renderCustomProducts();e.innerHTML='<div class="save-success">✓ マイ商品DBへ登録しました。次回から登録情報を優先して判定します。</div>';};}
function renderCustomProducts(){const e=$("customProductList");if(!e)return;e.innerHTML=state.customProducts.length?state.customProducts.map((x,i)=>`<article class="card"><div class="history-head"><div><small>${escapeHtml(x.category||"商品")}</small><h3>${escapeHtml(x.name)}</h3></div><button class="danger small delete-custom" data-i="${i}">削除</button></div><p>${escapeHtml(x.ingredients||"原材料未登録")}</p><p class="fine">${escapeHtml(x.source||"")}／登録 ${new Date(x.savedAt).toLocaleDateString("ja-JP")}</p></article>`).join(""):"まだ登録がありません。";document.querySelectorAll(".delete-custom").forEach(b=>b.onclick=()=>{const x=state.customProducts[Number(b.dataset.i)];if(confirm(`「${x.name}」をマイ商品DBから削除しますか？`)){state.customProducts.splice(Number(b.dataset.i),1);saveV10();renderCustomProducts();}});}
function runAiSearchV10(){const q=$("aiSearchInput").value.trim();if(!q)return alert("食品名や食べた内容を入力してください。");const r=analyzeFreeText(q),k=knowledgeMatch(q);if(k){r.name=k.name;r.category=k.category;r.portion=k.portion;r.note=k.note||r.note;r.b=badge(k.blood);r.l=badge(k.liver);r.u=badge(k.uric);}state.aiHistory=[q,...state.aiHistory.filter(x=>x!==q)].slice(0,8);saveV10();renderAiHistory();$("aiSearchResult").innerHTML=detailedHealthHtml(q,r,k);$("aiToRecord").onclick=()=>{$("mealNameInput").value=r.name||q;$("mealFoodsInput").value=q;switchView("record");setTimeout(renderMealTextAnalysis,100);};$("aiRegisterProduct").onclick=()=>showProductEditor("aiRegisterEditor",{...(k||{}),name:k?.name||r.name||q,category:k?.category||r.category,portion:k?.portion||r.portion,blood:k?.blood||r.b[1],liver:k?.liver||r.l[1],uric:k?.uric||r.u[1],note:k?.note||r.note});$("aiAskMore").onclick=()=>{$("aiConsultInput").value=q;switchView("aiConsult");setTimeout(runAiConsult,100);};}
function consultAnswer(q){const r=analyzeFreeText(q),k=knowledgeMatch(q),v=baseValues();if(k){r.name=k.name;r.category=k.category;r.portion=k.portion;r.note=k.note||r.note;r.b=badge(k.blood);r.l=badge(k.liver);r.u=badge(k.uric);}const alcohol=/酒|ビール|日本酒|焼酎|ワイン|飲酒/.test(q);const over=/大盛|食べ放題|満腹|たくさん|飲みすぎ|飲み過ぎ/.test(q);return {r,k,html:`<article class="lookup-card"><h3>健康AI相談の回答</h3><p class="consult-summary">現在の登録値 HbA1c ${v.hb.toFixed(1)}／ALT ${Math.round(v.alt)}／尿酸 ${v.ua.toFixed(1)} を参考に、今回の内容を3方向から整理します。</p><div class="answer-sections"><section><h4>血糖・HbA1c</h4><p>${healthLevel(r.b[1])}。${r.b[1]==="good"?"主食量を適量にすれば大きな糖質負荷は重なりにくいと考えます。":"主食・砂糖・甘い飲料の重なりを減らし、野菜やたんぱく質から食べる方法が現実的です。"}</p></section><section><h4>肝臓・脂肪肝</h4><p>${healthLevel(r.l[1])}。${alcohol?"今回は飲酒を含むため、食品単体よりアルコール量と総エネルギーを優先して考えます。":"揚げ物・脂質・糖質の重複と食事量を確認してください。"}</p></section><section><h4>尿酸</h4><p>${healthLevel(r.u[1])}。${alcohol?"アルコールは尿酸排泄にも影響するため、水分を取り、飲酒量を増やさないことが重要です。":"プリン体だけでなく、脱水・果糖・過食も合わせて確認します。"}</p></section><section><h4>今日の具体策</h4><p>${over?"量を一段階減らし、":"量を決めて、"}${alcohol?"酒と甘い主食・揚げ物を同時に重ねず、合間に水を取る。":"主食を適量にし、野菜とたんぱく質を組み合わせる。"} 食後の実測値がある場合は、アプリの推定より実測を優先してください。</p></section>${k?`<section><h4>原材料・商品情報</h4><p>${escapeHtml(k.ingredients||"未登録")}</p><p><strong>アレルゲン：</strong>${escapeHtml(k.allergens||"未登録")}</p><p class="fine">${escapeHtml(k.source||"")}</p></section>`:""}</div><p class="fine">※これは診断ではなく、端末内データと入力語句を使った健康支援用の参考回答です。一食からHbA1c・ALT・尿酸の検査値そのものを数値予測しません。</p><div class="lookup-actions"><button id="consultToRecord" class="primary">食事記録へ</button>${k?'<button id="consultRegisterProduct" class="secondary">商品DBへ登録</button>':""}</div><div id="consultRegisterEditor"></div></article>`};}
function renderConsultHistory(){const e=$("aiConsultHistory");if(!e)return;e.innerHTML=state.consultHistory.length?`<span class="history-label">最近：</span>${state.consultHistory.map(x=>`<button class="food-chip consult-chip">${escapeHtml(x)}</button>`).join("")}`:"";document.querySelectorAll(".consult-chip").forEach((b,i)=>b.onclick=()=>{$("aiConsultInput").value=state.consultHistory[i];runAiConsult();});}
function runAiConsult(){const q=$("aiConsultInput").value.trim();if(!q)return alert("相談内容を入力してください。");state.consultHistory=[q,...state.consultHistory.filter(x=>x!==q)].slice(0,8);saveV10();renderConsultHistory();const a=consultAnswer(q);$("aiConsultResult").innerHTML=a.html;$("consultToRecord").onclick=()=>{$("mealNameInput").value=a.k?.name||q.slice(0,40);$("mealFoodsInput").value=q;switchView("record");setTimeout(renderMealTextAnalysis,100);};if($("consultRegisterProduct"))$("consultRegisterProduct").onclick=()=>showProductEditor("consultRegisterEditor",a.k);}
if($("aiSearchButton"))$("aiSearchButton").onclick=runAiSearchV10;
if($("aiSearchInput"))$("aiSearchInput").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();runAiSearchV10();}};
if($("aiConsultButton"))$("aiConsultButton").onclick=runAiConsult;
if($("aiConsultInput"))$("aiConsultInput").onkeydown=e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();runAiConsult();}};
if($("clearCustomProducts"))$("clearCustomProducts").onclick=()=>{if(!state.customProducts.length)return;if(confirm("マイ商品DBの登録をすべて削除しますか？")){state.customProducts=[];saveV10();renderCustomProducts();}};
renderConsultHistory();renderCustomProducts();
