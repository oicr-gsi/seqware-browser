#!/bin/bash

set -eu

. ${CRON_ROOT}/functions

reenter skip

source "/oicr/cluster/etc/profile"

dir="$(sqwwhich seqware-browser-repo)"
node="$(sqwwhich seqware-browser-node)"
config_path="$(sqwwhich seqware-browser-config)"
filename="runs.txt"

cd $dir

## Make a new job for every run
while read -r line
do
	run="$line"

	qsub -cwd -b y -N Perl_${run}_Report -e error.log -o output.log -l h_vmem=8g "export PERL5LIB=/oicr/local/analysis/lib/perl/pipe/lib/perl5; export PATH=${PATH}:/oicr/local/analysis/lib/perl/pipe/bin; perl ./scripts/RunReport.pl ${run} > ./RunLaneReports/${run}_Report.json"
	qsub -cwd -b y -N Mongo_${run}_Report -e error.log -o output.log -l h_vmem=8g -hold_jid Perl_${run}_Report "export NODE_PATH=$NODE_PATH:$config_path; $node --max_old_space_size=8192 ./scripts/run-report.js ./RunLaneReports/${run}_Report.json"
done < "$filename"


