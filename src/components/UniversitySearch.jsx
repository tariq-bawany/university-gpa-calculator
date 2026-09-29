import React, { useMemo, useState } from 'react';

export default function UniversitySearch({ universities }) {
  const [query, setQuery] = useState('');
  const term = query.trim().toLowerCase();

  const places = useMemo(() => {
    const cities = new Map(), countries = new Map();
    universities.forEach((u) => {
      if (!cities.has(u.city)) cities.set(u.city,{slug:u.city,name:u.cityName,country:u.countryName,count:0});
      cities.get(u.city).count++;
      if (!countries.has(u.country)) countries.set(u.country,{slug:u.country,name:u.countryName,count:0});
      countries.get(u.country).count++;
    });
    return {cities:[...cities.values()],countries:[...countries.values()]};
  }, [universities]);

  const countryMatches=term?places.countries.filter(x=>x.name.toLowerCase().includes(term)).slice(0,3):[];
  const cityMatches=term?places.cities.filter(x=>`${x.name} ${x.country}`.toLowerCase().includes(term)).slice(0,3):[];
  const universityMatches=term?universities.filter(u=>`${u.name} ${u.campus} ${u.cityName} ${u.countryName}`.toLowerCase().includes(term)).slice(0,6):[];
  const exactCountry=places.countries.find(x=>x.name.toLowerCase()===term);
  const exactCity=places.cities.find(x=>x.name.toLowerCase()===term);
  const exactUniversity=universities.find(u=>u.name.toLowerCase()===term||`${u.name} ${u.cityName}`.toLowerCase()===term);
  const hasResults=countryMatches.length||cityMatches.length||universityMatches.length;

  function handleKeyDown(event){if(event.key!=='Enter')return;if(exactCountry)window.location.href=`/country/${exactCountry.slug}`;else if(exactCity)window.location.href=`/city/${exactCity.slug}`;else if(exactUniversity)window.location.href=`/gpa-calculator/${exactUniversity.slug}`;}
  const Group=({label,children})=><div className="result-group"><span className="result-label">{label}</span>{children}</div>;

  return <div className="search-shell"><span className="search-icon" aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder="Search country, city, or university" aria-label="Search countries, cities, and universities" aria-expanded={Boolean(term)} aria-controls="university-search-results"/>{query&&<button className="search-clear" onClick={()=>setQuery('')} aria-label="Clear search">×</button>}
    {term&&<div className="search-results" id="university-search-results">
      {countryMatches.length>0&&<Group label="Countries">{countryMatches.map(x=><a className="place-result" key={x.slug} href={`/country/${x.slug}`}><span><strong>All universities in {x.name}</strong><small>Country directory</small></span><em>{x.count} {x.count===1?'university':'universities'} →</em></a>)}</Group>}
      {cityMatches.length>0&&<Group label="Cities">{cityMatches.map(x=><a className="place-result" key={x.slug} href={`/city/${x.slug}`}><span><strong>All universities in {x.name}</strong><small>{x.country}</small></span><em>{x.count} {x.count===1?'university':'universities'} →</em></a>)}</Group>}
      {universityMatches.length>0&&<Group label="Universities">{universityMatches.map(u=><a key={u.slug} href={`/gpa-calculator/${u.slug}`}><span><strong>{u.name}</strong><small>{u.campus}</small></span><em>{u.cityName}</em></a>)}</Group>}
      {!hasResults&&<p>No matching country, city, or university. You can request a scale from the navigation.</p>}
      {hasResults&&!exactCountry&&!exactCity&&!exactUniversity&&<p className="search-help">Choose a result to continue.</p>}
    </div>}
  </div>;
}
