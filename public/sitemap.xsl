<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="sitemap">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>Sitemap - TRIPLE H PLANDRAFT &amp; ENGINEERING</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          header {
            background: linear-gradient(135deg, #1e293b, #0f172a);
            border-bottom: 1px solid #d97706;
            padding: 2rem 1.5rem;
            text-align: center;
          }
          header h1 {
            font-size: 1.75rem;
            color: #d97706;
            letter-spacing: 0.05em;
          }
          header p {
            color: #94a3b8;
            margin-top: 0.5rem;
            font-size: 0.95rem;
          }
          header .count {
            display: inline-block;
            background: #d97706;
            color: #0f172a;
            font-weight: 700;
            padding: 0.15rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.85rem;
            margin-left: 0.5rem;
          }
          main {
            flex: 1;
            max-width: 900px;
            margin: 2rem auto;
            padding: 0 1.5rem;
            width: 100%;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: #1e293b;
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0,0,0,0.3);
          }
          th {
            background: #d97706;
            color: #0f172a;
            font-weight: 600;
            text-align: left;
            padding: 0.85rem 1rem;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #334155;
            font-size: 0.9rem;
          }
          tr:last-child td { border-bottom: none; }
          tr:hover td { background: #334155; }
          .url-cell {
            max-width: 400px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .url-cell a {
            color: #60a5fa;
            text-decoration: none;
          }
          .url-cell a:hover { text-decoration: underline; color: #93c5fd; }
          .priority { font-weight: 600; }
          .priority-1 { color: #22c55e; }
          .priority-2 { color: #a3e635; }
          .priority-3 { color: #facc15; }
          .priority-4 { color: #fb923c; }
          .priority-5 { color: #ef4444; }
          .freq {
            display: inline-block;
            padding: 0.15rem 0.6rem;
            border-radius: 9999px;
            font-size: 0.8rem;
            font-weight: 500;
          }
          .freq-always { background: #22c55e20; color: #22c55e; }
          .freq-hourly { background: #a3e63520; color: #a3e635; }
          .freq-daily { background: #facc1520; color: #facc15; }
          .freq-weekly { background: #fb923c20; color: #fb923c; }
          .freq-monthly { background: #60a5fa20; color: #60a5fa; }
          .freq-yearly { background: #94a3b820; color: #94a3b8; }
          .freq-never { background: #ef444420; color: #ef4444; }
          .date { color: #94a3b8; font-size: 0.85rem; }
          footer {
            text-align: center;
            padding: 1.5rem;
            color: #64748b;
            font-size: 0.85rem;
            border-top: 1px solid #1e293b;
          }
          footer a { color: #d97706; text-decoration: none; }
          footer a:hover { text-decoration: underline; }
          @media (max-width: 640px) {
            .date-col, .freq-col { display: none; }
            th, td { padding: 0.6rem 0.75rem; }
          }
        </style>
      </head>
      <body>
        <header>
          <h1>Sitemap <xsl:value-of select="count(//sitemap:url)"/></h1>
          <p>TRIPLE H PLANDRAFT &amp; ENGINEERING — All publicly accessible pages</p>
        </header>
        <main>
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th class="freq-col">Frequency</th>
                <th class="date-col">Last Modified</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="//sitemap:url">
                <tr>
                  <td class="url-cell">
                    <a href="{sitemap:loc}" target="_blank" rel="noopener">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td class="freq-col">
                    <span class="freq freq-{sitemap:changefreq}">
                      <xsl:value-of select="sitemap:changefreq"/>
                    </span>
                  </td>
                  <td class="date-col">
                    <span class="date">
                      <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/>
                    </span>
                  </td>
                  <td>
                    <span class="priority">
                      <xsl:attribute name="class">
                        <xsl:text>priority priority-</xsl:text>
                        <xsl:choose>
                          <xsl:when test="sitemap:priority &gt;= 1">1</xsl:when>
                          <xsl:when test="sitemap:priority &gt;= 0.8">2</xsl:when>
                          <xsl:when test="sitemap:priority &gt;= 0.6">3</xsl:when>
                          <xsl:when test="sitemap:priority &gt;= 0.4">4</xsl:when>
                          <xsl:otherwise>5</xsl:otherwise>
                        </xsl:choose>
                      </xsl:attribute>
                      <xsl:value-of select="sitemap:priority"/>
                    </span>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </main>
        <footer>
          <a href="/">← Back to TRIPLE H PLANDRAFT &amp; ENGINEERING</a>
        </footer>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
