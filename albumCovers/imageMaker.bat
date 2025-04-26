@echo off
magick -size 500x500 xc:black -gravity center -pointsize 40 -fill white -annotate 0 "%1" %1
