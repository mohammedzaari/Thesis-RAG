<?xml version="1.0" encoding="UTF-8"?>
<!-- Flat model (library.xml) -> Dublin Core (OAI-DC) records for library / repository systems. -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/"
                xmlns:dc="http://purl.org/dc/elements/1.1/">
  <xsl:output method="xml" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/library">
    <records><xsl:apply-templates select="document"/></records>
  </xsl:template>

  <xsl:template match="document">
    <oai_dc:dc>
      <dc:title><xsl:value-of select="title"/></dc:title>
      <xsl:if test="author"><dc:creator><xsl:value-of select="author"/></dc:creator></xsl:if>
      <xsl:if test="supervisor"><dc:contributor><xsl:value-of select="supervisor"/></dc:contributor></xsl:if>
      <dc:date><xsl:value-of select="@year"/></dc:date>
      <xsl:if test="abstract"><dc:description><xsl:value-of select="abstract"/></dc:description></xsl:if>
      <xsl:for-each select="keywords/keyword"><dc:subject><xsl:value-of select="."/></dc:subject></xsl:for-each>
      <dc:language><xsl:value-of select="@language"/></dc:language>
      <xsl:if test="company"><dc:publisher><xsl:value-of select="company"/></dc:publisher></xsl:if>
      <dc:type><xsl:choose><xsl:when test="@kind = 'report'">Text.Thesis</xsl:when><xsl:otherwise>Text.Guide</xsl:otherwise></xsl:choose></dc:type>
      <dc:identifier><xsl:value-of select="@id"/></dc:identifier>
    </oai_dc:dc>
  </xsl:template>
</xsl:stylesheet>
