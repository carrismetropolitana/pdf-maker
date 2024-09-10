#!/bin/bash
echo https://storage.carrismetropolitana.pt/static/pdfs/$1
rsync -P $1 cmet-storage:/opt/app/static/pdfs/$1
echo Done
