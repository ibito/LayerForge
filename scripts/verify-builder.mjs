#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { readPsd, initializeCanvas } from 'ag-psd';
import { compositeLayers } from './composite.mjs';
const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'imagepsd-verify-'));
const builder = fileURLToPath(new URL('./build-psd.mjs', import.meta.url));
initializeCanvas(()=>{throw Error('Unexpected canvas');}, (width,height)=>({width,height,data:new Uint8ClampedArray(width*height*4)}));
try {
  await sharp({create:{width:64,height:64,channels:4,background:'#ff9900'}}).png().toFile(path.join(dir,'asset.png'));
  const route={type:'shape',name:'Route Main',shape:'path',commands:[['M',20,120],['L',140,120],['C',180,120,230,120,290,120]],stroke:'#0088ff',strokeWidth:12};
  const manifest={width:320,height:240,layers:[
    {type:'group',name:'TEXT',children:[{type:'text',name:'Title',text:'EDITABLE',left:160,top:10,width:150,height:32,fontSize:20,fontFamily:'DejaVu Sans',fontPostScriptName:'DejaVuSans',align:'center',color:'#000000'}]},
    {type:'group',name:'FOREGROUND',children:[{type:'shape',name:'Truck stand-in',shape:'rect',left:130,top:100,width:60,height:40,fill:'#ff0000'}]},
    {type:'group',name:'PINS',children:[{type:'shape',name:'Circle',shape:'ellipse',left:30,top:30,width:40,height:40,fill:'#00ff00'},{type:'shape',name:'Arrow',shape:'path',commands:[['M',260,40],['L',280,60],['L',260,80],['Z']],fill:'#000000'}]},
    {type:'group',name:'ROUTE',children:[route]},
    {type:'image',name:'Raster detail',path:'asset.png',left:20,top:180,width:32,height:32},
    {type:'shape',name:'Background',shape:'rect',left:0,top:0,width:320,height:240,fill:'#ffffff'},
    {type:'group',name:'REFERENCE',hidden:true,children:[{type:'image',name:'Source',path:'asset.png'}]},
  ]};
  const run=async (m, tag)=>{const f=path.join(dir,tag+'.json'),o=path.join(dir,tag+'.psd');await fs.writeFile(f,JSON.stringify(m));execFileSync(process.execPath,[builder,f,o],{stdio:'pipe'});return readPsd(await fs.readFile(o),{useImageData:true});};
  const p=await run(manifest,'native');
  assert.deepEqual(p.children.map(l=>l.name),['REFERENCE','Background','Raster detail','ROUTE','PINS','FOREGROUND','TEXT']);
  assert.equal(p.children[0].hidden,true);
  const find=n=>p.children.find(l=>l.name===n);
  const r=find('ROUTE').children[0],t=find('TEXT').children[0];
  assert.equal(r.vectorStroke.strokeEnabled,true);assert.equal(r.vectorStroke.fillEnabled,false);
  assert.equal(r.vectorMask.paths[0].open,true);assert.equal(r.vectorMask.paths[0].knots.length,3);
  assert.equal(find('PINS').children.find(l=>l.name==='Circle').vectorMask.paths[0].knots.length,4);
  assert.equal(t.text.text,'EDITABLE');assert.deepEqual(t.text.transform,[1,0,0,1,235,30]);
  const sample=(buf,x,y)=>[...buf.subarray((y*320+x)*4,(y*320+x)*4+4)];
  let pixels=await compositeLayers(p.children,320,240);
  assert.deepEqual(sample(pixels,160,120),[255,0,0,255]);
  assert.deepEqual(sample(pixels,50,50),[0,255,0,255]);
  assert.deepEqual(sample(pixels,25,185),[255,153,0,255]);
  find('FOREGROUND').hidden=true;pixels=await compositeLayers(p.children,320,240);
  assert.deepEqual(sample(pixels,160,120),[0,136,255,255]);
  for(let x=25;x<=285;x++) assert.equal(sample(pixels,x,120)[2],255,'Route is continuous under occluder');
  find('ROUTE').hidden=true;pixels=await compositeLayers(p.children,320,240);
  assert.deepEqual(sample(pixels,160,120),[255,255,255,255]);
  const large={width:128,height:128,layers:[{type:'image',name:'Too small',path:'asset.png',width:128,height:128}]};
  await assert.rejects(run(large,'reject-upscale'),e=>String(e.stderr).includes('too small'));
  large.layers[0].allowUpscale=true;await run(large,'authorized-upscale');
  const distorted={width:128,height:128,layers:[{type:'image',name:'Distorted',path:'asset.png',width:32,height:24}]};
  await assert.rejects(run(distorted,'reject-distortion'),e=>String(e.stderr).includes('distort'));
  distorted.layers[0].allowDistort=true;await run(distorted,'authorized-distortion');
  console.log('PASS: native rect/ellipse/line/cubic/closed path metadata, recursive layer order, text alignment, raster compatibility, complete hidden route, clean background, quality guards and authorized exceptions.');
} finally { await fs.rm(dir,{recursive:true,force:true}); }
