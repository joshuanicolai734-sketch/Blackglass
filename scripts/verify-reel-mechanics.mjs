// Exercise the production joint solver rather than a copied approximation.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const source = fs.readFileSync('public/reel.js','utf8');
const component = fs.readFileSync('components/site/reel.tsx','utf8');
const model = Function(`return (${component.match(/const MODEL = (\{[\s\S]*?\n\});/)[1]})`)();
const pure = source.slice(source.indexOf('  const clamp ='),source.indexOf('  /* ---- Layers ---- */'));
const {pose,depth}=Function('M','DUR',`${pure};return {pose,depth}`)(model,12);
const transform = value => {
  const m=value.match(/\* (-?[\d.]+)\), calc\(var\(--u\) \* (-?[\d.]+)\)\) rotate\((-?[\d.]+)deg\)/);
  assert.ok(m,`Unexpected transform: ${value}`);
  return m.slice(1).map(Number);
};
let maxGripError=0;
for(let i=0;i<=1000;i++) {
  const p=pose(i/1000);
  const shin=transform(p.shin);
  assert.deepEqual(shin.slice(0,2),model.ankle,'Ankle moves during the squat');
  const thigh=transform(p.thigh), torso=transform(p.torso), upper=transform(p.upper);
  const fore=transform(p.fore), a=fore[2]*Math.PI/180;
  for (const [from,to,length] of [[shin,thigh,model.shin],[thigh,torso,model.thigh],[upper,fore,model.upper]]) {
    const angle=from[2]*Math.PI/180;
    assert.ok(Math.hypot(from[0]+length*Math.cos(angle)-to[0],from[1]+length*Math.sin(angle)-to[1])<.03,'Limb length or joint connection changes');
  }
  const grip=[fore[0]+model.fore*Math.cos(a),fore[1]+model.fore*Math.sin(a)];
  const error=Math.hypot(grip[0]-model.mid,grip[1]-p.barY);
  assert.ok(error<.02,`Grip separates from vertical bar path: ${error}`);
  maxGripError=Math.max(error,maxGripError);
  Object.values(p).forEach(v=>assert.ok(!String(v).match(/NaN|Infinity/)));
}
for(let t=.6;t<3.6;t+=.01) assert.ok(depth(t+.01)>=depth(t)-1e-10,'Descent reverses');
for(let t=3.6;t<=4.6;t+=.01) assert.equal(depth(t),1,'Pause fails to hold');
for(let t=4.6;t<5.6;t+=.01) assert.ok(depth(t+.01)<=depth(t)+1e-10,'Drive reverses');
assert.ok(depth(5.3)>0,'Drive ends before the specified full second');
assert.equal(depth(5.6),0);
assert.equal(depth(6.3),0);
const result={status:'passed',poses:1001,maxGripErrorFigureUnits:maxGripError,checks:['fixed ankle','constant limb lengths in production solver','grip tracks vertical midfoot bar path','finite joint transforms','monotonic lower and drive','one-second bottom hold','one-second drive','still lockout']};
fs.mkdirSync('outputs',{recursive:true});
fs.writeFileSync('outputs/reel-mechanics.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
