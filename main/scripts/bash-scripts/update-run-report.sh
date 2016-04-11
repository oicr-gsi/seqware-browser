#!/bin/bash

cd /u/mcheng/browsertest

filename="runs.txt"
while read -r line
do
	run="$line"
	qsub -cwd -b y -N Perl_${run}_Report -e error.log -o output.log -l h_vmem=8g "export PERL5LIB=/oicr/local/analysis/lib/perl/pipe/lib/perl5; export PATH=${PATH}:/oicr/local/analysis/lib/perl/pipe/bin; perl RunReport.pl ${run} > /u/mcheng/browsertest/RunLaneReports/${run}_Report.json"


	qsub -cwd -b y -N Mongo_${run}_Report -e error.log -o output.log -l h_vmem=8g -hold_jid Perl_${run}_Report "/u/mcheng/browsertest/node-v5.7.0-linux-x64/bin/node --max_old_space_size=8192 run-report.js /u/mcheng/browsertest/RunLaneReports/${run}_Report.json"
done < "$filename"


