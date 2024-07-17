#!/bin/sh
grep -c "<</Type /Page$" -R $1|awk -F':' '$2 >= 2 { print $1 }' |xargs -n1 basename|tee ./twopages.txt
