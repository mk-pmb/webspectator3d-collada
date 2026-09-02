#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function gen_cli_init () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local TEX= SVG=
  exec < <(LANG=C sed -zre 's~\s*<~<~g; s~<image\b~\n&~g; s~</image~\n~g' \
    -- *.dae | grep -Fe '<image' | grep -oPe '<init_from>[^<>]+')
  while IFS= read -r TEX; do
    TEX="${TEX#*'>'}"
    [ -n "$TEX" ] || continue
    [ ! -f "$TEX" ] || continue
    case "$TEX" in
      /* | *../* | */.* | \
      *[^A-Za-z0-9/._-]* | \
      '' ) echo W: "skip: unsafe characters in filename: $TEX" >&2; continue;;
    esac
    echo D: "Generate placeholder: $TEX"
    SVG='
      <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
        x="0px" y="0px" width="300px" height="300px" viewBox="0 0 300 300"
        xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve">
      <defs>
        <style type="text/css">
          text {
            dominant-baseline: middle;
            fill: firebrick;
            font-family: sans-serif;
            font-size: 30px;
            text-anchor: middle;
          }
        </style>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" rx="0" ry="0"
        stroke="dimgrey" stroke-width="10px" fill="darkgrey" />
      <text x="50%" y="40%">Missing texture:</text>
      <text x="50%" y="60%">'"$(basename -- "$TEX")"'</text>
      </svg>'
    SVG="${SVG//"${SVG%%<*}"/$'\n'}"
    mkdir --parents -- "$(dirname -- "./$TEX")"
    convert <(echo "${SVG#$'\n'}") "$TEX" || return $?
    echo "$SVG" >>"$TEX" || return $?
  done
}




gen_cli_init "$@"; exit $?
