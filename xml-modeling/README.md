# XML modelling of the thesis library

```
xml-modeling/
├── schemas/
│   ├── library.xsd          flat exchange model (identical to backend/resources/schemas/library.xsd)
│   ├── library.dtd          DTD equivalent of library.xsd
│   ├── library-ref.xsd      normalised model: catalogues + xs:key / xs:keyref
│   └── library-ref.dtd      DTD equivalent (ID / IDREF)
├── data/
│   ├── library.xml          sample, flat model          (fictional data)
│   └── library-ref.xml      sample, referential model   (fictional data)
├── invalid/                 5 broken files used as negative tests
├── transforms/              XSLT 1.0: HTML, Dublin Core, referential → flat
├── queries/                 XPath (tested) and XQuery (not executed here)
├── output/                  results of the transformations
├── validate.sh              runs every check            (Linux / macOS / WSL / Docker)
└── validate.ps1             same, through Docker         (Windows)
```

## Two models, why
| | Flat model (`library.xsd`) | Referential model (`library-ref.xsd`) |
|---|---|---|
| Purpose | **Exchange** with the API (import / export) | **Reference design**: no duplicated company or technology |
| Company / technology | Free text inside each document | Declared once, referenced by `companyRef` / `ref` |
| Integrity | Unique `id` only | `xs:key` + `xs:keyref`: a broken reference is rejected |
| Typical use | `POST /api/documents/import/xml` | Design chapter of the thesis, normalisation of aliases |

`transforms/library-ref-to-flat.xsl` converts the second into the first, so a normalised file can feed the API.

## XSD vs DTD (for the thesis)
| Criterion | DTD | XSD |
|---|---|---|
| Data types (integer, date, enumerations on elements) | None (text only) | Rich (`xs:date`, `xs:integer`, ranges, patterns) |
| Year `1990..2100`, ISO dates | Cannot be enforced | Enforced |
| Referential integrity | `ID`/`IDREF`: unique in the whole file, a reference may target **any** element | `key`/`keyref`: a reference must target the **right** catalogue |
| Namespaces | Not supported | Supported |
| Syntax | Own syntax, compact | XML itself (readable by tools, transformable by XSLT) |
| Same element name with different content in two places | Impossible (global declarations) | Possible (local declarations) |
| Security | **Can declare entities**: XXE and "billion laughs" risks | No entity declaration |

Test results: the DTD rejects `kind="novel"`, a duplicated `id` and an unknown company/technology,
but **accepts a malformed date** (`01/03/2024`) which only the XSD rejects (`validate.sh` shows it).

## Why the API refuses DOCTYPE
The back-end rejects any `<!DOCTYPE` / `<!ENTITY` before parsing (`XmlService.parseLibrary`): a DTD can define
entities that read local files or expand exponentially. DTDs are therefore used here **offline, for modelling and
teaching only**; exchanges with the API are validated by the XSD.

## Run the checks
Linux / macOS / WSL (needs `libxml2-utils` and `xsltproc`):
```bash
sh validate.sh
```
Windows (Docker Desktop, nothing to install):
```powershell
cd xml-modeling
.\validate.ps1
```
Or in VS Code, install the *XML* extension (Red Hat) and associate the schemas with the files.

Single commands:
```bash
xmllint --noout --schema schemas/library-ref.xsd data/library-ref.xml
xmllint --noout --dtdvalid schemas/library-ref.dtd data/library-ref.xml
xmllint --xpath "//report[@year='2024']/title/text()" data/library-ref.xml
xsltproc transforms/library-ref-to-html.xsl data/library-ref.xml > output/internships-by-company.html
```

## Mapping to JSON / MongoDB
| XML | JSON / MongoDB |
|---|---|
| `<document id="…" year="2024">` | `{ "externalId": "…", "year": 2024 }` |
| repeated `<keyword>` | `"keywords": [...]` |
| `<techRef ref="tech_kafka"/>` | `"technologies": ["Kafka"]` (resolved name) or a referenced `_id` |
| `xs:key` / `xs:keyref` | unique index + application check |
| XSD | zod schemas (API), Mongoose schemas |
| XSLT | mapping code (`XmlService`) |

## What was verified
- all four schemas against the sample data, and 5 invalid files rejected as expected;
- the 4 XSLT transformations executed with libxslt (lxml); the converted file is valid for `library.xsd` **and** accepted by the real `XmlService` of the API;
- the 15 XPath queries run with `xmllint`.
Not executed here: `validate.sh` itself with `xsltproc` (same libxslt engine, run through lxml instead) and the XQuery file (no XQuery engine available).
