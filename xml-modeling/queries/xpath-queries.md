# XPath 1.0 queries (tested with `xmllint --xpath`)

Run on `data/library-ref.xml`:
```bash
xmllint --xpath "<expression>" data/library-ref.xml
```

| # | Question | XPath |
|---|---|---|
| 1 | Titles of all reports | `//report/title/text()` |
| 2 | Reports of 2024 | `//report[@year='2024']/title/text()` |
| 3 | Number of reports | `count(//report)` |
| 4 | Restricted reports | `//report[@visibility='restricted']/@id` |
| 5 | Reports that use Docker (join through the id) | `//report[technologies/techRef/@ref='tech_docker']/title/text()` |
| 6 | Name of the company of report `rep_2023_014` | `//company[@id=//report[@id='rep_2023_014']/internship/@companyRef]/name/text()` |
| 7 | Number of internships at Atlas | `count(//report[internship/@companyRef='cmp_atlas'])` |
| 8 | Reports with at least two supervisors | `//report[count(supervisors/supervisor) >= 2]/@id` |
| 9 | Technologies of the "Data" category | `//technology[@category='Data']/name/text()` |
| 10 | Reports without abstract | `//report[not(abstract)]/@id` |
| 11 | Internships ending after 1 June 2024 (XPath 1.0 cannot compare dates as text: strip the dashes to get a number) | `//internship[translate(endDate,'-','') > 20240601]/@companyRef` |
| 12 | Technology names containing "js" (case sensitive) | `//technology[contains(name,'js')]/name/text()` |

Run on the flat model `data/library.xml`:

| # | Question | XPath |
|---|---|---|
| 13 | Guides only | `//document[@kind='guide']/title/text()` |
| 14 | Documents using Kafka | `//document[technologies/technology='Kafka']/@id` |
| 15 | Last document of the file | `//document[last()]/@id` |

> **XPath 1.0 vs 2.0**: with `>` / `<`, XPath 1.0 converts both sides to numbers, so `endDate > '2024-06-01'`
> is always false (`NaN`). XPath 2.0 / XQuery handle it with `xs:date(endDate) > xs:date('2024-06-01')`.
