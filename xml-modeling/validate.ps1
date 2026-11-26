# Windows: runs validate.sh inside a throw-away Alpine container (Docker Desktop required).
# Usage (PowerShell, from the xml-modeling folder):   .\validate.ps1
docker run --rm -v "${PWD}:/work" -w /work alpine:3.20 sh -c "apk add -q --no-cache libxml2-utils libxslt && sh validate.sh"
