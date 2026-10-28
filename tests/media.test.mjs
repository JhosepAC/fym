import test from 'node:test';
import assert from 'node:assert/strict';
import { mediaHref, mediaKey, mediaTitle, mediaType, mediaYear, uniqueMedia } from '../src/lib/media.ts';

test('movie and series identifiers cannot collide in a personal library',()=>{
  const movie={id:42,title:'Película',media_type:'movie'};const tv={id:42,name:'Serie',media_type:'tv'};
  assert.notEqual(mediaKey(movie),mediaKey(tv));assert.equal(uniqueMedia([movie,tv]).length,2);
});
test('TV titles without explicit media_type still link to the series route',()=>{
  const tv={id:1399,name:'Juego de tronos',first_air_date:'2011-04-17'};
  assert.equal(mediaType(tv),'tv');assert.equal(mediaHref(tv),'/series/1399');assert.equal(mediaYear(tv),'2011');
});
test('pagination removes repeated media while preserving distinct media types',()=>{
  const first={id:1,title:'A',vote_average:7};const refreshed={...first,vote_average:8};const second={id:2,title:'B'};
  assert.deepEqual(uniqueMedia([first,second,refreshed]),[refreshed,second]);assert.equal(first.vote_average,7);
});
test('missing metadata has a readable title and never an invented release year',()=>{
  const unknown={id:99};assert.equal(mediaTitle(unknown),'Título no disponible');assert.equal(mediaYear(unknown),'');assert.equal(mediaHref(unknown),'/movie/99');
});
test('search and catalog display the same title, year and destination',()=>{
  const item={id:157336,title:'Interstellar',release_date:'2014-11-05',media_type:'movie'};
  assert.equal(mediaTitle(item),'Interstellar');assert.equal(mediaYear(item),'2014');assert.equal(mediaHref(item),'/movie/157336');
});
