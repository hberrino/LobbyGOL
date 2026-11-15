import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyTournament,chooseWinner,participants,validateTournament} from '../../shared/tournament.js';
import {passwordHash,passwordMatches} from '../src/passwords.js';
function full(){const t=emptyTournament();t.title='Copa';t.teams=t.teams.map((_,i)=>`Equipo ${i}`);return t;}
test('allows saving an unfinished bracket',()=>{const t=emptyTournament();t.title='Borrador';assert.deepEqual(validateTournament(t),t);});
test('winners advance through all rounds',()=>{const t=full();for(const [i,w] of [[0,0],[1,2],[2,4],[3,6],[4,0],[5,4],[6,0]])t.matches=chooseWinner(t.matches,i,w);assert.deepEqual(participants(t.matches,6),[0,4]);assert.equal(validateTournament(t).matches[6].winner,0);});
test('changing a quarter finalist resets only dependent matches',()=>{const t=full();for(const [i,w] of [[0,0],[1,2],[2,4],[3,6],[4,0],[5,4],[6,0]])t.matches=chooseWinner(t.matches,i,w);t.matches[4].scores=['1','0'];t.matches[6].scores=['2','1'];const result=chooseWinner(t.matches,0,1);assert.equal(result[4].winner,null);assert.deepEqual(result[4].scores,['','']);assert.equal(result[6].winner,null);assert.equal(result[5].winner,4);assert.equal(result[1].winner,2);});
test('rejects foreign winner and score without opponents',()=>{const t=full();t.matches[0].winner=7;assert.throws(()=>validateTournament(t));t.matches[0].winner=null;t.matches[4].scores=['1','0'];assert.throws(()=>validateTournament(t));});
test('rejects missing teams and malformed scores',()=>{const t=full();t.teams[0]='';t.matches[0].winner=1;assert.throws(()=>validateTournament(t));t.matches[0].winner=null;t.matches[0].scores=['-1','0'];assert.throws(()=>validateTournament(t));});
test('same winner keeps downstream results; undo resets them',()=>{const t=full();t.matches=chooseWinner(t.matches,0,0);t.matches=chooseWinner(t.matches,1,2);t.matches=chooseWinner(t.matches,4,0);assert.equal(chooseWinner(t.matches,0,0)[4].winner,0);assert.equal(chooseWinner(t.matches,0,null)[4].winner,null);});
test('password hash uses salt and checks correct password',async()=>{const first=await passwordHash('a-long-test-password'),second=await passwordHash('a-long-test-password');assert.notEqual(first,second);assert.equal(await passwordMatches('a-long-test-password',first),true);assert.equal(await passwordMatches('wrong-password',first),false);});
