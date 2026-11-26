#!/bin/sh
# Validates every XML artefact and runs the XSLT transformations.
# Needs: xmllint (libxml2-utils) and xsltproc (libxslt). See README for Windows (Docker).
set -u
cd "$(dirname "$0")"
fail=0
ok()   { printf '  [ OK ] %s\n' "$1"; }
bad()  { printf '  [FAIL] %s\n' "$1"; fail=1; }

echo "== Valid documents must pass (XSD and DTD) =="
xmllint --noout --schema schemas/library.xsd     data/library.xml     2>/dev/null && ok "library.xml     / XSD" || bad "library.xml / XSD"
xmllint --noout --dtdvalid schemas/library.dtd   data/library.xml     2>/dev/null && ok "library.xml     / DTD" || bad "library.xml / DTD"
xmllint --noout --schema schemas/library-ref.xsd data/library-ref.xml 2>/dev/null && ok "library-ref.xml / XSD" || bad "library-ref.xml / XSD"
xmllint --noout --dtdvalid schemas/library-ref.dtd data/library-ref.xml 2>/dev/null && ok "library-ref.xml / DTD" || bad "library-ref.xml / DTD"

echo "== Invalid documents must be rejected =="
for f in invalid/library-bad-kind.xml invalid/library-duplicate-id.xml; do
  xmllint --noout --schema schemas/library.xsd "$f" 2>/dev/null && bad "$f accepted by XSD" || ok "$f rejected by XSD"
  xmllint --noout --dtdvalid schemas/library.dtd "$f" 2>/dev/null && bad "$f accepted by DTD" || ok "$f rejected by DTD"
done
for f in invalid/library-ref-broken-company.xml invalid/library-ref-broken-tech.xml invalid/library-ref-bad-date.xml; do
  xmllint --noout --schema schemas/library-ref.xsd "$f" 2>/dev/null && bad "$f accepted by XSD" || ok "$f rejected by XSD"
done
# The DTD detects broken references (IDREF) but not a malformed date (no data types):
for f in invalid/library-ref-broken-company.xml invalid/library-ref-broken-tech.xml; do
  xmllint --noout --dtdvalid schemas/library-ref.dtd "$f" 2>/dev/null && bad "$f accepted by DTD" || ok "$f rejected by DTD"
done
xmllint --noout --dtdvalid schemas/library-ref.dtd invalid/library-ref-bad-date.xml 2>/dev/null \
  && ok "bad date accepted by DTD (expected: a DTD has no data types)" || bad "unexpected DTD result"

echo "== XSLT transformations =="
mkdir -p output
xsltproc -o output/library.html                 transforms/library-to-html.xsl        data/library.xml     && ok "library.html"
xsltproc -o output/internships-by-company.html  transforms/library-ref-to-html.xsl    data/library-ref.xml && ok "internships-by-company.html"
xsltproc -o output/library-from-ref.xml         transforms/library-ref-to-flat.xsl    data/library-ref.xml && ok "library-from-ref.xml"
xsltproc -o output/library-dublin-core.xml      transforms/library-to-dublin-core.xsl data/library.xml     && ok "library-dublin-core.xml"
xmllint --noout --schema schemas/library.xsd output/library-from-ref.xml 2>/dev/null && ok "converted file is valid for the API (library.xsd)" || bad "converted file invalid"

[ "$fail" -eq 0 ] && echo "All checks passed." || { echo "Some checks FAILED."; exit 1; }
