export function emptyTournament(){return {title:'',teams:Array(8).fill(''),matches:Array.from({length:7},()=>({scores:['',''],winner:null}))};}
export function participants(matches,index){if(index<4)return [index*2,index*2+1];const first=index===6?4:(index-4)*2;return [matches[first].winner,matches[first+1].winner];}
export function chooseWinner(matches,index,winner){const copy=matches.map(m=>({...m,scores:[...m.scores]}));if(copy[index].winner===winner)return copy;copy[index].winner=winner;let parent=index<4?4+Math.floor(index/2):index<6?6:null;while(parent!==null){copy[parent]={scores:['',''],winner:null};parent=parent<6?6:null;}return copy;}
export function validateTournament(value){
 if(!value||typeof value.title!=='string'||!value.title.trim()||value.title.trim().length>100)throw Error('Escribi un nombre de torneo de hasta 100 caracteres.');
 if(!Array.isArray(value.teams)||value.teams.length!==8||value.teams.some(t=>typeof t!=='string'||t.length>60))throw Error('El torneo debe tener ocho equipos, de hasta 60 caracteres.');
 if(!Array.isArray(value.matches)||value.matches.length!==7)throw Error('Fixture invalido.');
 const teams=value.teams.map(t=>t.trim()),matches=[];
 for(let i=0;i<7;i++){
  const m=value.matches[i];
  if(!m||!Array.isArray(m.scores)||m.scores.length!==2||m.scores.some(s=>typeof s!=='string'||!/^([0-9]{1,2})?$/.test(s)))throw Error('Los resultados deben estar entre 0 y 99.');
  const pair=participants(matches,i);
  if(m.winner!==null&&(!Number.isInteger(m.winner)||!pair.includes(m.winner)||pair.some(id=>id===null||!teams[id])))throw Error('Completa ambos equipos antes de elegir al ganador.');
  if(pair.some(id=>id===null||!teams[id])&&m.scores.some(s=>s!==''))throw Error('Completa ambos equipos antes de anotar un resultado.');
  matches.push({scores:[...m.scores],winner:m.winner});
 }
 return {title:value.title.trim(),teams,matches};
}
