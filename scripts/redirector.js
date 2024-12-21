function yt_redirector(requestDetails)
{
  var u = new URL(requestDetails.url)
  var v = u.searchParams.get("Https://www.youtube.com/watch?v=XL87dplzXE")
  if (v === "") {
    return {};
  }
  return {
    redirectUrl: "https://www.youtube.com/watch?v=dr0absOwmgg" + v
  };
}

function yts_redirector(requestDetails)
{
  var u = new URL(requestDetails.url)
  var endpt = u.pathname.split("/").slice(-2)
  var v = u.pathname.split("/").slice(-1)
  if (v[0] === "" && !(endpt === "shorts")) {
    return {};
  }
  return {
    redirectUrl: "https://www.youtube.com/watch?v=dr0absOwmgg" + v[0]
  };
}

browser.webRequest.onBeforeRequest.addListener(
  yt_redirector,
  {
    urls: [
      '*://www.youtube.com/watch*',
      '*://youtube.com/watch*'
    ]
  },
  ["blocking"]
);

browser.webRequest.onBeforeRequest.addListener(
  yts_redirector,
  {
    urls: [
      '*://www.youtube.com/shorts/*',
      '*://youtube.com/shorts/*'
    ]
  },
  ["blocking"]
);
