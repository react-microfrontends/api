import people from "./people.json";
import planets from "./planets.json";
import films from "./films.json";

export function fakeAPIFetch(options) {
  if (options.url.includes("people")) {
    return handleFakeRequestForPeople(options.url);
  } else if (options.url.includes("planets")) {
    return handleFakeRequestForPlanets(options.url);
  } else if (options.url.includes("films")) {
    return handleFakeRequestForFilms(options.url);
  }
  return Promise.resolve({});
}

function handleFakeRequestForPeople(url) {
  if (url.includes("page")) {
    return handleListRequest(url, people, modifyPerson);
  } else {
    return handleIndividualRequest(url, people, modifyPerson);
  }
}

function handleFakeRequestForPlanets(url) {
  if (url.includes("page")) {
    return handleListRequest(url, planets, modifyPlanet);
  } else {
    return handleIndividualRequest(url, planets, modifyPlanet);
  }
}

function handleFakeRequestForFilms(url) {
  if (url.includes("page")) {
    return handleListRequest(url, films);
  } else {
    return handleIndividualRequest(url, films);
  }
}

function getFilmsThatMatchId(id, key) {
  return films.reduce((matchingFilms, film) => {
    const array = film.fields[key];
    if (array && array.includes && array.includes(parseInt(id))) {
      matchingFilms.push(`${film.pk}`);
    }
    return matchingFilms;
  }, []);
}

function getPeopleThatMatchPlanet(planetId) {
  return people.reduce((acc, person) => {
    if (person.fields.homeworld === parseInt(planetId)) {
      acc.push(`${person.pk}`);
    }
    return acc;
  }, []);
}

function modifyPerson(person) {
  const films = getFilmsThatMatchId(person.id, "characters");
  return {
    ...person,
    homeworld: `${person.homeworld}`,
    films,
  };
}

function modifyPlanet(planet) {
  const films = getFilmsThatMatchId(planet.id, "planets");
  const residents = getPeopleThatMatchPlanet(planet.id);
  return {
    ...planet,
    films,
    residents,
  };
}

function getIndividualThing(id, list) {
  return list[id - 1]; // right now the lists are ordered so that index === id - 1
}

function handleIndividualRequest(url, list, modifierFn) {
  const regex = /[0-9+]/;
  const match = regex.exec(url);
  const id = match.length === 1 ? parseInt(match) : 1;
  const thing = getIndividualThing(id, list);
  const base = { id: `${thing.pk}`, ...thing.fields };
  let response;
  if (modifierFn) {
    response = modifierFn(base);
  } else {
    response = base;
  }
  return fakeNetwork(response);
}

function handleListRequest(url, list, modifierFn) {
  const regex = /[0-9+]/;
  const match = regex.exec(url);
  const pageNum = match.length === 1 ? parseInt(match) : 1;
  const pageSize = 10;
  const startingIndex = pageSize * (pageNum - 1);
  const endingIndex = pageSize * pageNum;
  const next = endingIndex < list.length;
  return fakeNetwork({
    results: list
      .slice(pageSize * (pageNum - 1), pageSize * pageNum)
      .map((listItem) => {
        const standardModifications = turnObjectIntoFakeApiResponse(listItem);
        if (modifierFn) {
          return modifierFn(standardModifications);
        } else {
          return standardModifications;
        }
      }),
    next,
  });
}

function turnObjectIntoFakeApiResponse(obj) {
  return {
    ...obj.fields,
    id: `${obj.pk}`,
    url: `${obj.model.split(".")[1]}/${obj.pk}`,
  };
}

function wrapWithData(response) {
  return { results: response };
}

function fakeNetwork(response, delay = 100) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res(response);
    }, delay);
  });
}
