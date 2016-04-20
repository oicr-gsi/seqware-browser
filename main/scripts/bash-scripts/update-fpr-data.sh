#!/bin/bash
set -eu

. ${CRON_ROOT}/functions

reenter skip

source "/oicr/cluster/etc/profile"

dir="$(sqwwhich seqware-browser-repo)"
node="$(sqwwhich seqware-browser-node)"
config_path="$(sqwwhich seqware-browser-config)"

cd $dir

# Set Node module path to config
if [ -z "${NODE_PATH:-}" ]; then # unset
	NODE_PATH=$config_path
else
	NODE_PATH=$NODE_PATH:$config_path
fi

## Parse File Provenance Report
qsub -cwd -b y -N PerlFPR -e error.log -o output.log -l h_vmem=8g "export PERL5LIB=/oicr/local/analysis/lib/perl/pipe/lib/perl5; export PATH=${PATH}:/oicr/local/analysis/lib/perl/pipe/bin; perl fpr-json.pl /.mounts/labs/seqprodbio/private/backups/sqwprod-db.hpc.oicr.on.ca/seqware_files_report_latest.gz"

qsub -cwd -b y -N WorkflowFiles -hold_jid PerlFPR -e error.log -o output.log -l h_vmem=8g "export NODE_PATH=$NODE_PATH; $node --max_old_space_size=8192 ./scripts/fpr-file.js ./fpr-output/fpr-File.json"
qsub -cwd -b y -N ReportData -hold_jid PerlFPR -e error.log -o output.log -l h_vmem=8g "export NODE_PATH=$NODE_PATH; $node --max_old_space_size=8192 ./scripts/fpr-report-data.js ./fpr-output/fpr-Library.json"
qsub -cwd -b y -N RNAReportData -hold_jid PerlFPR -e error.log -o output.log -l h_vmem=8g "export NODE_PATH=$NODE_PATH; $node --max_old_space_size=8192 ./scripts/fpr-rna-data.js ./fpr-output/fpr-Library.json"
qsub -cwd -b y -N GraphData -hold_jid PerlFPR -e error.log -o output.log -l h_vmem=8g "export NODE_PATH=$NODE_PATH; $node --max_old_space_size=8192 ./scripts/fpr-graph-data.js ./fpr-output/fpr-Library.json"