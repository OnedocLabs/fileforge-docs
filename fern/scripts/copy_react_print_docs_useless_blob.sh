git clone https://github.com/OnedocLabs/react-print-pdf.git
cd react-print-pdf
git branch -r | grep -v '\->' | sed "s,\x1B\[[0-9;]*[a-zA-Z],,g" | while read remote; do git branch --track "${remote#origin/}" "$remote"; done
export GIT_BLOB=$(git rev-parse ffo-48-include-documentation-for-the-react-print-library-with)

printenv



