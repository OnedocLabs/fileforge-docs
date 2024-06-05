rm -rf fern/react-print-pdf
#rm -rf fern/docs.yml
cd fern
git clone --single-branch --branch ffo-48-include-documentation-for-the-react-print-library-with https://github.com/OnedocLabs/react-print-pdf.git
#cd react-print-pdf
#cp ./docs/docs.yml ../docs.yml
node scripts/insert_react_print_docs.js