mkdir -p tmp
mkdir -p tmp/orig
cd tmp/orig
unzip ../../$1
cd ..

lines="4702 4704 4705 4706 4707 4501 4504 4600"
mkdir -p byLine
for l in $lines ;
do
  mkdir -p byLine/$l
  files=$(find orig |grep "\-$l\-")
  cp $files byLine/$l
done


mkdir -p byStop
for f in $(find byLine -type f )
do
  stop="$(echo $f | grep -Eo "[0-9]{6}")"
  mkdir -p byStop/$stop
  cp $f byStop/$stop
done

zip ../organizedByLineAndStop.zip byStop byLine -r