const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const PNAMES = { P: "Pranav", C: "Cushla", N: "Nanna", W: "Willow" };
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const TEMPLATES = {
  1:[{icon:"🏃‍♀️",label:"Run (optional)",who:"C"},{icon:"☀️",label:"Drop off Raf at 8",who:"C"},{icon:"🚗",label:"Pick up Raf with Mala at 3:15",who:"N"},{icon:"🏠",label:"On kids 4:30–6",who:"P"},{icon:"✨",label:"Lunches + bags",who:"C"},{icon:"🍽",label:"Dinner",type:"dinner"}],
  2:[{icon:"💪",label:"Gym (optional)",who:"C"},{icon:"☀️",label:"Free morning",who:"P"},{icon:"☀️",label:"Drop off both at 8",who:"C"},{icon:"🚗",label:"Pick up both at 3:15",who:"N"},{icon:"🏠",label:"Monday leftovers · Home by 6",who:"P"},{icon:"✨",label:"Lunches + bags",who:"C"},{icon:"🍽",label:"Dinner",type:"dinner"}],
  3:[{icon:"🧘",label:"Yoga (optional)",who:"P"},{icon:"🧹",label:"Willow cooks",who:"W"},{icon:"☀️",label:"Drop off both at 8",who:"P"},{icon:"🚗",label:"Pick up both at 3:15",who:"N"},{icon:"🏠",label:"Willow's meal · Home ~5:30",who:"P"},{icon:"✨",label:"Lunches + bags",who:"P"},{icon:"🍽",label:"Dinner",type:"dinner"}],
  4:[{icon:"🏃‍♀️",label:"Run home (optional)",who:"C"},{icon:"🧹",label:"Willow cleans",who:"W"},{icon:"☀️",label:"Drop off both at 8",who:"C"},{icon:"🚗",label:"Pick up both at 4:30",who:"P"},{icon:"🏠",label:"Home ~6:15",who:"C"},{icon:"✨",label:"Lunches + bags",who:"C"},{icon:"🍽",label:"Dinner",type:"dinner"}],
  5:[{icon:"🏃‍♀️",label:"Run to work (optional)",who:"C"},{icon:"🧹",label:"Willow — big job",who:"W"},{icon:"☀️",label:"Drop off both at 8",who:"P"},{icon:"🚗",label:"Pick up both at 5",who:"C"},{icon:"🍽",label:"Dinner",type:"dinner"}],
  6:[{icon:"🧘",label:"Yoga (optional)",who:"P"},{icon:"☀️",label:"One kid each till 10",who:"PC"},{icon:"🌿",label:"Free 10–12:30",who:"P"},{icon:"🌿",label:"Free 1–3:30",who:"C"},{icon:"👨‍👩‍👧‍👦",label:"Family from 3:30",who:"PC"},{icon:"🍽",label:"Dinner",type:"dinner"}],
  0:[{icon:"🏃‍♀️",label:"Run 7:30–9",who:"C"},{icon:"⚽",label:"Raf football 9:30",who:"P"},{icon:"🌤",label:"Flexi 10:30–12",who:"PC"},{icon:"🎧",label:"Meal prep + jobs 2–4:30",who:"P"},{icon:"👨‍👩‍👧‍👦",label:"Family from 4:30",who:"PC"},{icon:"✨",label:"Lunches + bags",who:"C"},{icon:"🍽",label:"Dinner",type:"dinner"}]
};
const STATUS = {1:{P:"WFH",C:"Office"},2:{P:"Office",C:"WFH"},3:{P:"Office",C:"WFH"},4:{P:"WFH",C:"Office"},5:{P:"WFH",C:"Office"},6:{P:"Home",C:"Home"},0:{P:"Home",C:"Home"}};

function dateKey(d){return d.toISOString().split("T")[0];}
function formatWho(w){return w?w.split("").map(c=>PNAMES[c]||c).join(" + "):""}
function getBlocks(date,data){
  const dow=date.getDay(),tpl=data[`tpl-${dow}`]||TEMPLATES[dow]||[];
  const key=dateKey(date),ovs=data[`ov-${key}`]||{},adds=data[`add-${key}`]||[];
  return [...tpl.map(r=>ovs[r.id]?{...r,...ovs[r.id]}:{...r}),...adds];
}
function buildSummary(date,data){
  const dow=date.getDay(),blocks=getBlocks(date,data),st=STATUS[dow]||{};
  let msg=`📋 *Tomorrow — ${DAYS[dow]} ${date.getDate()}/${date.getMonth()+1}*\n\n`;
  msg+=`${PNAMES.P}: ${st.P||"Home"} · ${PNAMES.C}: ${st.C||"Home"}\n\n`;
  for(const b of blocks){
    if(b.type==="dinner"){
      const md=data[`meald-${dateKey(date)}`]||data[`meal-${dow}`]||{};
      msg+=`${b.icon} Dinner: ${md.custom||md.adults||(dow===3?"Willow cooks":"TBD")}\n`;
    } else {
      msg+=`${b.icon} ${b.label}${b.who?` → ${formatWho(b.who)}`:""}\n`;
    }
  }
  return msg;
}
async function redisGet(key){
  const r=await fetch(`${REDIS_URL}/get/${key}`,{headers:{Authorization:`Bearer ${REDIS_TOKEN}`}});
  if(!r.ok)return null;const j=await r.json();return j.result?JSON.parse(j.result):null;
}
async function sendTG(token,chatId,text){
  return fetch(`https://api.telegram.org/bot${token}/sendMessage`,{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({chat_id:chatId,text,parse_mode:"Markdown"})
  });
}
export default async function handler(req,res){
  if(!REDIS_URL||!REDIS_TOKEN)return res.status(500).json({error:"Redis not configured"});
  try{
    const data=(await redisGet("the-system-data"))||{};
    const s=data.settings||{};
    const targetH=parseInt((s.summaryTime||"20:00").split(":")[0]);
    const now=new Date();
    const nzH=(now.getUTCHours()+12)%24;
    if(Math.abs(nzH-targetH)>1)return res.status(200).json({skipped:true});
    if(!s.botToken)return res.status(200).json({skipped:true,reason:"No bot token"});
    const tom=new Date(now.getTime()+12*3600000);tom.setDate(tom.getDate()+1);tom.setHours(0,0,0,0);
    const msg=buildSummary(tom,data);
    const results=[];
    if(s.chatP){await sendTG(s.botToken,s.chatP,msg);results.push("Pranav");}
    if(s.chatC){await sendTG(s.botToken,s.chatC,msg);results.push("Cushla");}
    return res.status(200).json({sent:true,to:results});
  }catch(e){return res.status(500).json({error:e.message});}
}
