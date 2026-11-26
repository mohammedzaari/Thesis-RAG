xquery version "3.1";
(:
  XQuery 3.1 examples on data/library-ref.xml.
  Run with BaseX, e.g.:   basex -i data/library-ref.xml queries/xquery-queries.xq
  (or paste each query in the BaseX GUI / eXist-db / Saxon).
  NOTE: these XQuery expressions were not executed in the project test environment
  (no XQuery engine there). The equivalent XPath queries in xpath-queries.md were.
:)

(: Q1 — Internships using a technology, with the company (join through ids) :)
for $r in //report[technologies/techRef/@ref = 'tech_kafka']
let $c := //company[@id = $r/internship/@companyRef]
order by xs:integer($r/@year) descending
return <stage year="{$r/@year}" company="{$c/name}">{ string($r/title) }</stage>
,

(: Q2 — Number of internships per company :)
for $r in //report
group by $cid := $r/internship/@companyRef
let $name := //company[@id = $cid]/name/string()
order by count($r) descending
return <company name="{$name}" internships="{count($r)}"/>
,

(: Q3 — Technology usage per year (trend) :)
for $r in //report
for $t in $r/technologies/techRef
group by $tech := $t/@ref/string(), $year := $r/@year/string()
order by $tech, $year
return <usage technology="{//technology[@id = $tech]/name}" year="{$year}" reports="{count($r)}"/>
,

(: Q4 — JSON output for the REST API (XQuery 3.1 maps and arrays) :)
serialize(
  map { "reports": array { for $r in //report return map {
      "id": string($r/@id), "year": xs:integer($r/@year), "title": string($r/title),
      "company": string(//company[@id = $r/internship/@companyRef]/name),
      "technologies": array { for $t in $r/technologies/techRef return string(//technology[@id = $t/@ref]/name) }
  } } },
  map { "method": "json", "indent": true() }
)
