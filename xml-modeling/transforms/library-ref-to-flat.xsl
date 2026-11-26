<?xml version="1.0" encoding="UTF-8"?>
<!--
  Referential model (library-ref.xml) -> flat exchange model (library.xsd).
  The output can be imported as is by POST /api/documents/import/xml.
  Identifiers are resolved to names; several supervisors are joined with ", ".
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" encoding="UTF-8" indent="yes"/>
  <xsl:key name="companyById" match="company"    use="@id"/>
  <xsl:key name="techById"    match="technology" use="@id"/>

  <xsl:template match="/library">
    <library>
      <xsl:for-each select="reports/report">
        <!-- the API/XSD id is an xs:string; the DTD variant needs an XML name: both are satisfied -->
        <document id="{translate(@id, '_', '-')}" kind="report" year="{@year}" language="{@language}" visibility="{@visibility}">
          <title><xsl:value-of select="title"/></title>
          <xsl:if test="abstract"><abstract><xsl:value-of select="abstract"/></abstract></xsl:if>
          <author><xsl:value-of select="author"/></author>
          <supervisor>
            <xsl:for-each select="supervisors/supervisor">
              <xsl:value-of select="."/><xsl:if test="position() != last()">, </xsl:if>
            </xsl:for-each>
          </supervisor>
          <xsl:if test="program"><program><xsl:value-of select="program"/></program></xsl:if>
          <company><xsl:value-of select="key('companyById', internship/@companyRef)/name"/></company>
          <xsl:variable name="city" select="(internship/city | key('companyById', internship/@companyRef)/city)[1]"/>
          <xsl:if test="$city"><city><xsl:value-of select="$city"/></city></xsl:if>
          <xsl:if test="keywords/keyword">
            <keywords><xsl:for-each select="keywords/keyword"><keyword><xsl:value-of select="."/></keyword></xsl:for-each></keywords>
          </xsl:if>
          <xsl:if test="technologies/techRef">
            <technologies>
              <xsl:for-each select="technologies/techRef">
                <technology><xsl:value-of select="key('techById', @ref)/name"/></technology>
              </xsl:for-each>
            </technologies>
          </xsl:if>
        </document>
      </xsl:for-each>
    </library>
  </xsl:template>
</xsl:stylesheet>
