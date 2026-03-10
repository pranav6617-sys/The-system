import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════ */
const K = {
  bg:"#F6F3EE", card:"#FFFFFF", text:"#2D2A26", sub:"#9B9590",
  hint:"#CBC6BE", line:"#EDE9E3",
  accent:"#5B8DEF", accentSoft:"#EDF2FD",
  green:"#2D9B63", greenBg:"#DFFOE9",
  purple:"#8B5CC7", purpleBg:"#EDE4F7",
  red:"#D04848", redBg:"#FDE8E8",
  P:"#4CAF82", C:"#5B8DEF", N:"#E8923A", W:"#9B6DD7",
  shadow:"0 2px 12px rgba(45,42,38,0.06)",
  shadowLg:"0 4px 24px rgba(45,42,38,0.08)",
};
const F = `'Inter',-apple-system,system-ui,sans-serif`;
const PNAMES = { P:"Pranav", C:"Cushla", N:"Nanna", W:"Willow" };
const EMOJIS = ["☀️","🚗","🏠","✨","🧘","🌿","🏃‍♀️","⚽","🌤","🎧","👨‍👩‍👧‍👦","👴","🍽","🎉","📦","🧹","💪","🛒","📞","🐕","🎂","🏊","👕","🧸"];

/* ═══════════════════════════════════════
   MEAL OPTIONS
   ═══════════════════════════════════════ */
const MEAL_OPTS = {
  1: { adults:["Chilli","Chickpea curry","Chicken curry","Paneer curry"], kids:["Chicken curry (mild)","From Willow bank"] },
  2: { adults:["Chilli","Chickpea curry","Chicken curry","Paneer curry"], kids:["Chicken curry (mild)","From Willow bank"] },
  4: { adults:["Chicken rice bowl","Fish rice bowl","Steak tacos","Roast chicken","Protein + salad","Sandwiches"], kids:["Same (deconstructed)"] },
  5: { adults:["Chicken rice bowl","Fish rice bowl","Steak tacos","Roast chicken","Protein + salad","Sandwiches"], kids:["Same (deconstructed)"] },
};

/* ═══════════════════════════════════════
   WILLOW FRIDAY ROTATION
   ═══════════════════════════════════════ */
const W_AREAS = ["Pantry","Kids' wardrobe & drawers","Linen cupboard","Kitchen drawers & bench","Bathroom cupboards","Toy rotation & storage","Garage / entry / shoes","Adult wardrobe cull"];
const W_EP = new Date("2026-03-13");
function getWW(d){const f=new Date(d);f.setDate(f.getDate()-((f.getDay()+2)%7));return(((Math.floor((f-W_EP)/604800000))%8)+8)%8;}

/* ═══════════════════════════════════════
   DEFAULT TEMPLATES — no names in text
   ═══════════════════════════════════════ */
function defaultTpl(dow) {
  const m = {
    1: [
      {id:"ex1",icon:"🏃‍♀️",label:"Run (optional)",who:"C",hl:"green"},
      {id:"am",icon:"☀️",label:"Drop off Raf at 8",who:"C"},
      {id:"pu",icon:"🚗",label:"Pick up Raf with Mala at 3:15",who:"N"},
      {id:"pm",icon:"🏠",label:"On kids 4:30–6",who:"P"},
      {id:"aft",icon:"✨",label:"Lunches + bags",who:"C"},
      {id:"dinner",icon:"🍽",label:"Dinner",who:"",type:"dinner"},
    ],
    2: [
      {id:"ex1",icon:"💪",label:"Gym (optional)",who:"C",hl:"green"},
      {id:"am",icon:"☀️",label:"Free morning",who:"P"},
      {id:"am2",icon:"☀️",label:"Drop off both at 8",who:"C"},
      {id:"pu",icon:"🚗",label:"Pick up both at 3:15",who:"N"},
      {id:"pm",icon:"🏠",label:"Monday leftovers · Home by 6",who:"P"},
      {id:"aft",icon:"✨",label:"Lunches + bags",who:"C"},
      {id:"dinner",icon:"🍽",label:"Dinner",who:"",type:"dinner"},
    ],
    3: [
      {id:"ex1",icon:"🧘",label:"Yoga (optional)",who:"P",hl:"green"},
      {id:"wil",icon:"🧹",label:"Willow cooks",who:"W",hl:"purple",type:"willow-wed"},
      {id:"am",icon:"☀️",label:"Drop off both at 8",who:"P"},
      {id:"pu",icon:"🚗",label:"Pick up both at 3:15",who:"N"},
      {id:"pm",icon:"🏠",label:"Willow's meal · Home ~5:30",who:"P"},
      {id:"aft",icon:"✨",label:"Lunches + bags",who:"P"},
      {id:"dinner",icon:"🍽",label:"Dinner",who:"",type:"dinner"},
    ],
    4: [
      {id:"ex1",icon:"🏃‍♀️",label:"Run home (optional)",who:"C",hl:"green"},
      {id:"wil",icon:"🧹",label:"Willow cleans",who:"W",hl:"purple"},
      {id:"am",icon:"☀️",label:"Drop off both at 8",who:"C"},
      {id:"pu",icon:"🚗",label:"Pick up both at 4:30",who:"P"},
      {id:"pm",icon:"🏠",label:"Home ~6:15",who:"C"},
      {id:"aft",icon:"✨",label:"Lunches + bags",who:"C"},
      {id:"dinner",icon:"🍽",label:"Dinner",who:"",type:"dinner"},
    ],
    5: [
      {id:"ex1",icon:"🏃‍♀️",label:"Run to work (optional)",who:"C",hl:"green"},
      {id:"wil",icon:"🧹",label:"Willow — big job",who:"W",hl:"purple",type:"willow-fri"},
      {id:"am",icon:"☀️",label:"Drop off both at 8",who:"P"},
      {id:"pu",icon:"🚗",label:"Pick up both at 5",who:"C"},
      {id:"dinner",icon:"🍽",label:"Dinner",who:"",type:"dinner"},
    ],
    6: [
      {id:"ex1",icon:"🧘",label:"Yoga (optional)",who:"P",hl:"green"},
      {id:"am",icon:"☀️",label:"One kid each till 10",who:"PC"},
      {id:"pfree",icon:"🌿",label:"Free 10–12:30",who:"P",free:true},
      {id:"cfree",icon:"🌿",label:"Free 1–3:30",who:"C",free:true},
      {id:"fam",icon:"👨‍👩‍👧‍👦",label:"Family from 3:30",who:"PC"},
      {id:"dinner",icon:"🍽",label:"Dinner",who:"",type:"dinner"},
    ],
    0: [
      {id:"ex1",icon:"🏃‍♀️",label:"Run 7:30–9",who:"C",hl:"green"},
      {id:"ex2",icon:"🏊",label:"Walk/swim ~5pm (optional)",who:"C",hl:"green"},
      {id:"foot",icon:"⚽",label:"Raf football 9:30",who:"P"},
      {id:"flex",icon:"🌤",label:"Flexi 10:30–12",who:"PC"},
      {id:"psolo",icon:"🎧",label:"Meal prep + jobs 2–4:30",who:"P",free:true},
      {id:"fam",icon:"👨‍👩‍👧‍👦",label:"Family from 4:30",who:"PC"},
      {id:"aft",icon:"✨",label:"Lunches + bags",who:"C"},
      {id:"dinner",icon:"🍽",label:"Dinner",who:"",type:"dinner"},
    ],
  };
  return m[dow]||m[1];
}

