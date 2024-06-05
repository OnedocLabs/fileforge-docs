rm -rf fern/react-print-pdf
#rm -rf fern/docs.yml
cd fern
git clone --single-branch --branch main https://github.com/OnedocLabs/react-print-pdf.git
#cd react-print-pdf
#cp ./docs/docs.yml ../docs.yml
node scripts/insert_react_print_docs.js