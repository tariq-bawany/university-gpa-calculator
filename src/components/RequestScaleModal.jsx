import React, { useEffect, useState } from 'react';

export default function RequestScaleModal() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ university: '', campus: '', email: '' });

  useEffect(() => {
    const close = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', close);
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { window.removeEventListener('keydown', close); document.body.style.overflow = ''; };
  }, [open]);

  function submit(event) {
    event.preventDefault();
    if (!form.university.trim()) return;
    const requests = JSON.parse(localStorage.getItem('scaleRequests') || '[]');
    localStorage.setItem('scaleRequests', JSON.stringify([...requests, { ...form, createdAt: new Date().toISOString() }]));
    setSent(true);
  }

  return <>
    <button type="button" className="request" onClick={() => { setOpen(true); setSent(false); }}>Request a scale</button>
    {open && <div className="modal-back" role="presentation" onMouseDown={() => setOpen(false)}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="request-title" onMouseDown={(e) => e.stopPropagation()}>
        <button type="button" className="x" onClick={() => setOpen(false)} aria-label="Close dialog">×</button>
        {sent ? <div className="success-state"><span>✓</span><h2 id="request-title">Request saved</h2><p>Thank you. Your request has been saved on this device for this prototype.</p><button className="primary" onClick={() => setOpen(false)}>Done</button></div> : <>
          <span className="eyebrow">REQUEST A CALCULATOR</span>
          <h2 id="request-title">Which scale should we add?</h2>
          <p>Share the university and campus. An official grading-policy link is especially helpful.</p>
          <form onSubmit={submit}>
            <label>University name <input required autoFocus value={form.university} onChange={(e) => setForm({...form, university:e.target.value})} placeholder="e.g. University of Karachi" /></label>
            <label>Campus or city <input value={form.campus} onChange={(e) => setForm({...form, campus:e.target.value})} placeholder="e.g. Main Campus, Karachi" /></label>
            <label>Email <span>(optional)</span><input type="email" value={form.email} onChange={(e) => setForm({...form, email:e.target.value})} placeholder="you@example.com" /></label>
            <button className="primary" type="submit">Submit request</button>
          </form>
          <small className="form-note">Prototype note: requests are currently stored locally until a form backend is connected.</small>
        </>}
      </section>
    </div>}
  </>;
}
