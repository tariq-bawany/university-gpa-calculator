import React, { useEffect, useMemo, useState } from 'react';

const fallback = [['A',4],['A-',3.7],['B+',3.3],['B',3],['B-',2.7],['C+',2.3],['C',2],['D',1],['F',0]].map(([grade,gpa]) => ({grade,gpa}));

export default function CalculatorWidget({ scale, title = 'Your GPA', storageKey = 'universal' }) {
  const key = `gpabound:calculator:${storageKey}:v1`;
  const defaultRows = () => Array.from({length: 4}, () => ({name:'', credits:3, grade:scale[0].grade}));
  const [custom, setCustom] = useState(false);
  const [mode, setMode] = useState('sgpa');
  const [rows, setRows] = useState(defaultRows);
  const [prevGpa, setPrevGpa] = useState(3);
  const [prevCredits, setPrevCredits] = useState(30);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const active = custom ? fallback : scale;
  const blank = () => ({name:'', credits:3, grade:active[0].grade});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || 'null');
      if (stored) {
        if (Array.isArray(stored.rows) && stored.rows.length) setRows(stored.rows);
        if (stored.mode === 'sgpa' || stored.mode === 'cgpa') setMode(stored.mode);
        if (typeof stored.custom === 'boolean') setCustom(stored.custom);
        if (stored.prevGpa !== undefined) setPrevGpa(stored.prevGpa);
        if (stored.prevCredits !== undefined) setPrevCredits(stored.prevCredits);
        setSaved(true);
      }
    } catch (error) {
      console.warn('Could not restore saved calculator data.', error);
    }
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify({rows, mode, custom, prevGpa, prevCredits, updatedAt:new Date().toISOString()}));
      setSaved(true);
    } catch (error) {
      console.warn('Could not save calculator data.', error);
    }
  }, [key, ready, rows, mode, custom, prevGpa, prevCredits]);

  const update = (i,k,v) => setRows(rows.map((r,x) => x === i ? {...r,[k]:v} : r));
  const clearSaved = () => {
    localStorage.removeItem(key);
    setCustom(false); setMode('sgpa'); setRows(defaultRows()); setPrevGpa(3); setPrevCredits(30); setSaved(false);
  };
  const calc = useMemo(() => {
    let credits=0, points=0;
    rows.forEach(r => { const c=Number(r.credits)||0; const g=active.find(x=>x.grade===r.grade)?.gpa||0; credits+=c; points+=c*g; });
    const sgpa=credits?points/credits:0;
    const cgpa=(credits+Number(prevCredits))?((Number(prevGpa)*Number(prevCredits))+points)/(Number(prevCredits)+credits):0;
    return {credits,sgpa,cgpa};
  }, [rows,active,prevGpa,prevCredits]);

  return <div className="calc-card">
    <div className="calc-head"><div><span className="eyebrow">GPA WORKSPACE</span><h2>{title}</h2><p>Enter each course, credit hours, and grade. Results update instantly.</p></div><div className="mode"><button className={mode==='sgpa'?'active':''} onClick={()=>setMode('sgpa')}>SGPA</button><button className={mode==='cgpa'?'active':''} onClick={()=>setMode('cgpa')}>CGPA</button></div></div>
    <div className="calculator-tools"><label className="switch"><input type="checkbox" checked={custom} onChange={e=>{setCustom(e.target.checked);setRows(rows.map(r=>({...r,grade:(e.target.checked?fallback:scale)[0].grade})))}}/> Use common 4.0 scale</label><div className="save-state"><span>{saved ? '✓ Saved on this device' : 'Saved automatically'}</span><button type="button" onClick={clearSaved}>Clear saved data</button></div></div>
    {mode==='cgpa'&&<div className="previous"><label>Previous CGPA<input type="number" min="0" max="4" step=".01" value={prevGpa} onChange={e=>setPrevGpa(e.target.value)}/></label><label>Previous credits<input type="number" min="0" value={prevCredits} onChange={e=>setPrevCredits(e.target.value)}/></label></div>}
    <div className="course-labels"><span>Course (optional)</span><span>Credits</span><span>Grade</span><span></span></div>
    <div className="courses">{rows.map((r,i)=><div className="course" key={i}><input aria-label="Course name" placeholder={`Course ${i+1}`} value={r.name} onChange={e=>update(i,'name',e.target.value)}/><input aria-label="Credit hours" type="number" min="0.5" max="12" step=".5" value={r.credits} onChange={e=>update(i,'credits',e.target.value)}/><select aria-label="Grade" value={r.grade} onChange={e=>update(i,'grade',e.target.value)}>{active.map(x=><option key={x.grade} value={x.grade}>{x.grade} · {x.gpa.toFixed(2)}</option>)}</select><button className="remove" aria-label="Remove course" onClick={()=>rows.length>1&&setRows(rows.filter((_,x)=>x!==i))}>×</button></div>)}</div>
    <button className="add" onClick={()=>setRows([...rows,blank()])}>＋ Add another course</button>
    <div className="result"><div><span>{mode==='cgpa'?'CUMULATIVE GPA':'SEMESTER GPA'}</span><strong>{(mode==='cgpa'?calc.cgpa:calc.sgpa).toFixed(2)}</strong></div><div className="result-meta"><b>{calc.credits}</b><span>Current credits</span></div><div className="result-meta"><b>{rows.length}</b><span>Courses</span></div></div>
    <p className="formula">Weighted by credit hours · {(calc.sgpa*calc.credits).toFixed(2)} quality points ÷ {calc.credits||0} credits</p>
  </div>;
}
