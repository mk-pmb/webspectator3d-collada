#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function minibundle_cli_init () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  set -e
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH"

  ./install_from_cdn.sh

  local BDL_DEST='tmp.bundle.js'
  exec 4>"$BDL_DEST"
  echo '(function bundle() {' >&4
  echo "'use strict;'" >&4
  cat -- ../src/bundle.stub.mjs >&4
  local VAL= SED= ALIAS_NEXT=
  set -- $(./install_from_cdn.sh --print-files-list)
  while [ "$#" -ge 1 ]; do
    VAL="$1"; shift
    case "$VAL" in
      '#:alias-next:'* ) ALIAS_NEXT="${VAL#*:*:}"; continue;;
      '#'* ) continue;;
    esac
    VAL="three/$VAL"
    echo D: "Add: $VAL"
    minibundle_add_module "$VAL"
    [ -z "$ALIAS_NEXT" ] || echo "MODULES['$ALIAS_NEXT'] =" \
      "MODULES.get('$VAL', '$ALIAS_NEXT');" >&4
    ALIAS_NEXT=
  done
  echo '}());' >&4
  exec 4<&-

  SED='
    0,/^[0-9]+:globalThis\./d
    s~(\{ (Æ+, ){5})(Æ+, ){10}[æ, ]*\}~\1… }~
    s~^[0-9]+:MODULES\.register\(~\n&~
    '
  SED="${SED//'Æ'/'[æ]'}"
  SED="${SED//'æ'/'A-Za-z0-9_'}"
  # echo; grep -nwFe MODULES -- "$BDL_DEST" | sed -rf <(echo "$SED"); echo
  nodejs -r "./$BDL_DEST" -p "MODULES.partial('REVISION', '', 'three')"

  mkdir --parents -- ../dist
  mv --verbose --no-target-directory -- "$BDL_DEST" ../dist/three.bundle.js
}


function minibundle_add_module () {
  local SUB="$1"; shift
  local ORIG="../node_modules/$SUB"
  local SED_PREP= SED_LATE=
  local SED_IMEX='
    /^(im|ex)port /{
      s~(\} from \x27)\./~\1'"${SUB%/*}/"'~
      s~(\} from \x27)\.\./~\1'"${SUB%/*/*}/"'~
    }
    /^export \{/{
      /\} from /{
        s~\{ ~MODULES.partial(\x27\{ ~
        s~ \} from ~ \}\x27, '"'$SUB'"',~
        s~;?$~);~
      }
      s~^export~Object.assign(NAMED_EXPORTS,~
      s~\;?$~)&~
    }
    /^import \{/{
      s~^import~const~
      s~(\} )from ~\1= MODULES.get(~
      s~;?$~, '"'$SUB'"');~
    }
    '
  local SED= VAL= "$@"

  case "$SUB" in
    *.json )
      echo -n "MODULES['$SUB'] = " >&4
      grep . -- "$ORIG" | minibundle_normwsp | sed -re '$s~$~;~' >&4
      ;;

    *.js )
      echo "MODULES.register('$SUB', function compile(NAMED_EXPORTS) {" >&4
      grep . -- "$ORIG" | minibundle_normwsp |
        sed -rf <(echo "$SED_PREP") |
        sed -rf <(echo "$SED_IMEX") |
        sed -rf <(echo "$SED_LATE") >&4
      echo '});' >&4
      ;;

    * ) echo E: "Unsupported file type: $SUB" >&2; return 4;;
  esac
  echo >&4
}


function minibundle_normwsp () {
  sed -rf <(echo '
    /^(im|ex)port \{/{
      : multiline_port
      /\}/!{N; b multiline_port}
      s~\n\s*~ ~g
    }
    ')
}








minibundle_cli_init "$@"; exit $?
