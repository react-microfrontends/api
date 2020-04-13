import people from "./people.json";

export function fakeAPIFetch(options) {
  console.log("options", options);
  if (options.url.includes("people")) {
    return handleFakeRequestForPeople(options.url);
  }
  return Promise.resolve({});
}

export function handleFakeRequestForPeople(url) {
  console.log("people", people);
  if (url.includes("page")) {
    const pageNum = 1;
    const pageSize = 10;
    return fakeNetwork(
      wrapWithData(
        people
          .slice(pageSize * (pageNum - 1), pageSize * pageNum)
          .map(person => ({
            ...person.fields,
            id: person.pk,
            url: `/people/${person.pk}`
          }))
      )
    );
  } else {
    return Promise.resolve({});
  }
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
