set -e

PROJECT_ROOT="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )/.." &> /dev/null && pwd 2> /dev/null; )";

function normalize_root_directory {
  cd "${PROJECT_ROOT}"
}

function load_dotenv_files {
  if [ -f ".env" ]; then
    . $PROJECT_ROOT/.env
  fi
  if [ -f ".env.local" ]; then
    . $PROJECT_ROOT/.env.local
  fi
}

function check_environment_specified {
  if [[ -z "${ENVIRONMENT_NAME}" ]]; then
    echo "❌ You must select an environment with: ./bin/env <NAME>"
    exit 1
  fi
}

function load_environment_config {
  load_config_file "${PROJECT_ROOT}/.env"
  load_config_file "${PROJECT_ROOT}.env.local"
}

function load_config_file {
  local env_file=$1

  local old_IFS=${IFS}
  IFS=$'\n'

  if [[ -f $env_file ]]; then
    for line in $(grep -o '^[^#]*' "${env_file}"); do
      if [[ $line =~ [a-zA-Z_]=.* ]]; then
        export ${line}
      fi
    done
  fi

  IFS=${old_IFS}
}

current_directory=$(pwd)
normalize_root_directory
load_environment_config

if [[ ! ${SUPPRESS_ENV_CHECK} ]]; then
  check_environment_specified
fi

if [[ ${PRESERVE_CURRENT_DIRECTORY} ]]; then
  cd "${current_directory}"
fi
