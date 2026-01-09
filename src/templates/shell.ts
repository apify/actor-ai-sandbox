/**
 * Bash Scripts for Sandbox Environment
 */

/* eslint-disable no-useless-escape */

/**
 * Welcome Script Template - Runs when opening the shell
 */
export const WELCOME_SCRIPT = `#!/bin/bash

# ANSI Color Codes
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
ORANGE='\\033[38;5;208m'
NC='\\033[0m' # No Color
BOLD='\\033[1m'

# Print ASCII Art
echo -e "\${GREEN}                     *+++++++++++++++++++++      \${BLUE}**********************\${NC}"
echo -e "\${GREEN}                     *++++++++++++++++++++        \${BLUE}*********************\${NC}"
echo -e "\${GREEN}                     *+++++++++++++++++++          \${BLUE}********************\${NC}"
echo -e "\${GREEN}                     *++++++++++++++++++            \${BLUE}*******************\${NC}"
echo -e "\${GREEN}                     *++++++++++++++++                \${BLUE}*****************\${NC}"
echo -e "\${GREEN}                     *+++++++++++++++                  \${BLUE}****************\${NC}"
echo -e "\${GREEN}                     *++++++++++++++                    \${BLUE}***************\${NC}"
echo -e "\${GREEN}                     *+++++++++++++                      \${BLUE}**************\${NC}"
echo -e "\${GREEN}                     *++++++++++++                        \${BLUE}*************\${NC}"
echo -e "\${GREEN}                     *+++++++++++                          \${BLUE}************\${NC}"
echo -e "\${GREEN}                     *+++++++++                              \${BLUE}**********\${NC}"
echo -e "\${GREEN}                     *++++++++                                \${BLUE}*********\${NC}"
echo -e "\${GREEN}                     *+++++++                                  \${BLUE}********\${NC}"
echo -e "                     \${GREEN}*++++++                  \${ORANGE}+\${BLUE}                 *******"
echo -e "                     \${GREEN}*+++++                 \${ORANGE}++++\${BLUE}                 ******"
echo -e "                     \${GREEN}*+++                 \${ORANGE}++++++++\${BLUE}                 ****"
echo -e "                     \${GREEN}*++                \${ORANGE}++++++++++++\${BLUE}                ***"
echo -e "                     \${GREEN}++                \${ORANGE}+++++++++++++++\${BLUE}               **"
echo -e "\${ORANGE}                                     +++++++++++++++++++                                        "
echo -e "                                   ++++++++++++++++++++++                                       "
echo -e "                                 ++++++++++++++++++++++++++                                     "
echo -e "                               ++++++++++++++++++++++++++++++                                   "
echo -e "                              +++++++++++++++++++++++++++++++++                                 "
echo -e "                            ++++++++++++++++++++++++++++++++++++                                "
echo -e "                          ++++++++++++++++++++++++++++++++++++++++                              "
echo -e "                        ++++++++++++++++++++++++++++++++++++++++++++                            "
echo -e "                       +++++++++++++++++++++++++++++++++++++++++++++++\${NC}"

echo ""
echo -e "\${BOLD}Welcome to Apify AI Sandbox!\${NC}"
echo ""
echo -e "\${GREEN}System Info:\${NC}"
echo -e "  - Node.js: \$(node -v 2>/dev/null || echo 'not installed')"
echo -e "  - Python:  \$(python3 --version 2>&1 || echo 'not installed')"
echo -e "  - CWD:     \$(pwd)"
if [ -n "\$VIRTUAL_ENV" ]; then
    echo -e "  - Venv:    Active (\$VIRTUAL_ENV)"
fi
echo ""
echo -e "\${BLUE}Documentation:\${NC}"
echo -e "  - Git Repo:   https://github.com/apify/actor-ai-sandbox"
echo ""
`;

/**
 * Custom BashRC Template
 */
export const SANDBOX_BASHRC = `# Source global bashrc if it exists
[ -f /etc/bash.bashrc ] && . /etc/bash.bashrc
[ -f ~/.bashrc ] && . ~/.bashrc

# Set environment to match sandbox execution
export PATH="/sandbox/js-ts/node_modules/.bin:/sandbox/py/venv/bin:\$PATH"
export NODE_PATH="/sandbox/js-ts/node_modules"
export VIRTUAL_ENV="/sandbox/py/venv"
export PYTHONHOME=""

# Colorful prompt
PS1='\\[\\033[01;32m\\]apify\\[\\033[00m\\]@\\[\\033[01;34m\\]sandbox\\[\\033[00m\\]:\\[\\033[01;33m\\]\\w\\[\\033[00m\\]\\$ '

# Aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Print welcome message
if [ -f /app/welcome.sh ]; then
    bash /app/welcome.sh
fi
`;
