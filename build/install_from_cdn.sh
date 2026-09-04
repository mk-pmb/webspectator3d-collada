#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function cdnget_cli_init () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local CDN_FILES=(
    # In bundle order = order of dependency!
    package.json
    build/three.core.js
    '#:alias-next:three'
    build/three.module.js
    examples/jsm/controls/PointerLockControls.js
    examples/jsm/loaders/TGALoader.js
    examples/jsm/loaders/collada/ColladaParser.js
    examples/jsm/loaders/collada/ColladaComposer.js
    examples/jsm/loaders/ColladaLoader.js
    )
  case "$1" in
    --print-files-list ) printf -- '%s\n' "${CDN_FILES[@]}"; return 0;;
  esac

  local REPO_DIR="$(readlink -m -- "$BASH_SOURCE"/../..)"
  cd -- "$REPO_DIR" || return $?
  local DEP_NAME='three'
  local VERSION="$(node -p "require('./package.json').dependencies.$DEP_NAME")"
  VERSION="${VERSION#'^'}"
  case "$VERSION" in
    '' | undefined ) VERSION=0.185.0;;
    [0-9]*.[0-9]*.[0-9]* ) ;;
    * )
      echo E: "Cannot find required version for $DEP_NAME (found $VERSION)" >&2
      return 4;;
  esac

  local VAL="node_modules/$DEP_NAME"
  mkdir --parents -- "$VAL"
  cd -- "$VAL" || return $?

  local CDN_BASE="https://cdn.jsdelivr.net/npm/$DEP_NAME@$VERSION"
  for VAL in "${CDN_FILES[@]}"; do
    case "$VAL" in
      '#'* ) continue;;
    esac
    cdnget_download "$VAL" || return $?
  done
}


function cdnget_download () {
  echo -n D: "Download: $1"
  if [ -f "$1" ]; then
    echo ': have. skip.'
    return 0
  fi
  echo -n ' <'
  mkdir --parents -- "$(dirname -- "$1")"
  wget --output-document="$1" -- "$CDN_BASE/$1" || return $?
}










cdnget_cli_init "$@"; exit $?
