<?xml version="1.0" encoding="UTF-8"?>
<!--
  Referential model (library-ref.xml) -> HTML table.
  xsl:key resolves company and technology identifiers to readable names (a "join").
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:key name="companyById" match="company"    use="@id"/>
  <xsl:key name="techById"    match="technology" use="@id"/>

  <xsl:template match="/library">
    <html lang="fr">
      <head><meta charset="UTF-8"/><title>Stages par entreprise</title>
        <style>
          body { font: 15px/1.5 system-ui, sans-serif; max-width: 980px; margin: 2rem auto; color: #1c2733; }
          table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #ccd; padding: .4rem .6rem; text-align: left; vertical-align: top; }
          th { background: #eef1f4; }
        </style>
      </head>
      <body>
        <h1>Stages par entreprise</h1>
        <xsl:for-each select="companyCatalog/company">
          <xsl:sort select="name"/>
          <xsl:variable name="cid" select="@id"/>
          <h2><xsl:value-of select="name"/>
            <small> (<xsl:value-of select="count(/library/reports/report[internship/@companyRef = $cid])"/> stage(s))</small></h2>
          <table>
            <tr><th>Année</th><th>Rapport</th><th>Auteur</th><th>Technologies</th></tr>
            <xsl:for-each select="/library/reports/report[internship/@companyRef = $cid]">
              <xsl:sort select="@year" data-type="number" order="descending"/>
              <tr>
                <td><xsl:value-of select="@year"/></td>
                <td><xsl:value-of select="title"/></td>
                <td><xsl:value-of select="author"/></td>
                <td>
                  <xsl:for-each select="technologies/techRef">
                    <xsl:value-of select="key('techById', @ref)/name"/>
                    <xsl:if test="position() != last()">, </xsl:if>
                  </xsl:for-each>
                </td>
              </tr>
            </xsl:for-each>
          </table>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
