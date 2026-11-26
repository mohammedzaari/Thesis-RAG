<?xml version="1.0" encoding="UTF-8"?>
<!-- Flat model (library.xml) -> printable HTML catalogue, newest first. -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/library">
    <html lang="fr">
      <head>
        <meta charset="UTF-8"/>
        <title>Catalogue des mémoires</title>
        <style>
          body { font: 15px/1.5 system-ui, sans-serif; max-width: 820px; margin: 2rem auto; color: #1c2733; }
          article { border-left: 5px solid #1f4e79; padding: .5rem 1rem; margin: 1rem 0; background: #f6f8fa; }
          article.guide { border-left-color: #8a5a00; }
          .meta { color: #55606c; font-size: .9rem; } .tag { border: 1px solid #ccd; border-radius: 9px; padding: 0 .5rem; margin-right: .3rem; font-size: .8rem; }
        </style>
      </head>
      <body>
        <h1>Catalogue des mémoires (<xsl:value-of select="count(document)"/> documents)</h1>
        <xsl:apply-templates select="document">
          <xsl:sort select="@year" data-type="number" order="descending"/>
          <xsl:sort select="title"/>
        </xsl:apply-templates>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="document">
    <article>
      <xsl:if test="@kind = 'guide'"><xsl:attribute name="class">guide</xsl:attribute></xsl:if>
      <h2><xsl:value-of select="title"/></h2>
      <p class="meta">
        <xsl:choose><xsl:when test="@kind = 'guide'">Guide</xsl:when><xsl:otherwise>Rapport</xsl:otherwise></xsl:choose>
        <xsl:text> – </xsl:text><xsl:value-of select="@year"/>
        <xsl:if test="company"> – <xsl:value-of select="company"/></xsl:if>
        <xsl:if test="author"> – <xsl:value-of select="author"/></xsl:if>
        <xsl:if test="@visibility = 'restricted'"> – accès restreint</xsl:if>
      </p>
      <xsl:if test="abstract"><p><xsl:value-of select="abstract"/></p></xsl:if>
      <p><xsl:for-each select="technologies/technology"><span class="tag"><xsl:value-of select="."/></span></xsl:for-each></p>
    </article>
  </xsl:template>
</xsl:stylesheet>
