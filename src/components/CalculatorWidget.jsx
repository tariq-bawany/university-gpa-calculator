import React, { useEffect, useMemo, useState } from 'react';

const fallback = [['A',4],['A-',3.7],['B+',3.3],['B',3],['B-',2.7],['C+',2.3],['C',2],['D',1],['F',0]].map(([grade,gpa]) => ({grade,gpa}));
const clamp = (value, min, max) => value === '' ? '' : Math.min(max, Math.max(min, Number(value)));

export default function CalculatorWidget({ scale, title = 'Your GPA', storageKey = 'universal' }) {
  const key = `gpabound:calculator:${storageKey}:v2`;
  const defaultRows = () => Array.from({length: 4}, () => ({name:'', credits:3, grade:scale[0].grade}));
  const [custom, setCustom] = useState(false);
  const [mode, setMode] = useState('sgpa');
  const [rows, setRows] = useState(defaultRows);
  const [semesters, setSemesters] = useState([{name:'Semester 1', gpa:3, credits:15}]);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const active = custom ? fallback : scale;
  const maxGpa = Math.max(...active.map(item => Number(item.gpa)));
  const blank = () => ({name:'', credits:3, grade:active[0].grade});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || 'null');
      const legacy = JSON.parse(localStorage.getItem(`gpabound:calculator:${storageKey}:v1`) || 'null');
      const data = stored || legacy;
      if (data) {
        if (Array.isArray(data.rows) && data.rows.length) setRows(data.rows);
        if (data.mode === 'sgpa' || data.mode === 'cgpa') setMode(data.mode);
        if (typeof data.custom === 'boolean') setCustom(data.custom);
        if (Array.isArray(data.semesters) && data.semesters.length) setSemesters(data.semesters);
        else if (data.prevGpa !== undefined) setSemesters([{name:'Previous semesters', gpa:data.prevGpa, credits:data.prevCredits || 0}]);
        setSaved(true);
      }
    } catch (error) { console.warn('Could not restore saved calculator data.', error); }
    setReady(true);
  }, [key, storageKey]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify({rows, mode, custom, semesters, updatedAt:new Date().toISOString()}));
      setSaved(true);
    } catch (error) { console.warn('Could not save calculator data.', error); }
  }, [key, ready, rows, mode, custom, semesters]);

  const update = (i,k,v) => setRows(rows.map((r,x) => x === i ? {...r,[k]:v} : r));
  const updateSemester = (i,k,v) => setSemesters(semesters.map((s,x) => x === i ? {...s,[k]:v} : s));
  const clearSaved = () => {
    localStorage.removeItem(key); localStorage.removeItem(`gpabound:calculator:${storageKey}:v1`);
    setCustom(false); setMode('sgpa'); setRows(defaultRows()); setSemesters([{name:'Semester 1',gpa:3,credits:15}]); setSaved(false);
  };

  const calc = useMemo(() => {
    let currentCredits=0, currentPoints=0;
    rows.forEach(r => { const c=Number(r.credits)||0; const g=active.find(x=>x.grade===r.grade)?.gpa||0; currentCredits+=c; currentPoints+=c*g; });
    const sgpa=currentCredits?currentPoints/currentCredits:0;
    const previous=semesters.reduce((total,s) => ({credits:total.credits+(Number(s.credits)||0), points:total.points+((Number(s.gpa)||0)*(Number(s.credits)||0))}), {credits:0,points:0});
    const totalCredits=previous.credits+currentCredits;
    const cgpa=totalCredits?(previous.points+currentPoints)/totalCredits:0;
    return {currentCredits,currentPoints,sgpa,cgpa,previousCredits:previous.credits,totalCredits};
  }, [rows, active, semesters]);

  return <div className="calc-card">
    <div className="calc-head"><div><span className="eyebrow">GPA WORKSPACE</span><h2>{title}</h2><p>Enter each course, credit hours, and grade. Results update instantly.</p></div><div className="mode"><button className={mode==='sgpa'?'active':''} onClick={()=>setMode('sgpa')}>SGPA</button><button className={mode==='cgpa'?'active':''} onClick={()=>setMode('cgpa')}>CGPA</button></div></div>
    <div className="calculator-tools"><label className="switch"><input type="checkbox" checked={custom} onChange={e=>{setCustom(e.target.checked);setRows(rows.map(r=>({...r,grade:(e.target.checked?fallback:scale)[0].grade})))}}/> Use common 4.0 scale</label><div className="save-state"><span>{saved ? '✓ Saved on this device' : 'Saved automatically'}</span><button type="button" onClick={clearSaved}>Clear saved data</button></div></div>

    {mode==='cgpa' && <section className="semester-history"><div className="semester-title"><div><b>Previous semesters</b><span>Add each completed semester separately for a transparent CGPA calculation.</span></div><button type="button" onClick={()=>setSemesters([...semesters,{name:`Semester ${semesters.length+1}`,gpa:'',credits:''}])}>＋ Add semester</button></div>
      <div className="semester-labels"><span>Semester</span><span>GPA (max {maxGpa.toFixed(2)})</span><span>Credits</span><span></span></div>
      {semesters.map((semester,i)=><div className="semester-row" key={i}><input aria-label={`Semester ${i+1} name`} value={semester.name} onChange={e=>updateSemester(i,'name',e.target.value.slice(0,40))}/><input aria-label={`${semester.name} GPA`} type="number" min="0" max={maxGpa} step=".01" value={semester.gpa} onChange={e=>updateSemester(i,'gpa',clamp(e.target.value,0,maxGpa))}/><input aria-label={`${semester.name} credits`} type="number" min="0" max="60" step=".5" value={semester.credits} onChange={e=>updateSemester(i,'credits',clamp(e.target.value,0,60))}/><button className="remove" aria-label={`Remove ${semester.name}`} onClick={()=>semesters.length>1&&setSemesters(semesters.filter((_,x)=>x!==i))}>×</button></div>)}
    </section>}

    <div className="current-semester-title"><b>{mode==='cgpa'?'Current semester courses':'Courses'}</b>{mode==='cgpa'&&<span>This section calculates the semester you are currently completing.</span>}</div>
    <div className="course-labels"><span>Course (optional)</span><span>Credits</span><span>Grade</span><span></span></div>
    <div className="courses">{rows.map((r,i)=><div className="course" key={i}><input maxLength="60" aria-label="Course name" placeholder={`Course ${i+1}`} value={r.name} onChange={e=>update(i,'name',e.target.value)}/><input aria-label="Credit hours" type="number" min="0.5" max="12" step=".5" value={r.credits} onChange={e=>update(i,'credits',clamp(e.target.value,.5,12))}/><select aria-label="Grade" value={r.grade} onChange={e=>update(i,'grade',e.target.value)}>{active.map(x=><option key={x.grade} value={x.grade}>{x.grade} · {x.gpa.toFixed(2)}</option>)}</select><button className="remove" aria-label="Remove course" onClick={()=>rows.length>1&&setRows(rows.filter((_,x)=>x!==i))}>×</button></div>)}</div>
    <button className="add" onClick={()=>setRows([...rows,blank()])}>＋ Add another course</button>
    <div className="result"><div><span>{mode==='cgpa'?'CUMULATIVE GPA':'SEMESTER GPA'}</span><strong>{(mode==='cgpa'?calc.cgpa:calc.sgpa).toFixed(2)}</strong></div><div className="result-meta"><b>{mode==='cgpa'?calc.totalCredits:calc.currentCredits}</b><span>{mode==='cgpa'?'Total credits':'Current credits'}</span></div><div className="result-meta"><b>{calc.sgpa.toFixed(2)}</b><span>Current SGPA</span></div></div>
    <p className="formula">{mode==='cgpa' ? `${calc.previousCredits} previous + ${calc.currentCredits} current credits · weighted cumulative result` : `Weighted by credit hours · ${calc.currentPoints.toFixed(2)} quality points ÷ ${calc.currentCredits||0} credits`}</p>
  </div>;
}
