import React, { useMemo, useState } from 'react';

export default function UniversitySearch({ universities }) {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return universities.filter((u) =>
      `${u.name} ${u.campus} ${u.cityName} ${u.countryName}`.toLowerCase().includes(term)
    ).slice(0, 6);
  }, [query, universities]);

  return <div className="search-shell">
    <span className="search-icon" aria-hidden="true">⌕</span>
    <input
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && matches[0]) window.location.href = `/gpa-calculator/${matches[0].slug}`;
      }}
      placeholder="Search by university, campus, or city"
      aria-label="Search universities"
      aria-expanded={matches.length > 0}
    />
    {query && <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
    {query && <div className="search-results">
      {matches.length ? matches.map((u) =>
        <a key={u.slug} href={`/gpa-calculator/${u.slug}`}>
          <span><strong>{u.name}</strong><small>{u.campus}</small></span>
          <em>{u.cityName}</em>
        </a>
      ) : <p>No matching university. You can request a scale from the navigation.</p>}
    </div>}
  </div>;
}
