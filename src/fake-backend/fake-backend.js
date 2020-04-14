import people from "./people.json";
import planets from "./planets.json";

export function fakeAPIFetch(options) {
  console.log("options", options);
  if (options.url.includes("people")) {
    return handleFakeRequestForPeople(options.url);
  } else if (options.url.includes("planets")) {
    return handleFakeRequestForPlanets(options.url);
  }
  return Promise.resolve({});
}

function handleFakeRequestForPeople(url) {
  if (url.includes("page")) {
    return handleListRequest(url, people, "people");
  } else {
    return Promise.resolve({});
  }
}

function handleFakeRequestForPlanets(url) {
  if (url.includes("page")) {
    return handleListRequest(url, planets, "planets");
  } else {
    return Promise.resolve({});
  }
}

function handleListRequest(url, list, urlPrefix) {
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
      .map(listItem => ({
        ...listItem.fields,
        id: listItem.pk,
        url: `/${urlPrefix}/${listItem.pk}`
      })),
    next
  });
}

function wrapWithData(response) {
  return { results: response };
}

function fakeNetwork(response, delay = 1000) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res(response);
    }, delay);
  });
}
