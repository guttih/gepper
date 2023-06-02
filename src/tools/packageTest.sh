#!/bin/bash

VERSION_STRING=$( grep '"version": "' package.json | cut -d'"' -f4 )
#true or false options.
options=("-h" "--help" "-install" "-uninstall")

#Options that must be followed with one argument
optionsWithArgument=("-v")

#Options that must be provided by the user
optionsRequired=()

#Set to true you want to allow any arguments to be given
#Set to false if you only want to allow options in  "options" and "optionsWithArgument"
ALLOW_UNPROCESSED="false"

printHelp() {
    printf 'Usage: %s [OPTIONS]...\n' "$(basename "$0")"
    printf 'Usage: %s [OPTIONS]... [-v <version>]\n' "$(basename "$0")"
    echo "  Builds a new package and installs it to vsCode"
    echo
    echo "OPTIONS       Option description"
    echo "  --help      Prints this help page"
    echo "  -install    Install the package to Visual Studio Code "
    echo "  -uninstall  Uninstall the package from Visual Studio Code"
    echo "  -v          Version this option must be follwed by version argument."  
    echo "              If not provided, version from package.json is used."  
    echo
    echo "ARGUMENTS     Option argument description"
    echo " version      Version on the form major.minor.patch.  Example: 1.0.1"
    echo
    exit 0
}

#Text Color commands
#Brief: Commands to change the color of a text
highlight=$(echo -en '\033[01;37m')
purpleColor=$(echo -en '\033[01;35m')
cyanColor=$(echo -en '\033[01;36m')
errorColor=$(echo -en '\033[01;31m')
warningColor=$(echo -en '\033[00;33m')
successColor=$(echo -en '\033[01;32m')
norm=$(echo -en '\033[0m')

#Function: parseOptions()
#
#Brief: Checks if all options are correct and saves each in a variable.
#After: Value of each options given, is stored in a uppercase named variable.
#       f. example -express will be stored in a global variable called EXPRESS
#Returns:
#      0 : (success) All paramters are valid
#      1 : (error) One or more parameters are invalid
#
# Usage: parseOptions  (-opts <stringArray>) [string]...
#        parseOptions  (-optsArg <stringArray>) [string]...
#        parseOptions  (-opts <stringArray> -optsArg <stringArray>) [string]...
#        parseOptions  (-opts <stringArray> -optsReq <stringArray>) [string]...
#        parseOptions  (-optsArg <stringArray> -optsReq <stringArray>) [string]...
#        parseOptions  (-opts <stringArray> -optsArg <stringArray> -optsReq <stringArray>) [string]...
# Options     Option description
#   -opts     Array of options
#   -optsArg  Array of options which take one argument
#   -optsReq  Array of required options
# Arguments      Argument description
#   stringArray  Array of options, where each option starts with '-'
#   string       Any string
#
declare -a UNPROCESSED
parseOptions() {
    containsElement() { #if function arrayContains exists, it can be used instead of containsElement
        local e match="$1"
        shift
        for e; do [[ "$e" == "$match" ]] && return 0; done
        return 1
    }

    if [[ "$1" == "-opts" ]]; then
        shift
        declare -a _options=("${!1}")
        if [ ${#_options[@]} -eq 0 ]; then
            echo "${errorColor}No options provided${norm}, quitting"
            exit 1
        fi
        shift
    fi
    if [[ "$1" == "-optsArg" ]]; then
        shift
        declare -a _optionsWithArgument=("${!1}")
        if [ ${#_optionsWithArgument[@]} -eq 0 ]; then
            echo "${errorColor}No options with arguments provided${norm}, quitting"
            exit 1
        fi
        shift
    fi
    if [[ "$1" == "-optsReq" ]]; then
        shift
        declare -a _optionsRequired=("${!1}")
        shift

    fi

    declare -a _optionsFound
    declare tmp tmpName
    while (("$#")); do # While there are arguments still to be shifted
        if containsElement "$1" "${_options[@]}"; then
            #removing prefix - and -- and assigning value to uppercased variable.
            _optionsFound+=("$1")
            tmp=${1#"-"}
            tmp=${tmp#"-"}
            tmp=$(echo "$tmp" | tr a-z A-Z)
            printf -v "$tmp" "true"
        elif containsElement "$1" "${_optionsWithArgument[@]}"; then
            #removing prefix - and -- and assigning value to uppercased variable.
            _optionsFound+=("$1")
            tmpName=$1
            tmp=${1#"-"}
            tmp=${tmp#"-"}
            tmp=$(echo "$tmp" | tr a-z A-Z)
            shift
            if [[ -z "$1" ]]; then
                echo "Value missing for $tmpName"
                return 1
            fi
            printf -v "$tmp" "$1"
        else
            if [[ "$ALLOW_UNPROCESSED" == "true" ]]; then
                UNPROCESSED+=("$1")
                _optionsFound+=("$1")
            else
                echo "${errorColor}Error: ${highlight}$1${norm} is an invalid argument."
                return 1
            fi
        fi
        shift
    done

    if [[ "${_optionsRequired[*]}" == "0" ]]; then return 0; fi
    #Check if all required options have been provided.
    for arg in "${_optionsRequired[@]}"; do
        if ! containsElement "$arg" "${_optionsFound[@]}"; then
            echo "${errorColor}Required option missing ${norm} $arg "
            return 1
        fi
    done
}

# You could test code below by running this script with these Arguments
#   ./thisScript.sh -install - ~/Downloads -weird
if ! parseOptions -opts "options[@]" -optsArg "optionsWithArgument[@]" -optsReq "optionsRequired[@]" "$@"; then exit 1; fi
if [[ -n "$HELP" || -n "$H" ]]; then printHelp; fi


if [[ -n "$V" ]]; then VERSION_STRING="$V"; fi
if [[ -z "$VERSION_STRING" ]];  then echo "${errorColor}No version string${norm}";  fi

PACKAGE_NAME="gepper-$VERSION_STRING.vsix"

if vsce package "$VERSION_STRING"; then
    echo "${highlight}Successfully created package${norm} $PACKAGE_NAME"
else
    echo "${errorColor}Unable to create package${norm}"
    exit 1
fi

if [[ -n "$INSTALL" ]]; then 
    echo "Installing package"; 
    if code --install-extension "$PACKAGE_NAME"; then
        echo -e "${successColor}Install succeed${norm}, remember to reload vscode\n  ${highlight}(ctrl+shift+p) ${norm} and select ${highlight}reload window${norm}"
    else
        echo -e "${errorColor}Installing failed${norm}"
    fi
fi

if [[ -n "$UNINSTALL" ]]; then 
    echo "${highlight}Un${norm}installing package"; 
    if code --uninstall-extension "$PACKAGE_NAME"; then
        echo -e "${successColor}Uninstall succeed${norm}, remember to reload vscode\n  ${highlight}(ctrl+shift+p) ${norm} and select ${highlight}reload window${norm}"
    else
        echo -e "${errorColor}Uninstalling failed${norm}"
    fi
fi

for arg in "${UNPROCESSED[@]}"; do
    echo "${warningColor}Unprocessed argument${norm} $arg "
done

# DIR=$(echo "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )")
# echo "Path to this script is $DIR"
# NAME=$(echo "$( basename "$1" )")
# echo "File name: $NAME"
