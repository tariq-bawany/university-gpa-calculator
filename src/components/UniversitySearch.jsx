import React, { useMemo, useState } from 'react';

export default function UniversitySearch({ universities }) {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();

  const cities = useMemo(() => {
    const unique = new Map();
    universities.forEach((u) => {
      if (!unique.has(u.city)) unique.set(u.city, {
        slug: u.city,
        name: u.cityName,
        country: u.countryName,
        count: universities.filter((item) => item.city === u.city).length
      });
    });
    return [...unique.values()];
  }, [universities]);

  const cityMatches = useMemo(() => term
    ? cities.filter((city) => `${city.name} ${city.country}`.toLowerCase().includes(term)).slice(0, 3)
    : [], [term, cities]);

  const universityMatches = useMemo(() => term
    ? universities.filter((u) =>
        `${u.name} ${u.campus} ${u.cityName} ${u.countryName}`.toLowerCase().includes(term)
      ).slice(0, 6)
    : [], [term, universities]);

  function handleKeyDown(event) {
    if (event.key !== 'Enter') return;
    const exactCity = cities.find((city) => city.name.toLowerCase() === term);
    const exactUniversity = universities.find((u) =>
      u.name.toLowerCase() === term || `${u.name} ${u.cityName}`.toLowerCase() === term
    );
    if (exactCity) window.location.href = `/city/${exactCity.slug}`;
    else if (exactUniversity) window.location.href = `/gpa-calculator/${exactUniversity.slug}`;
    // Deliberately do nothing for an ambiguous query. The user must choose a result.
  }

  const hasResults = cityMatches.length > 0 || universityMatches.length > 0;

  return <div className="search-shell">
    <span className="search-icon" aria-hidden="true">⌕</span>
    <input
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Search by university, campus, or city"
      aria-label="Search universities and cities"
      aria-expanded={Boolean(term)}
      aria-controls="university-search-results"
    />
    {query && <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
    {term && <div className="search-results" id="university-search-results">
      {cityMatches.length > 0 && <div className="result-group">
        <span className="result-label">Cities</span>
        {cityMatches.map((city) => <a className="city-result" key={city.slug} href={`/city/${city.slug}`}>
          <span><strong>All universities in {city.name}</strong><small>{city.country}</small></span>
          <em>{city.count} {city.count === 1 ? 'university' : 'universities'} →</em>
        </a>)}
      </div>}
      {universityMatches.length > 0 && <div className="result-group">
        <span className="result-label">Universities</span>
        {universityMatches.map((u) => <a key={u.slug} href={`/gpa-calculator/${u.slug}`}>
          <span><strong>{u.name}</strong><small>{u.campus}</small></span>
          <em>{u.cityName}</em>
        </a>)}
      </div>}
      {!hasResults && <p>No matching city or university. You can request a scale from the navigation.</p>}
      {hasResults && !cities.some((city) => city.name.toLowerCase() === term) && <p className="search-help">Choose a result to continue.</p>}
    </div>}
  </div>;
}
