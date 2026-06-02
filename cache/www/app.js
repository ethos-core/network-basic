fetch("api-data.json")
  .then((res) => {
    const etag = res.headers.get("ETag");
    const cacheControl = res.headers.get("Cache-Control");
    return res.json().then((data) => ({ data, etag, cacheControl }));
  })
  .then(({ data, etag, cacheControl }) => {
    document.getElementById("api-result").innerHTML =
      "<h2>API Data</h2>" +
      "<pre>" + JSON.stringify(data, null, 2) + "</pre>" +
      "<p>ETag: " + etag + "</p>" +
      "<p>Cache-Control: " + cacheControl + "</p>";
  })