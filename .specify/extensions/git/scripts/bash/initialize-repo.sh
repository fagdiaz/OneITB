#!/usr/bin/env bash
# OneITB23 policy guard: repository initialization is never an automatic hook.

echo "[specify] Automatic repository initialization is disabled. Run it only after an explicit user request." >&2
exit 0
