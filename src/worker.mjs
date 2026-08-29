export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/feed") {
      url.pathname = "/feed/";
      return Response.redirect(url, 301);
    }

    if (url.pathname === "/feed/") {
      const rss = url.searchParams.get("type") === "rss";
      url.pathname = rss ? "/rss.xml" : "/feed/atom.xml";
      url.search = "";

      const response = await env.ASSETS.fetch(new Request(url, request));
      const headers = new Headers(response.headers);
      headers.set("Content-Type", rss
        ? "application/rss+xml; charset=utf-8"
        : "application/atom+xml; charset=utf-8");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    return env.ASSETS.fetch(request);
  }
};
