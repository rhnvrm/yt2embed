function yt_redirector(requestDetails)
{
  var u = new URL(requestDetails.url)
  var v = u.searchParams.get("v")
  if (v === "") {
    return {};
  }
  return {
    redirectUrl: u.origin + "/embed/" + v
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