function dayMeta(dow) {
  const m = {
    1:{st:{P:"WFH",C:"Office"},kids:{M:"Nanna (all day)",R:"Kindy"}},
    2:{st:{P:"Office",C:"WFH"},kids:{M:"Daycare",R:"Kindy"}},
    3:{st:{P:"Office",C:"WFH"},kids:{M:"Daycare",R:"Kindy"}},
    4:{st:{P:"WFH",C:"Office"},kids:{M:"Daycare",R:"Kindy"}},
    5:{st:{P:"WFH",C:"Office"},kids:{M:"Daycare",R:"Kindy"}},
    6:{st:{P:"Home",C:"Home"},kids:{M:"Home",R:"Home"}},
    0:{st:{P:"Home",C:"Home"},kids:{M:"Home",R:"Home"}},
  };
  return m[dow]||m[1];
}

/* ═══════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════ */
const dk = d=>d.toISOString().split("T")[0];
const dn = d=>["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()];
const sd = d=>d.toLocaleDateString("en-NZ",{weekday:"short"});
const isT = d=>d.toDateString()===new Date().toDateString();
const uid = ()=>Math.random().toString(36).slice(2,8);
const mkD = n=>{const o=[],t=new Date();for(let i=0;i<n;i++){const d=new Date(t);d.setDate(d.getDate()+i);o.push(d)}return o;};

/* ═══ Storage ═══ */
function LD(){try{return JSON.parse(localStorage.getItem("hos6")||"{}");} catch{return {};}}
function SV(d){
  try{localStorage.setItem("hos6",JSON.stringify(d));}catch{}
  // Sync to server for Telegram notifications
  try{fetch("/api/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)}).catch(()=>{});}catch{}
}

/* ═══ Get resolved blocks for a date ═══ */
function getBlocks(date,data) {
  const dow = date.getDay();
  const tpl = data[`tpl-${dow}`] || defaultTpl(dow);
  const key = dk(date);
  const ovs = data[`ov-${key}`] || {};
  const adds = data[`add-${key}`] || [];
  const rows = tpl.map(r => {
    const ov = ovs[r.id];
    return ov ? {...r, ...ov} : {...r};
  });
  return [...rows, ...adds];
}

/* ═══ Bold text renderer ═══ */
function renderBold(text) {
  if (!text) return text;
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((p,i) => 
    p.startsWith("*")&&p.endsWith("*") 
      ? <strong key={i} style={{fontWeight:700}}>{p.slice(1,-1)}</strong> 
      : p
  );
}

/* ═══════════════════════════════════════
   ATOMS
   ═══════════════════════════════════════ */
const Dot = ({who,s=10})=>(
  <span style={{width:s,height:s,borderRadius:s,background:K[who]||K.hint,display:"inline-block",flexShrink:0,transition:"transform 0.15s"}}/>
);

function PersonDots({who, onLongPress}) {
  const timerRef = useRef(null);
  const moved = useRef(false);
  const onTS = e => {
    moved.current = false;
    timerRef.current = setTimeout(()=>{if(!moved.current&&onLongPress)onLongPress(e);},500);
  };
  const onTM = ()=>{moved.current=true;clearTimeout(timerRef.current);};
  const onTE = ()=>clearTimeout(timerRef.current);
  return(
    <span onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
      onMouseDown={onTS} onMouseUp={onTE}
      style={{display:"inline-flex",gap:3,alignItems:"center",padding:"4px 6px",borderRadius:8,cursor:"pointer",
        background:"rgba(0,0,0,0.03)",minWidth:20,minHeight:20}}>
      {(who||"").split("").map((w,i)=><Dot key={i} who={w}/>)}
      {!who&&<Dot who=""/>}
    </span>
  );
}

const Pill = ({label,on,onClick,color=K.accent,bg=K.accentSoft})=>(
  <button onClick={onClick} style={{padding:"8px 15px",borderRadius:24,border:"none",
    background:on?bg:"#EFEAE4",color:on?color:K.sub,fontFamily:F,fontSize:13,
    fontWeight:on?600:400,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.12s"}}>{label}</button>
);

/* ═══════════════════════════════════════
   PERSON PICKER (popup)
   ═══════════════════════════════════════ */
function PersonPicker({current, onSelect, onClose, pos}) {
  const opts = ["P","C","N","W","PC",""];
  return(
    <div style={{position:"fixed",inset:0,zIndex:90}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        position:"absolute", top:Math.min(pos?.y||100, window.innerHeight-200), left:Math.min(pos?.x||20, window.innerWidth-200),
        background:K.card, borderRadius:14, boxShadow:K.shadowLg, padding:10,
        display:"flex",gap:6,flexWrap:"wrap",maxWidth:200,
      }}>
        {opts.map(o=>(
          <button key={o||"none"} onClick={()=>{onSelect(o);onClose();}} style={{
            padding:"8px 12px",borderRadius:10,border:current===o?`2px solid ${K.accent}`:`1px solid ${K.line}`,
            background:current===o?K.accentSoft:K.bg,fontFamily:F,fontSize:12,fontWeight:600,
            cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:K.text,
          }}>
            {o?o.split("").map((w,i)=><Dot key={i} who={w} s={8}/>):"None"}
            {o&&<span style={{fontSize:10,color:K.sub}}>{o.split("").map(w=>PNAMES[w]?.slice(0,1)).join("+")}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   EDIT SHEET
   ═══════════════════════════════════════ */
function EditSheet({block, date, isNew, mealOpts, willowFri, data, onSave, onCancel, onDelete, onMove, canUp, canDown}) {
  const [label, setLabel] = useState(block?.label||"");
  const [icon, setIcon] = useState(block?.icon||"☀️");
  const [scope, setScope] = useState("recurring");
  const [notify, setNotify] = useState(block?.notify||false);
  const [notifyTime, setNotifyTime] = useState(block?.notifyTime||"08:00");
  const [notifyWho, setNotifyWho] = useState(block?.notifyWho||"PC");
  const [mealAdults, setMA] = useState("");
  const [mealKids, setMK] = useState("");
  const [mealCustom, setMC] = useState("");
  const [wilSel, setWilSel] = useState("");

  const isDinner = block?.type === "dinner";
  const isWilFri = block?.type === "willow-fri";

  // Load meal data
  useEffect(()=>{
    if(isDinner){
      const mKey = scope==="recurring" ? `meal-${date.getDay()}` : `meald-${dk(date)}`;
      const m = data[mKey]||{};
      setMA(m.adults||""); setMK(m.kids||""); setMC(m.custom||"");
    }
    if(isWilFri){
      const w = data[`wil-${dk(date)}`]||"";
      setWilSel(w);
    }
  },[]);

  const handleSave = () => {
    let finalLabel = label;
    if(isDinner) {
      const parts = [];
      if(mealAdults) parts.push(mealAdults);
      if(mealKids) parts.push(`Kids: ${mealKids}`);
      if(mealCustom) parts.push(mealCustom);
      finalLabel = parts.length ? `Dinner: ${parts.join(" · ")}` : "Dinner";
    }
    if(isWilFri && wilSel) {
      finalLabel = wilSel;
    }
    onSave({
      ...block, label:finalLabel, icon, id:block?.id||uid(), custom:isNew||block?.custom,
      notify, notifyTime, notifyWho,
      ...(isDinner ? {mealAdults,mealKids,mealCustom} : {}),
      ...(isWilFri ? {wilSel} : {}),
    }, scope);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(45,42,38,0.3)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onCancel}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:K.card,borderRadius:"20px 20px 0 0",padding:"14px 18px 32px",width:"100%",maxWidth:540,
        maxHeight:"85vh",overflowY:"auto",
      }}>
        <div style={{width:36,height:4,borderRadius:2,background:K.line,margin:"0 auto 12px"}}/>

        {/* Emoji picker */}
        {!isDinner && (
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
            {EMOJIS.map(e=>(
              <button key={e} onClick={()=>setIcon(e)} style={{
                width:34,height:34,borderRadius:9,border:icon===e?`2px solid ${K.accent}`:`1px solid ${K.line}`,
                background:icon===e?K.accentSoft:K.bg,fontSize:16,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>{e}</button>
            ))}
          </div>
        )}

        {/* Text input */}
        {!isDinner && !isWilFri && (
          <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="What's happening? Use *bold*"
            style={{width:"100%",padding:"12px 14px",borderRadius:14,border:`1px solid ${K.line}`,fontFamily:F,
              fontSize:15,color:K.text,outline:"none",boxSizing:"border-box",background:K.bg,marginBottom:10}} />
        )}

        {/* Dinner pills */}
        {isDinner && mealOpts && (
          <>
            <div style={{fontSize:10,fontWeight:700,color:K.sub,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Adults</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
              {mealOpts.adults.map(o=><Pill key={o} label={o} on={mealAdults===o} onClick={()=>setMA(mealAdults===o?"":o)}/>)}
            </div>
            <div style={{fontSize:10,fontWeight:700,color:K.sub,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Kids</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
              {mealOpts.kids.map(o=><Pill key={o} label={o} on={mealKids===o} onClick={()=>setMK(mealKids===o?"":o)}/>)}
            </div>
            <div style={{fontSize:10,fontWeight:700,color:K.sub,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Custom</div>
            <input value={mealCustom} onChange={e=>setMC(e.target.value)} placeholder="Takeaways, fish and chips..."
              style={{width:"100%",padding:"10px 14px",borderRadius:12,border:`1px solid ${K.line}`,fontFamily:F,
                fontSize:13,color:K.text,outline:"none",boxSizing:"border-box",background:K.bg,marginBottom:10}} />
          </>
        )}

        {/* Willow Friday pills */}
        {isWilFri && (
          <>
            <div style={{fontSize:10,fontWeight:700,color:K.purple,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Area</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {W_AREAS.map((a,i)=>(
                <Pill key={a} label={a} on={wilSel===a||(!wilSel&&i===getWW(date))}
                  onClick={()=>setWilSel(wilSel===a?"":a)} color={K.purple} bg={K.purpleBg}/>
              ))}
            </div>
            <input value={label.includes("Willow")?"":(label)} onChange={e=>setLabel(e.target.value)} placeholder="Custom job..."
              style={{width:"100%",padding:"10px 14px",borderRadius:12,border:`1px solid ${K.line}`,fontFamily:F,
                fontSize:13,color:K.text,outline:"none",boxSizing:"border-box",background:K.bg,marginBottom:10}} />
          </>
        )}

        {/* Scope */}
        <div style={{display:"flex",gap:6,marginBottom:12}}>
          <button onClick={()=>setScope("recurring")} style={{
            flex:1,padding:10,borderRadius:12,border:"none",
            background:scope==="recurring"?K.text:"#EFEAE4",color:scope==="recurring"?"#fff":K.sub,
            fontFamily:F,fontSize:12.5,fontWeight:600,cursor:"pointer",
          }}>Every {dn(date)}</button>
          <button onClick={()=>setScope("oneoff")} style={{
            flex:1,padding:10,borderRadius:12,border:"none",
            background:scope==="oneoff"?K.text:"#EFEAE4",color:scope==="oneoff"?"#fff":K.sub,
            fontFamily:F,fontSize:12.5,fontWeight:600,cursor:"pointer",
          }}>Just {date.getDate()}/{date.getMonth()+1}</button>
        </div>

        {/* Notify */}
        <div style={{background:K.bg,borderRadius:12,padding:"10px 14px",marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:600,color:K.text}}>🔔 Notify</span>
            <button onClick={()=>setNotify(!notify)} style={{
              width:44,height:26,borderRadius:13,border:"none",cursor:"pointer",
              background:notify?K.accent:"#D1CEC8",transition:"background 0.2s",position:"relative",
            }}>
              <span style={{
                position:"absolute",top:3,left:notify?21:3,width:20,height:20,borderRadius:10,
                background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.15)",
              }}/>
            </button>
          </div>
          {notify && (
            <div style={{marginTop:10,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <input type="time" value={notifyTime} onChange={e=>setNotifyTime(e.target.value)}
                style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${K.line}`,fontFamily:F,fontSize:13,color:K.text,outline:"none"}} />
              <div style={{display:"flex",gap:4}}>
                {["P","C"].map(p=>(
                  <button key={p} onClick={()=>setNotifyWho(notifyWho.includes(p)?notifyWho.replace(p,""):notifyWho+p)}
                    style={{
                      padding:"6px 12px",borderRadius:8,border:"none",fontSize:12,fontWeight:600,cursor:"pointer",
                      background:notifyWho.includes(p)?`${K[p]}20`:K.bg,color:notifyWho.includes(p)?K[p]:K.hint,
                    }}>{PNAMES[p]}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reorder */}
        {!isNew && scope==="recurring" && (
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <button disabled={!canUp} onClick={()=>onMove?.("up")} style={{
              flex:1,padding:10,borderRadius:12,border:"none",
              background:canUp?K.accentSoft:"#EFEAE4",color:canUp?K.accent:K.hint,
              fontFamily:F,fontSize:13,fontWeight:600,cursor:canUp?"pointer":"default",
            }}>↑ Move up</button>
            <button disabled={!canDown} onClick={()=>onMove?.("down")} style={{
              flex:1,padding:10,borderRadius:12,border:"none",
              background:canDown?K.accentSoft:"#EFEAE4",color:canDown?K.accent:K.hint,
              fontFamily:F,fontSize:13,fontWeight:600,cursor:canDown?"pointer":"default",
            }}>↓ Move down</button>
          </div>
        )}

        {/* Actions */}
        <div style={{display:"flex",gap:8}}>
          {onDelete && (
            <button onClick={onDelete} style={{padding:"10px 16px",borderRadius:12,border:"none",
              background:K.redBg,color:K.red,fontFamily:F,fontSize:14,fontWeight:600,cursor:"pointer"}}>Delete</button>
          )}
          <div style={{flex:1}}/>
          <button onClick={onCancel} style={{padding:"10px 20px",borderRadius:12,border:"none",
            background:K.bg,fontFamily:F,fontSize:14,cursor:"pointer",color:K.sub}}>Cancel</button>
          <button onClick={handleSave} style={{padding:"10px 20px",borderRadius:12,border:"none",
            background:K.accent,color:"#fff",fontFamily:F,fontSize:14,fontWeight:600,cursor:"pointer"}}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   BLOCK ROW
   ═══════════════════════════════════════ */
function BlockRow({block, onTap, onQuickEdit, onPersonChange, isDragging, dragRef}) {
  const [swipeX, setSwipeX] = useState(0);
  const [quickEdit, setQuickEdit] = useState(false);
  const [quickText, setQuickText] = useState(block.label);
  const touchRef = useRef({x:0,y:0,swiping:false});
  const inputRef = useRef(null);

  useEffect(()=>{setQuickText(block.label);},[block.label]);
  useEffect(()=>{if(quickEdit&&inputRef.current)inputRef.current.focus();},[quickEdit]);

  const onTS = e => {
    touchRef.current = {x:e.touches[0].clientX, y:e.touches[0].clientY, swiping:false, t:Date.now()};
    setSwipeX(0);
  };
  const onTM = e => {
    const dx = e.touches[0].clientX - touchRef.current.x;
    const dy = e.touches[0].clientY - touchRef.current.y;
    if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      touchRef.current.swiping = true;
      setSwipeX(Math.max(0, Math.min(dx, 80)));
    }
  };
  const onTE = () => {
    if(swipeX > 50) {
      setQuickEdit(true);
      setSwipeX(0);
    } else if(touchRef.current.swiping) {
      setSwipeX(0);
    } else if(Date.now()-touchRef.current.t < 300 && !quickEdit) {
      onTap();
    }
    touchRef.current.swiping = false;
  };

  const saveQuick = () => {
    onQuickEdit(quickText);
    setQuickEdit(false);
  };

  const hl = block.hl;
  const hlColors = {
    green: {bg:"#E2F5EB",border:"#B8DFCA"},
    purple: {bg:K.purpleBg,border:"#D4C4E8"},
  };
  const hlStyle = hl && hlColors[hl] ? {background:hlColors[hl].bg,borderRadius:12,margin:"2px -10px",padding:"9px 10px"} : {};

  return (
    <div style={{borderTop:`1px solid ${K.line}`,position:"relative",overflow:"hidden",...(isDragging?{opacity:0.5}:{})}}>
      {/* Swipe reveal indicator */}
      {swipeX > 0 && (
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:swipeX,background:K.accentSoft,
          display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"8px 0 0 8px"}}>
          <span style={{fontSize:12,color:K.accent,fontWeight:600}}>✏️</span>
        </div>
      )}

      <div
        onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
        onClick={()=>{if(!quickEdit)onTap();}}
        style={{
          display:"flex",gap:8,alignItems:"center",padding:"11px 0",cursor:"pointer",
          transform:`translateX(${swipeX}px)`,transition:swipeX===0?"transform 0.2s":"none",
          ...hlStyle,
        }}
      >
        <span style={{fontSize:16,width:22,textAlign:"center",flexShrink:0}}>{block.icon}</span>
        <div style={{flex:1,minWidth:0,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          {quickEdit ? (
            <div style={{display:"flex",gap:6,flex:1,alignItems:"center"}} onClick={e=>e.stopPropagation()}>
              <input ref={inputRef} value={quickText} onChange={e=>setQuickText(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")saveQuick();}}
                style={{flex:1,padding:"6px 10px",borderRadius:10,border:`1px solid ${K.accent}`,
                  fontFamily:F,fontSize:14,color:K.text,outline:"none",background:K.accentSoft,minWidth:0}} />
              <button onClick={saveQuick} style={{padding:"6px 12px",borderRadius:8,border:"none",
                background:K.accent,color:"#fff",fontFamily:F,fontSize:12,fontWeight:600,cursor:"pointer",flexShrink:0}}>✓</button>
              <button onClick={()=>{setQuickEdit(false);setQuickText(block.label);}} style={{padding:"6px 10px",borderRadius:8,border:"none",
                background:K.bg,color:K.sub,fontFamily:F,fontSize:12,cursor:"pointer",flexShrink:0}}>✕</button>
            </div>
          ) : (
            <span style={{fontSize:14,fontWeight:block.free?600:500,color:block.free?K.accent:K.text}}>
              {renderBold(block.label)}
            </span>
          )}
          {block.free && !quickEdit && (
            <span style={{fontSize:9,fontWeight:700,color:K.accent,background:K.accentSoft,padding:"2px 7px",borderRadius:8}}>FREE</span>
          )}
          {block.notify && !quickEdit && (
            <span style={{fontSize:9,color:K.accent}}>🔔</span>
          )}
        </div>
        {!quickEdit && block.who !== undefined && (
          <PersonDots who={block.who} onLongPress={(e)=>{
            const rect = e.target?.getBoundingClientRect?.();
            onPersonChange(rect ? {x:rect.left,y:rect.top} : {x:100,y:100});
          }}/>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   DAY VIEW
   ═══════════════════════════════════════ */
function DayView({allDates, data, setData}) {
  const [idx, setIdx] = useState(0);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [picker, setPicker] = useState(null);
  const chipRef = useRef(null);
  const touchRef = useRef({x:0,y:0});

  const d14 = allDates.slice(0,14);
  const date = d14[idx];
  const dow = date.getDay();
  const meta = dayMeta(dow);
  const blocks = getBlocks(date, data);
  const key = dk(date);

  useEffect(()=>{
    if(chipRef.current?.children[idx])chipRef.current.children[idx].scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"});
  },[idx]);

  // Card swipe for day navigation
  const onCS = e=>{touchRef.current={x:e.touches[0].clientX,y:e.touches[0].clientY};};
  const onCE = e=>{
    const dx=e.changedTouches[0].clientX-touchRef.current.x;
    const dy=e.changedTouches[0].clientY-touchRef.current.y;
    if(Math.abs(dx)>Math.abs(dy)*2&&Math.abs(dx)>70){
      if(dx<0&&idx<d14.length-1)setIdx(i=>i+1);
      if(dx>0&&idx>0)setIdx(i=>i-1);
    }
  };

  const getTpl = ()=>data[`tpl-${dow}`]||defaultTpl(dow);

  const handleSave = (block, scope)=>{
    const up = {...data};
    if(scope==="recurring"){
      const tpl = [...getTpl()];
      if(isNew){
        tpl.push({id:block.id,icon:block.icon,label:block.label,who:block.who||"",custom:true,
          notify:block.notify,notifyTime:block.notifyTime,notifyWho:block.notifyWho});
      } else {
        const i=tpl.findIndex(r=>r.id===block.id);
        if(i>=0) tpl[i]={...tpl[i],label:block.label,icon:block.icon,
          notify:block.notify,notifyTime:block.notifyTime,notifyWho:block.notifyWho};
      }
      up[`tpl-${dow}`]=tpl;
      // Meal data
      if(block.type==="dinner"){
        up[`meal-${dow}`]={adults:block.mealAdults,kids:block.mealKids,custom:block.mealCustom};
        if(dow===1) up[`meal-2`]={adults:block.mealAdults,kids:block.mealKids,custom:block.mealCustom};
      }
    } else {
      if(isNew){
        const adds=up[`add-${key}`]||[];
        adds.push({id:block.id,icon:block.icon,label:block.label,who:"",custom:true,
          notify:block.notify,notifyTime:block.notifyTime,notifyWho:block.notifyWho});
        up[`add-${key}`]=adds;
      } else {
        const ovs=up[`ov-${key}`]||{};
        ovs[block.id]={label:block.label,icon:block.icon,
          notify:block.notify,notifyTime:block.notifyTime,notifyWho:block.notifyWho};
        up[`ov-${key}`]=ovs;
      }
      if(block.type==="dinner"){
        up[`meald-${key}`]={adults:block.mealAdults,kids:block.mealKids,custom:block.mealCustom};
      }
    }
    if(block.type==="willow-fri"&&block.wilSel){
      up[`wil-${key}`]=block.wilSel;
    }
    setData(up);SV(up);setEditing(null);setIsNew(false);
  };

  const handleDelete = ()=>{
    if(!editing)return;
    const up={...data};
    const tpl=[...getTpl()];
    const ti=tpl.findIndex(r=>r.id===editing.id);
    if(ti>=0){tpl.splice(ti,1);up[`tpl-${dow}`]=tpl;}
    const adds=up[`add-${key}`]||[];
    const ai=adds.findIndex(r=>r.id===editing.id);
    if(ai>=0){adds.splice(ai,1);up[`add-${key}`]=adds;}
    setData(up);SV(up);setEditing(null);setIsNew(false);
  };

  const handleMove = (dir)=>{
    if(!editing)return;
    const tpl=[...getTpl()];
    const i=tpl.findIndex(r=>r.id===editing.id);
    if(i<0)return;
    const ni=dir==="up"?i-1:i+1;
    if(ni<0||ni>=tpl.length)return;
    [tpl[i],tpl[ni]]=[tpl[ni],tpl[i]];
    const up={...data,[`tpl-${dow}`]:tpl};
    setData(up);SV(up);
  };

  const handleQuickEdit = (blockId, newLabel)=>{
    const tpl=[...getTpl()];
    const i=tpl.findIndex(r=>r.id===blockId);
    if(i>=0){tpl[i]={...tpl[i],label:newLabel};const up={...data,[`tpl-${dow}`]:tpl};setData(up);SV(up);}
  };

  const handlePersonChange = (blockId, pos)=>{
    const block = blocks.find(b=>b.id===blockId);
    setPicker({blockId, currentWho:block?.who||"", pos});
  };

  const commitPerson = (who)=>{
    if(!picker)return;
    const tpl=[...getTpl()];
    const i=tpl.findIndex(r=>r.id===picker.blockId);
    if(i>=0){tpl[i]={...tpl[i],who};const up={...data,[`tpl-${dow}`]:tpl};setData(up);SV(up);}
    setPicker(null);
  };

  const editIdx = editing ? getTpl().findIndex(r=>r.id===editing.id) : -1;
  const mealOpts = MEAL_OPTS[dow]||null;

  const mealLine = ()=>{
    const md = data[`meald-${key}`] || data[`meal-${dow}`] || {};
    if(dow===3) return "Willow cooks";
    if(md.custom) return md.custom;
    if(md.adults) return `${md.adults}${md.kids?` · Kids: ${md.kids}`:""}`;
    return null;
  };

  return(
    <div>
      {/* Chips */}
      <div ref={chipRef} style={{display:"flex",gap:6,overflowX:"auto",padding:"0 0 14px",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
        {d14.map((d,i)=>{
          const sel=i===idx,today=isT(d);
          return(
            <button key={i} onClick={()=>setIdx(i)} style={{
              padding:"8px 14px",borderRadius:14,border:"none",
              background:sel?K.text:K.card,boxShadow:sel?"none":K.shadow,
              color:sel?"#fff":today?K.accent:K.sub,
              fontFamily:F,fontSize:12.5,fontWeight:sel||today?600:400,
              cursor:"pointer",flexShrink:0,minWidth:50,textAlign:"center",
            }}>
              <div style={{fontSize:10,opacity:0.7,marginBottom:1}}>{sd(d)}</div>
              <div>{today&&sel?"Today":d.getDate()}</div>
            </button>
          );
        })}
      </div>

      {/* Card */}
      <div onTouchStart={onCS} onTouchEnd={onCE} style={{
        background:K.card,borderRadius:22,boxShadow:K.shadowLg,padding:"18px 16px",margin:"0 4px",
      }}>
        {/* Header */}
        <div style={{marginBottom:10}}>
          <h2 style={{fontFamily:F,fontSize:24,fontWeight:700,color:K.text,margin:"0 0 5px"}}>{isT(date)?"Today":dn(date)}</h2>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {Object.entries(meta.st).map(([k,v])=>(
              <span key={k} style={{fontSize:12,color:K.sub,display:"flex",alignItems:"center",gap:4}}>
                <Dot who={k} s={7}/>{PNAMES[k]} {v}
              </span>
            ))}
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:2}}>
            {Object.entries(meta.kids).map(([k,v])=>(
              <span key={k} style={{fontSize:11.5,color:K.hint}}>{k==="M"?"Mala":"Raf"}: {v}</span>
            ))}
          </div>
        </div>

        {/* Blocks */}
        {blocks.map(b=>(
          <BlockRow key={b.id} block={b}
            onTap={()=>{setEditing(b);setIsNew(false);}}
            onQuickEdit={(txt)=>handleQuickEdit(b.id,txt)}
            onPersonChange={(pos)=>handlePersonChange(b.id,pos)}
          />
        ))}

        {/* Add */}
        <div style={{paddingTop:8}}>
          <button onClick={()=>{setEditing({id:uid(),icon:"☀️",label:"",who:"",custom:true});setIsNew(true);}}
            style={{width:"100%",padding:10,borderRadius:12,border:`1.5px dashed ${K.hint}`,
              background:"none",fontFamily:F,fontSize:13,color:K.hint,cursor:"pointer",fontWeight:500}}>+ Add a slot</button>
        </div>
      </div>

      {/* Person picker */}
      {picker && <PersonPicker current={picker.currentWho} pos={picker.pos} onSelect={commitPerson} onClose={()=>setPicker(null)}/>}

      {/* Edit sheet */}
      {editing && (
        <EditSheet block={editing} date={date} isNew={isNew}
          mealOpts={editing.type==="dinner"?mealOpts:null}
          willowFri={editing.type==="willow-fri"}
          data={data}
          onSave={handleSave} onCancel={()=>{setEditing(null);setIsNew(false);}}
          onDelete={handleDelete} onMove={handleMove}
          canUp={editIdx>0} canDown={editIdx>=0&&editIdx<getTpl().length-1}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   CALENDAR VIEW — 3 months
   ═══════════════════════════════════════ */
function CalView({allDates, data, onJump}) {
  const [month, setMonth] = useState(0);
  const months=[];let cur=null;
  allDates.forEach((d,i)=>{
    const mK=`${d.getFullYear()}-${d.getMonth()}`;
    if(!cur||cur.key!==mK){cur={key:mK,label:d.toLocaleDateString("en-NZ",{month:"long",year:"numeric"}),days:[]};months.push(cur);}
    cur.days.push({date:d,idx:i});
  });

  return(
    <div>
      <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",scrollbarWidth:"none"}}>
        {months.map((m,i)=>(
          <button key={m.key} onClick={()=>setMonth(i)} style={{
            padding:"8px 16px",borderRadius:14,border:"none",
            background:month===i?K.text:K.card,boxShadow:month!==i?K.shadow:"none",
            color:month===i?"#fff":K.sub,fontFamily:F,fontSize:13,fontWeight:month===i?600:400,
            cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,
          }}>{m.label}</button>
        ))}
      </div>
      {months[month]?.days.map(({date:d,idx:gi})=>{
        const m=dayMeta(d.getDay()), today=isT(d), dow=d.getDay(), isWE=dow===0||dow===6;
        const canJ=gi<14;
        const blks=getBlocks(d,data);
        const exBlock=blks.find(b=>b.hl==="green");
        const wilBlock=blks.find(b=>b.hl==="purple");
        const dinnerBlock=blks.find(b=>b.type==="dinner");
        const md=data[`meald-${dk(d)}`]||data[`meal-${dow}`]||{};

        return(
          <div key={dk(d)} onClick={()=>canJ&&onJump(gi)} style={{
            background:K.card,borderRadius:16,boxShadow:K.shadow,
            padding:"12px 16px",marginBottom:8,
            borderLeft:today?`3px solid ${K.accent}`:"3px solid transparent",
            cursor:canJ?"pointer":"default",opacity:canJ?1:0.7,
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14,fontWeight:700,color:today?K.accent:isWE?K.purple:K.text}}>
                  {sd(d)} {d.getDate()}
                </span>
                {today&&<span style={{fontSize:10,fontWeight:700,color:K.accent}}>TODAY</span>}
              </div>
              <div style={{display:"flex",gap:6}}>
                {Object.entries(m.st).map(([k,v])=>(
                  <span key={k} style={{fontSize:11,color:K.sub,display:"flex",alignItems:"center",gap:3}}>
                    <Dot who={k} s={6}/>{v}
                  </span>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:5,flexWrap:"wrap"}}>
              {exBlock&&<span style={{fontSize:11,color:K.green,fontWeight:500}}>🏃 {exBlock.label}</span>}
              {wilBlock&&<span style={{fontSize:11,color:K.purple,fontWeight:500}}>🧹 {wilBlock.label}</span>}
              {(md.adults||md.custom)&&<span style={{fontSize:11,color:K.sub}}>🍽 {md.custom||md.adults}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════
   SETTINGS PANEL
   ═══════════════════════════════════════ */
function Settings({data,setData,onClose}) {
  const settings = data.settings||{summaryTime:"20:00"};
  const set = (k,v)=>{const up={...data,settings:{...settings,[k]:v}};setData(up);SV(up);};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(45,42,38,0.3)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:K.card,borderRadius:"20px 20px 0 0",padding:"16px 20px 36px",width:"100%",maxWidth:540}}>
        <div style={{width:36,height:4,borderRadius:2,background:K.line,margin:"0 auto 14px"}}/>
        <h3 style={{fontFamily:F,fontSize:18,fontWeight:700,color:K.text,margin:"0 0 16px"}}>Settings</h3>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:K.sub,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>
            Nightly summary time
          </div>
          <input type="time" value={settings.summaryTime||"20:00"} onChange={e=>set("summaryTime",e.target.value)}
            style={{padding:"10px 14px",borderRadius:12,border:`1px solid ${K.line}`,fontFamily:F,fontSize:15,color:K.text,outline:"none",width:"100%",boxSizing:"border-box",background:K.bg}} />
          <div style={{fontSize:12,color:K.hint,marginTop:4}}>Tomorrow's schedule sent via Telegram at this time.</div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:K.sub,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>
            Telegram Bot Token
          </div>
          <input value={settings.botToken||""} onChange={e=>set("botToken",e.target.value)} placeholder="Paste from BotFather"
            style={{padding:"10px 14px",borderRadius:12,border:`1px solid ${K.line}`,fontFamily:F,fontSize:13,color:K.text,outline:"none",width:"100%",boxSizing:"border-box",background:K.bg}} />
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:K.sub,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>
            Pranav Chat ID
          </div>
          <input value={settings.chatP||""} onChange={e=>set("chatP",e.target.value)} placeholder="Chat ID"
            style={{padding:"10px 14px",borderRadius:12,border:`1px solid ${K.line}`,fontFamily:F,fontSize:13,color:K.text,outline:"none",width:"100%",boxSizing:"border-box",background:K.bg}} />
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:K.sub,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>
            Cushla Chat ID
          </div>
          <input value={settings.chatC||""} onChange={e=>set("chatC",e.target.value)} placeholder="Chat ID"
            style={{padding:"10px 14px",borderRadius:12,border:`1px solid ${K.line}`,fontFamily:F,fontSize:13,color:K.text,outline:"none",width:"100%",boxSizing:"border-box",background:K.bg}} />
        </div>
        <button onClick={onClose} style={{width:"100%",padding:12,borderRadius:12,border:"none",
          background:K.accent,color:"#fff",fontFamily:F,fontSize:15,fontWeight:600,cursor:"pointer"}}>Done</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   APP
   ═══════════════════════════════════════ */
export default function App() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState(LD);
  const [showSettings, setShowSettings] = useState(false);
  const allDates = mkD(90);
  const tabs = [{label:"Today",icon:"☀️"},{label:"Calendar",icon:"📅"}];

  return(
    <div style={{fontFamily:F,background:K.bg,minHeight:"100vh",maxWidth:540,margin:"0 auto",paddingBottom:80,WebkitFontSmoothing:"antialiased"}}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`::-webkit-scrollbar{display:none}*{-webkit-tap-highlight-color:transparent;box-sizing:border-box}input::placeholder,textarea::placeholder{color:${K.hint}}`}</style>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 18px 10px"}}>
        <h1 style={{fontFamily:F,fontSize:20,fontWeight:700,color:K.text,margin:0}}>The System</h1>
        <button onClick={()=>setShowSettings(true)} style={{
          width:34,height:34,borderRadius:10,border:"none",background:K.card,
          boxShadow:K.shadow,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",
        }}>⚙️</button>
      </div>

      <div style={{padding:"0 14px"}}>
        {tab===0 && <DayView allDates={allDates} data={data} setData={setData}/>}
        {tab===1 && <CalView allDates={allDates} data={data} onJump={()=>setTab(0)}/>}
      </div>

      {/* Bottom bar */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,
        background:"rgba(255,255,255,0.92)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",
        borderTop:`1px solid ${K.line}`,display:"flex",justifyContent:"center",
        maxWidth:540,margin:"0 auto",paddingBottom:"env(safe-area-inset-bottom,8px)"}}>
        {tabs.map((t,i)=>(
          <button key={i} onClick={()=>setTab(i)} style={{
            flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,
            padding:"10px 0 8px",border:"none",background:"none",cursor:"pointer",fontFamily:F,
          }}>
            <span style={{fontSize:20}}>{t.icon}</span>
            <span style={{fontSize:10.5,fontWeight:tab===i?700:500,color:tab===i?K.accent:K.hint}}>{t.label}</span>
          </button>
        ))}
      </div>

      {showSettings && <Settings data={data} setData={setData} onClose={()=>setShowSettings(false)}/>}
    </div>
  );
}
